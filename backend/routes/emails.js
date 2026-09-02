import express from 'express';
import { prisma } from '../lib/prisma.js';
import { sendEmail } from '../services/email.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import logger from '../lib/logger.js';

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/', async (req, res) => {
  try {
    const folder = req.query.folder || 'all';
    const search = req.query.search;
    const direction = req.query.direction;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const where = {};
    if (folder && folder !== 'all') where.folder = folder;
    if (direction && direction !== 'all') where.direction = direction;
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { text: { contains: search, mode: 'insensitive' } },
        { fromAddress: { contains: search, mode: 'insensitive' } },
        { toAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [emails, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.emailLog.count({ where }),
    ]);

    res.json({ emails, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    logger.error({ error: error.message }, 'Email list error');
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [inbox, sent, unread, total] = await Promise.all([
      prisma.emailLog.count({ where: { folder: 'inbox' } }),
      prisma.emailLog.count({ where: { folder: 'sent' } }),
      prisma.emailLog.count({ where: { folder: 'inbox', isRead: false } }),
      prisma.emailLog.count(),
    ]);

    res.json({ inbox, sent, unread, total });
  } catch (error) {
    logger.error({ error: error.message }, 'Email stats error');
    res.status(500).json({ error: 'Failed to fetch email stats' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const email = await prisma.emailLog.findUnique({
      where: { id: req.params.id },
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    if (!email.isRead && email.folder === 'inbox') {
      await prisma.emailLog.update({
        where: { id: req.params.id },
        data: { isRead: true },
      });
    }

    res.json(email);
  } catch (error) {
    logger.error({ error: error.message }, 'Email fetch error');
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

router.post('/send', async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'to, subject, and body are required' });
    }

    const sender = {
      email: process.env.RESEND_SENDER_EMAIL || 'noreply@kreatixtech.com',
      name: process.env.RESEND_SENDER_NAME || 'Kreatix Technologies',
    };

    const htmlBody = `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #111213; line-height: 1.6;">
        <div style="background-color: #F2782E; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <span style="color: white; font-size: 24px; font-weight: 900; letter-spacing: -1px;">KREATIX TECHNOLOGIES</span>
        </div>
        <div style="padding: 30px; background-color: #FAF9F7; border: 1px solid #EAE8E4; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="font-size: 16px;">
            ${body.replace(/\n/g, '<br>')}
          </div>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #EAE8E4; font-size: 12px; color: #9CA0A6;">
            <p style="margin: 0; font-weight: bold; color: #111213;">${sender.name}</p>
            <p style="margin: 4px 0;">Enterprise Support & Solutions</p>
            <p style="margin: 4px 0;"><a href="https://kreatixtech.com" style="color: #F2782E; text-decoration: none;">kreatixtech.com</a></p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #9CA0A6;">
          &copy; 2026 Kreatix Technologies. All rights reserved.
        </div>
      </div>
    `;

    await sendEmail({ to, subject, html: htmlBody, text: body });

    const emailLog = await prisma.emailLog.create({
      data: {
        direction: 'OUTBOUND',
        fromAddress: sender.email,
        fromName: sender.name,
        toAddress: to,
        subject,
        text: body,
        html: htmlBody,
        folder: 'sent',
        isRead: true,
        sentBy: req.user.userId,
      },
    });

    res.status(201).json(emailLog);
  } catch (error) {
    logger.error({ error: error.message }, 'Email send error');
    res.status(500).json({ error: 'Failed to send email' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.emailLog.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    logger.error({ error: error.message }, 'Email delete error');
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const { isRead } = req.body;
    await prisma.emailLog.update({
      where: { id: req.params.id },
      data: { isRead: isRead !== false },
    });
    res.json({ success: true });
  } catch (error) {
    logger.error({ error: error.message }, 'Email update error');
    res.status(500).json({ error: 'Failed to update email' });
  }
});

export default router;
