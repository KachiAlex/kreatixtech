import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../server.js';
import { io } from '../server.js';

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('Could not create uploads directory:', err.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const orgDir = path.join(uploadDir, req.user.orgId);
    if (!fs.existsSync(orgDir)) {
      fs.mkdirSync(orgDir, { recursive: true });
    }
    cb(null, orgDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

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
  storage,
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
      files.forEach(file => fs.unlinkSync(file.path));
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (req.user.role === 'CLIENT' && assessment.orgId !== req.user.orgId) {
      files.forEach(file => fs.unlinkSync(file.path));
      return res.status(403).json({ error: 'Access denied' });
    }

    const attachments = await Promise.all(
      files.map(file =>
        prisma.attachment.create({
          data: {
            assessmentId,
            fileUrl: `/uploads/${req.user.orgId}/${file.filename}`,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedBy: req.user.id
          }
        })
      )
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

      io.to(`assessment:${assessmentId}`).emit('files-uploaded', {
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
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
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
      files.forEach(file => fs.unlinkSync(file.path));
      return res.status(404).json({ error: 'Message not found' });
    }

    if (req.user.role === 'CLIENT' && message.assessment.orgId !== req.user.orgId) {
      files.forEach(file => fs.unlinkSync(file.path));
      return res.status(403).json({ error: 'Access denied' });
    }

    const attachments = await Promise.all(
      files.map(file =>
        prisma.attachment.create({
          data: {
            messageId,
            fileUrl: `/uploads/${req.user.orgId}/${file.filename}`,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedBy: req.user.id
          }
        })
      )
    );

    io.to(`assessment:${message.assessmentId}`).emit('message-files-uploaded', {
      messageId,
      attachments
    });

    res.status(201).json({
      message: `${files.length} file(s) attached to message`,
      attachments
    });
  } catch (error) {
    console.error('Upload to message error:', error);
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
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

    const filePath = path.join(process.cwd(), attachment.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.attachment.delete({
      where: { id }
    });

    io.to(`assessment:${attachment.assessmentId}`).emit('file-deleted', { id });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
