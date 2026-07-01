import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma.js';
import { getIo } from '../lib/socket.js';

const router = express.Router();
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
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

    const attachments = await Promise.all(req.files.map(file =>
      prisma.serviceAttachment.create({
        data: {
          requestId,
          fileUrl: `/uploads/${file.filename}`,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy: req.user.id,
        },
      })
    ));

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
    res.status(500).json({ error: 'Upload failed' });
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
    const filePath = path.join(uploadDir, path.basename(att.fileUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await prisma.serviceAttachment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete' }); }
});

export default router;
