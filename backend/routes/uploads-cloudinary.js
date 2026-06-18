import express from 'express';
import { upload, cloudinary } from '../config/cloudinary.js';
import { prisma } from '../server.js';
import { io } from '../server.js';

const router = express.Router();

// Cloudinary upload for assessment attachments
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

    // Create attachments with Cloudinary URLs
    const attachments = await Promise.all(
      files.map(file =>
        prisma.attachment.create({
          data: {
            assessmentId,
            fileUrl: file.path, // Cloudinary URL
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedBy: req.user.id,
            storageProvider: 'CLOUDINARY'
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
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Failed to upload files to Cloudinary' });
  }
});

// Delete file from Cloudinary
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

    // Delete from Cloudinary if stored there
    if (attachment.storageProvider === 'CLOUDINARY' && attachment.fileUrl) {
      try {
        const publicId = attachment.fileUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`kreatix-vapt/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Continue even if Cloudinary delete fails
      }
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

// Get signed URL for private files (if needed)
router.get('/:id/signed-url', async (req, res) => {
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

    // Cloudinary files are already accessible via the stored URL
    res.json({
      url: attachment.fileUrl,
      expires: null // Cloudinary URLs don't expire unless configured
    });
  } catch (error) {
    console.error('Get signed URL error:', error);
    res.status(500).json({ error: 'Failed to get file URL' });
  }
});

export default router;
