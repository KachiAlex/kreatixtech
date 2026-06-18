import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../server.js';
import { io } from '../server.js';
import { sendNewMessageEmail } from '../services/email.js';

const router = express.Router();

router.get('/assessment/:assessmentId', [
  param('assessmentId').isUUID()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { assessmentId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

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

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { 
          assessmentId,
          messageType: { not: 'INTERNAL_NOTE' }
        },
        include: {
          sender: {
            select: { id: true, name: true, role: true }
          },
          attachments: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.message.count({
        where: { 
          assessmentId,
          messageType: { not: 'INTERNAL_NOTE' }
        }
      })
    ]);

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/', [
  body('assessmentId').isUUID(),
  body('message').trim().isLength({ min: 1, max: 5000 }),
  body('messageType').isIn(['TEXT', 'STATUS_CHANGE', 'INTERNAL_NOTE']).optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { assessmentId, message, messageType = 'TEXT' } = req.body;

    const assessment = await prisma.vaptAssessment.findUnique({
      where: { id: assessmentId },
      include: { organization: true }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (req.user.role === 'CLIENT') {
      if (assessment.orgId !== req.user.orgId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      if (messageType === 'INTERNAL_NOTE') {
        return res.status(403).json({ error: 'Cannot create internal notes' });
      }
    }

    const { attachmentIds } = req.body;

    const newMessage = await prisma.message.create({
      data: {
        assessmentId,
        senderId: req.user.id,
        message,
        messageType
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true }
        },
        attachments: true
      }
    });

    // Link existing attachments to this message
    if (attachmentIds && attachmentIds.length > 0) {
      await prisma.attachment.updateMany({
        where: {
          id: { in: attachmentIds },
          assessmentId
        },
        data: { messageId: newMessage.id }
      });
    }

    const notificationRecipients = [];
    
    if (req.user.role === 'CLIENT') {
      if (assessment.assignedAdminId) {
        notificationRecipients.push(assessment.assignedAdminId);
      }
    } else {
      const orgUsers = await prisma.user.findMany({
        where: { orgId: assessment.orgId, role: 'CLIENT' },
        select: { id: true }
      });
      notificationRecipients.push(...orgUsers.map(u => u.id));
    }

    await Promise.all(
      notificationRecipients.map(userId =>
        prisma.notification.create({
          data: {
            userId,
            assessmentId,
            type: 'NEW_MESSAGE',
            title: 'New Message',
            message: `${req.user.name}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`
          }
        })
      )
    );

    io.to(`assessment:${assessmentId}`).emit('new-message', newMessage);
    io.to(`org:${assessment.orgId}`).emit('new-message', {
      assessmentId,
      message: newMessage
    });

    // Send Brevo email notification
    try {
      const emailRecipients = await prisma.user.findMany({
        where: { id: { in: notificationRecipients } },
        select: { email: true }
      });
      const recipientEmails = emailRecipients.map(u => u.email);

      if (recipientEmails.length > 0) {
        await sendNewMessageEmail({
          to: recipientEmails,
          senderName: req.user.name,
          assessmentTitle: assessment.title,
          messagePreview: message.substring(0, 200),
          assessmentId
        });
      }
    } catch (emailErr) {
      console.error('Email notification failed:', emailErr.message);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.put('/:id/read', [
  param('id').isUUID()
], async (req, res) => {
  try {
    const { id } = req.params;

    io.to(`assessment:${req.body.assessmentId}`).emit('message-read', {
      messageId: id,
      userId: req.user.id
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

router.delete('/:id', [
  param('id').isUUID()
], async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id },
      include: { assessment: true }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Can only delete your own messages' });
    }

    await prisma.message.delete({
      where: { id }
    });

    io.to(`assessment:${message.assessmentId}`).emit('message-deleted', { id });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
