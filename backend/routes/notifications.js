import express from 'express';
import { body } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { getSecurityPreferences, DEFAULT_SECURITY_NOTIFICATION_PREFERENCES } from '../lib/security-notifications.js';

const router = express.Router();

// ── Device token registration for push notifications ─────────────────────────
router.post('/device', [
  body('token').trim().isLength({ min: 10 }),
  body('platform').optional().trim(),
], async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    await prisma.deviceToken.upsert({
      where: { userId_token: { userId: req.user.id, token } },
      create: { userId: req.user.id, token, platform },
      update: { platform, updatedAt: new Date() },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Device token registration error:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

router.delete('/device', async (req, res) => {
  try {
    await prisma.deviceToken.deleteMany({
      where: { userId: req.user.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Device token removal error:', error);
    res.status(500).json({ error: 'Failed to remove device' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    const where = {
      userId: req.user.id,
      ...(unreadOnly === 'true' && { read: false })
    };

    const [notifTotal, serviceNotifTotal] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.serviceNotification.count({ where }),
    ]);
    const grandTotal = notifTotal + serviceNotifTotal;
    const totalPages = Math.max(1, Math.ceil(grandTotal / limitNum));
    const pageToUse = Math.min(pageNum, totalPages);
    const skip = (pageToUse - 1) * limitNum;
    const fetchTake = Math.min(skip + limitNum, 500);

    const [notifications, serviceNotifications, unreadCount, serviceUnreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: fetchTake
      }),
      prisma.serviceNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: fetchTake
      }),
      prisma.notification.count({
        where: { userId: req.user.id, read: false }
      }),
      prisma.serviceNotification.count({
        where: { userId: req.user.id, read: false }
      })
    ]);

    // Merge both feeds, sort newest-first, then slice this page's items.
    const merged = [...notifications, ...serviceNotifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + limitNum);

    res.json({
      notifications: merged,
      unreadCount: unreadCount + serviceUnreadCount,
      pagination: {
        page: pageToUse,
        limit: limitNum,
        total: grandTotal,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    let notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      notification = await prisma.serviceNotification.findUnique({
        where: { id }
      });
    }

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (notification.assessmentId) {
      await prisma.notification.update({
        where: { id },
        data: { read: true }
      });
    } else {
      await prisma.serviceNotification.update({
        where: { id },
        data: { read: true }
      });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.put('/read-all', async (req, res) => {
  try {
    await Promise.all([
      prisma.notification.updateMany({
        where: {
          userId: req.user.id,
          read: false
        },
        data: { read: true }
      }),
      prisma.serviceNotification.updateMany({
        where: {
          userId: req.user.id,
          read: false
        },
        data: { read: true }
      })
    ]);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      notification = await prisma.serviceNotification.findUnique({
        where: { id }
      });
    }

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (notification.assessmentId) {
      await prisma.notification.delete({
        where: { id }
      });
    } else {
      await prisma.serviceNotification.delete({
        where: { id }
      });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// ── Security notification preferences ───────────────────────────────────────
router.get('/preferences', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { notificationPreferences: true },
    });

    res.json({
      preferences: getSecurityPreferences(user),
      defaults: DEFAULT_SECURITY_NOTIFICATION_PREFERENCES,
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

router.put('/preferences', [
  body('security.monthlyDigest').optional().isBoolean(),
  body('security.immediate.critical').optional().isBoolean(),
  body('security.immediate.high').optional().isBoolean(),
  body('security.immediate.medium').optional().isBoolean(),
  body('security.immediate.low').optional().isBoolean(),
  body('security.immediate.info').optional().isBoolean(),
  body('security.immediate.unauthorizedAccess').optional().isBoolean(),
  body('security.immediate.bans').optional().isBoolean(),
  body('security.immediate.firewallChanges').optional().isBoolean(),
], async (req, res) => {
  try {
    const existing = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { notificationPreferences: true },
    });

    const current = existing?.notificationPreferences || {};
    const incoming = req.body.security || {};
    const immediate = incoming.immediate || {};

    const merged = {
      ...current,
      security: {
        monthlyDigest: incoming.monthlyDigest ?? current?.security?.monthlyDigest ?? DEFAULT_SECURITY_NOTIFICATION_PREFERENCES.monthlyDigest,
        immediate: {
          ...DEFAULT_SECURITY_NOTIFICATION_PREFERENCES.immediate,
          ...(current?.security?.immediate || {}),
          ...immediate,
        },
      },
    };

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { notificationPreferences: merged },
    });

    res.json({ preferences: getSecurityPreferences(updated) });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;
