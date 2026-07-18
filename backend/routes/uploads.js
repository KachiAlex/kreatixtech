import express from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { getIo } from '../lib/socket.js';
import { uploadBufferToR2, deleteFileFromR2 } from '../lib/r2.js';

const router = express.Router();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain', 'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
  }
});

router.post('/assessment/:assessmentId', upload.array('files', 10), async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const assessment = await prisma.vaptAssessment.findUnique({
      where: { id: assessmentId },
      include: { organization: true }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (req.user.role === 'CLIENT' && assessment.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const attachments = await Promise.all(
      files.map(async file => {
        const result = await uploadBufferToR2(file.buffer, {
          folder: `kreatix-vapt/${assessmentId}`,
          fileName: file.originalname,
          contentType: file.mimetype,
        });
        return prisma.attachment.create({
          data: {
            assessmentId,
            fileUrl: result.publicUrl,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedBy: req.user.id,
            storageProvider: 'S3'
          }
        });
      })
    );

    // Only create a FILE_UPLOAD message if not attaching to an existing message
    const skipMessage = req.query.skipMessage === 'true';
    if (!skipMessage) {
      await prisma.message.create({
        data: {
          assessmentId,
          senderId: req.user.id,
          message: `Uploaded ${files.length} file(s)`,
          messageType: 'FILE_UPLOAD'
        }
      });

      getIo().to(`assessment:${assessmentId}`).emit('files-uploaded', {
        assessmentId,
        attachments,
        uploadedBy: {
          id: req.user.id,
          name: req.user.name
        }
      });
    }

    res.status(201).json({
      message: `${files.length} file(s) uploaded successfully`,
      attachments
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

router.post('/message/:messageId', upload.array('files', 5), async (req, res) => {
  try {
    const { messageId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { assessment: true }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (req.user.role === 'CLIENT' && message.assessment.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const attachments = await Promise.all(
      files.map(async file => {
        const result = await uploadBufferToR2(file.buffer, {
          folder: `kreatix-vapt/${message.assessmentId || messageId}`,
          fileName: file.originalname,
          contentType: file.mimetype,
        });
        return prisma.attachment.create({
          data: {
            messageId,
            fileUrl: result.publicUrl,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedBy: req.user.id,
            storageProvider: 'S3'
          }
        });
      })
    );

    getIo().to(`assessment:${message.assessmentId}`).emit('message-files-uploaded', {
      messageId,
      attachments
    });

    res.status(201).json({
      message: `${files.length} file(s) attached to message`,
      attachments
    });
  } catch (error) {
    console.error('Upload to message error:', error);
    res.status(500).json({ error: 'Failed to attach files' });
  }
});

router.get('/assessment/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await prisma.vaptAssessment.findUnique({
      where: { id: assessmentId },
      select: { orgId: true }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (req.user.role === 'CLIENT' && assessment.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const attachments = await prisma.attachment.findMany({
      where: { assessmentId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(attachments);
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: { assessment: true }
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    if (req.user.role === 'CLIENT' && attachment.assessment.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (attachment.fileUrl && (attachment.fileUrl.startsWith('http') || attachment.storageProvider === 'S3')) {
      try {
        await deleteFileFromR2(attachment.fileUrl);
      } catch (r2Err) {
        console.error('R2 delete error:', r2Err);
      }
    }

    await prisma.attachment.delete({
      where: { id }
    });

    getIo().to(`assessment:${attachment.assessmentId}`).emit('file-deleted', { id });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
