import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id,
      ...(unreadOnly === 'true' && { read: false })
    };

    const [notifications, serviceNotifications, total, serviceTotal, unreadCount, serviceUnreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.serviceNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.notification.count({ where }),
      prisma.serviceNotification.count({ where }),
      prisma.notification.count({
        where: { userId: req.user.id, read: false }
      }),
      prisma.serviceNotification.count({
        where: { userId: req.user.id, read: false }
      })
    ]);

    // Merge and sort by createdAt desc
    const merged = [...notifications, ...serviceNotifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, parseInt(limit));

    res.json({
      notifications: merged,
      unreadCount: unreadCount + serviceUnreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total + serviceTotal,
        totalPages: Math.ceil((total + serviceTotal) / parseInt(limit))
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

export default router;
