import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { getIo } from '../lib/socket.js';
import { sendNewMessageEmail } from '../services/email.js';

const router = express.Router();

router.get('/request/:requestId', [
  param('requestId').isUUID()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { requestId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      select: { orgId: true }
    });

    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (req.user.role === 'CLIENT' && request.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [messages, total] = await Promise.all([
      prisma.serviceMessage.findMany({
        where: { 
          requestId,
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
      prisma.serviceMessage.count({
        where: { 
          requestId,
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
    console.error('Get service messages error:', error);
    res.status(500).json({ error: 'Failed to fetch service messages' });
  }
});

router.post('/', [
  body('requestId').isUUID(),
  body('message').trim().isLength({ min: 1, max: 5000 }),
  body('messageType').isIn(['TEXT', 'STATUS_CHANGE', 'INTERNAL_NOTE']).optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { requestId, message, messageType = 'TEXT' } = req.body;

    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { organization: true }
    });

    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (req.user.role === 'CLIENT') {
      if (request.orgId !== req.user.orgId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      if (messageType === 'INTERNAL_NOTE') {
        return res.status(403).json({ error: 'Cannot create internal notes' });
      }
    }

    const { attachmentIds } = req.body;

    const newMessage = await prisma.serviceMessage.create({
      data: {
        requestId,
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
      await prisma.serviceAttachment.updateMany({
        where: {
          id: { in: attachmentIds },
          requestId
        },
        data: { messageId: newMessage.id }
      });
    }

    const notificationRecipients = [];
    
    if (req.user.role === 'CLIENT') {
      if (request.assignedAdminId) {
        notificationRecipients.push(request.assignedAdminId);
      }
    } else {
      const orgUsers = await prisma.user.findMany({
        where: { orgId: request.orgId, role: 'CLIENT' },
        select: { id: true }
      });
      notificationRecipients.push(...orgUsers.map(u => u.id));
    }

    await Promise.all(
      notificationRecipients.map(userId =>
        prisma.serviceNotification.create({
          data: {
            userId,
            requestId,
            type: 'NEW_MESSAGE',
            title: 'New Message',
            message: `${req.user.name}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`
          }
        })
      )
    );

    getIo().to(`request:${requestId}`).emit('new-message', newMessage);
    getIo().to(`org:${request.orgId}`).emit('new-message', {
      requestId,
      message: newMessage
    });

    // Send email notification
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
          assessmentTitle: request.title,
          messagePreview: message.substring(0, 200),
          assessmentId: requestId
        });
      }
    } catch (emailErr) {
      console.error('Resend notification failed:', emailErr.message);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Create service message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.put('/:id/read', [
  param('id').isUUID()
], async (req, res) => {
  try {
    const { id } = req.params;

    getIo().to(`request:${req.body.requestId}`).emit('message-read', {
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

    const message = await prisma.serviceMessage.findUnique({
      where: { id },
      include: { request: true }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Can only delete your own messages' });
    }

    await prisma.serviceMessage.delete({
      where: { id }
    });

    getIo().to(`request:${message.requestId}`).emit('message-deleted', { id });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete service message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
