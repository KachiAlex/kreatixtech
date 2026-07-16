import express from 'express';
import { body } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ── Public: track event (no auth required) ───────────────────────────────────
router.post('/track', [
  body('type').trim().isLength({ min: 1, max: 50 }),
  body('page').trim().isLength({ min: 1, max: 200 }),
  body('label').optional().trim().isLength({ max: 200 }),
  body('sessionId').optional().trim().isLength({ max: 100 }),
], async (req, res) => {
  try {
    const { type, page, label, sessionId } = req.body;

    // Derive geo info from Cloudflare/Vercel headers or fallback
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.headers['x-real-ip'] ||
               req.socket?.remoteAddress ||
               null;

    const country = req.headers['cf-ipcountry'] ||
                    req.headers['x-vercel-ip-country'] ||
                    null;
    const region = req.headers['x-vercel-ip-country-region'] ||
                   req.headers['cf-region'] ||
                   null;
    const city = req.headers['x-vercel-ip-city'] ||
                 req.headers['cf-city'] ||
                 null;

    const userAgent = req.headers['user-agent'] || null;
    const referrer = req.headers['referer'] || req.body.referrer || null;

    await prisma.analyticsEvent.create({
      data: {
        type,
        page,
        label: label || null,
        country,
        region,
        city,
        ip,
        userAgent,
        referrer,
        sessionId: sessionId || null,
      },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// ── Admin: get analytics summary ─────────────────────────────────────────────
router.get('/summary', requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const [totalViews, totalClicks, uniqueVisitors, recentEvents, topPages, topCountries, assessmentClicks] = await Promise.all([
      prisma.analyticsEvent.count({ where: { type: 'PAGE_VIEW', createdAt: { gte: since } } }),
      prisma.analyticsEvent.count({ where: { type: 'CLICK', createdAt: { gte: since } } }),
      prisma.analyticsEvent.findMany({
        where: { type: 'PAGE_VIEW', createdAt: { gte: since } },
        select: { ip: true, sessionId: true },
        distinct: ['ip', 'sessionId'],
      }),
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.analyticsEvent.groupBy({
        by: ['page'],
        where: { type: 'PAGE_VIEW', createdAt: { gte: since } },
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 10,
      }),
      prisma.analyticsEvent.groupBy({
        by: ['country'],
        where: { type: 'PAGE_VIEW', createdAt: { gte: since }, country: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 10,
      }),
      prisma.analyticsEvent.count({
        where: { type: 'CLICK', label: 'Request Assessment', createdAt: { gte: since } },
      }),
    ]);

    // Daily breakdown for chart
    const dailyData = await prisma.analyticsEvent.findMany({
      where: { type: 'PAGE_VIEW', createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyMap = {};
    dailyData.forEach(e => {
      const day = new Date(e.createdAt).toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });

    const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    res.json({
      totalViews,
      totalClicks,
      uniqueVisitors: uniqueVisitors.length,
      assessmentClicks,
      topPages: topPages.map(p => ({ page: p.page, count: p._count._all })),
      topCountries: topCountries.map(c => ({ country: c.country, count: c._count._all })),
      daily,
      recentEvents: recentEvents.map(e => ({
        id: e.id,
        type: e.type,
        page: e.page,
        label: e.label,
        country: e.country,
        city: e.city,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
