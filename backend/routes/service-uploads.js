import express from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { getIo } from '../lib/socket.js';
import { uploadBufferToR2, deleteFileFromR2 } from '../lib/r2.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

// POST /api/service-uploads/request/:requestId
router.post('/request/:requestId', upload.array('files', 10), async (req, res) => {
  try {
    const { requestId } = req.params;
    const skipMessage = req.query.skipMessage === 'true';

    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { organization: true },
    });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (req.user.role === 'CLIENT' && request.orgId !== req.user.orgId)
      return res.status(403).json({ error: 'Access denied' });
    if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });

    const attachments = await Promise.all(req.files.map(async file => {
      const result = await uploadBufferToR2(file.buffer, {
        requestId,
        fileName: file.originalname,
        contentType: file.mimetype,
      });
      return prisma.serviceAttachment.create({
        data: {
          requestId,
          fileUrl: result.publicUrl,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy: req.user.id,
          storageProvider: 'S3',
        },
      });
    }));

    if (!skipMessage) {
      const msg = await prisma.serviceMessage.create({
        data: {
          requestId,
          senderId: req.user.id,
          message: `Uploaded ${attachments.length} file(s)`,
          messageType: 'FILE_UPLOAD',
        },
        include: { sender: { select: { id: true, name: true, role: true } } },
      });
      await prisma.serviceAttachment.updateMany({
        where: { id: { in: attachments.map(a => a.id) } },
        data: { messageId: msg.id },
      });
      getIo().to(`request:${requestId}`).emit('new-message', msg);
      getIo().to(`request:${requestId}`).emit('files-uploaded', { attachments });
    }

    res.json({ attachments });
  } catch (e) {
    console.error('Service upload error:', e);
    res.status(500).json({ error: 'Upload failed', detail: e.message });
  }
});

// GET /api/service-uploads/request/:requestId
router.get('/request/:requestId', async (req, res) => {
  try {
    const request = await prisma.serviceRequest.findUnique({ where: { id: req.params.requestId }, select: { orgId: true } });
    if (!request) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'CLIENT' && request.orgId !== req.user.orgId) return res.status(403).json({ error: 'Access denied' });
    const attachments = await prisma.serviceAttachment.findMany({
      where: { requestId: req.params.requestId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(attachments);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// DELETE /api/service-uploads/:id
router.delete('/:id', async (req, res) => {
  try {
    const att = await prisma.serviceAttachment.findUnique({ where: { id: req.params.id }, include: { request: true } });
    if (!att) return res.status(404).json({ error: 'Not found' });
    if (att.uploadedBy !== req.user.id && req.user.role === 'CLIENT') return res.status(403).json({ error: 'Access denied' });

    // Delete from R2 when present
    if (att.storageProvider === 'S3' && att.fileUrl) {
      try {
        await deleteFileFromR2(att.fileUrl);
      } catch (r2Err) {
        console.error('R2 delete error:', r2Err);
      }
    }

    await prisma.serviceAttachment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete' }); }
});

export default router;
