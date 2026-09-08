import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getIo, connectedUsers } from '../lib/socket.js';
import { sendSecurityAlertEmail } from '../services/email.js';
import logger from '../lib/logger.js';

const router = express.Router();

const AGENT_SECRET = process.env.SECURITY_AGENT_SECRET || 'KreatixSecurityAgent_2026_Xy9Km';

// ── Agent: receive security report from VPS ─────────────────────────────────
router.post('/report', async (req, res) => {
  const secret = req.headers['x-agent-secret'];
  if (secret !== AGENT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized agent' });
  }

  try {
    const data = req.body;

    // Store the report
    const report = await prisma.securityReport.create({
      data: {
        hostname: data.hostname || 'vps',
        uptime: data.uptime || null,
        loadAverage: data.loadAverage || null,
        diskUsage: data.diskUsage || null,
        memoryUsage: data.memoryUsage || null,
        fail2banStats: data.fail2banStats || null,
        ufwStatus: data.ufwStatus || null,
        ufwRules: data.ufwRules || null,
        dockerPorts: data.dockerPorts || null,
        openPorts: data.openPorts || null,
        sshConfig: data.sshConfig || null,
        activeConnections: data.activeConnections || null,
        summary: data.summary || null,
      },
    });

    // Process events
    if (data.events && Array.isArray(data.events)) {
      for (const evt of data.events) {
        await prisma.securityEvent.create({
          data: {
            type: evt.type,
            severity: evt.severity || 'INFO',
            ipAddress: evt.ipAddress || null,
            country: evt.country || null,
            port: evt.port || null,
            description: evt.description,
            details: evt.details || null,
            source: 'agent',
            createdAt: evt.timestamp ? new Date(evt.timestamp) : new Date(),
          },
        }).catch(() => {});
      }
    }

    // Process banned IPs
    if (data.bannedIPs && Array.isArray(data.bannedIPs)) {
      for (const banned of data.bannedIPs) {
        const existing = await prisma.bannedIP.findFirst({
          where: { ipAddress: banned.ipAddress, active: true },
        });
        if (!existing) {
          await prisma.bannedIP.create({
            data: {
              ipAddress: banned.ipAddress,
              reason: banned.reason || 'fail2ban',
              jail: banned.jail || 'sshd',
              bannedAt: banned.bannedAt ? new Date(banned.bannedAt) : new Date(),
              banDuration: banned.duration || 3600,
              expiresAt: banned.expiresAt ? new Date(banned.expiresAt) : null,
              source: 'fail2ban',
            },
          });
        }
      }

      // Mark unbanned IPs
      const activeBanned = await prisma.bannedIP.findMany({ where: { active: true } });
      const reportedIPs = data.bannedIPs.map(b => b.ipAddress);
      for (const record of activeBanned) {
        if (!reportedIPs.includes(record.ipAddress)) {
          await prisma.bannedIP.update({
            where: { id: record.id },
            data: { active: false, unbannedAt: new Date() },
          });
        }
      }
    }

    // Clean up old reports (keep 90 days)
    await prisma.securityReport.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
    });

    // Clean up old events (keep 30 days)
    await prisma.securityEvent.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    });

    // ── Notify admins of critical/high severity events ──────────────────────
    const alertableEvents = (data.events || []).filter(
      e => e.severity === 'CRITICAL' || e.severity === 'HIGH'
    );

    if (alertableEvents.length > 0) {
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'ANALYST'] } },
        select: { id: true, email: true, name: true },
      });

      const io = getIo();

      for (const evt of alertableEvents) {
        const title = `Security Alert: ${evt.type.replace(/_/g, ' ')}`;
        const message = evt.description || `${evt.type} from ${evt.ipAddress || 'unknown'}`;

        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'SECURITY_ALERT',
              title,
              message,
            },
          }).catch(() => {});

          if (io && connectedUsers.has(admin.id)) {
            io.to(`user:${admin.id}`).emit('new-notification', {
              type: 'SECURITY_ALERT',
              title,
              message,
              severity: evt.severity,
              ipAddress: evt.ipAddress,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      const adminEmails = admins.map(a => a.email).filter(Boolean);
      if (adminEmails.length > 0) {
        sendSecurityAlertEmail({ to: adminEmails, events: alertableEvents })
          .catch(e => logger.error({ error: e.message }, 'Security alert email failed'));
      }

      logger.info({ count: alertableEvents.length }, 'Security alerts sent to admins');
    }

    res.json({ ok: true, reportId: report.id });
  } catch (err) {
    logger.error({ err }, 'Security report failed');
    res.status(500).json({ error: 'Failed to process security report' });
  }
});

// ── Admin: overview stats ───────────────────────────────────────────────────
router.get('/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      failedSSH24h,
      bans24h,
      activeBans,
      criticalEvents,
      highEvents,
      totalEvents7d,
      latestReport,
      recentEvents,
    ] = await Promise.all([
      prisma.securityEvent.count({ where: { type: 'SSH_FAILED', createdAt: { gte: last24h } } }),
      prisma.securityEvent.count({ where: { type: 'FAIL2BAN_BAN', createdAt: { gte: last24h } } }),
      prisma.bannedIP.count({ where: { active: true } }),
      prisma.securityEvent.count({ where: { severity: 'CRITICAL', createdAt: { gte: last24h } } }),
      prisma.securityEvent.count({ where: { severity: 'HIGH', createdAt: { gte: last24h } } }),
      prisma.securityEvent.count({ where: { createdAt: { gte: last7d } } }),
      prisma.securityReport.findFirst({ orderBy: { createdAt: 'desc' } }),
      prisma.securityEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      failedSSH24h,
      bans24h,
      activeBans,
      criticalEvents,
      highEvents,
      totalEvents7d,
      latestReport: latestReport ? {
        hostname: latestReport.hostname,
        createdAt: latestReport.createdAt,
        uptime: latestReport.uptime,
        loadAverage: latestReport.loadAverage,
        fail2banStats: latestReport.fail2banStats,
        ufwStatus: latestReport.ufwStatus,
        diskUsage: latestReport.diskUsage,
        memoryUsage: latestReport.memoryUsage,
        dockerPorts: latestReport.dockerPorts,
        sshConfig: latestReport.sshConfig,
        summary: latestReport.summary,
      } : null,
      recentEvents,
    });
  } catch (err) {
    logger.error({ err }, 'Security overview failed');
    res.status(500).json({ error: 'Failed to load security overview' });
  }
});

// ── Admin: event feed with pagination ───────────────────────────────────────
router.get('/events', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const type = req.query.type;
    const severity = req.query.severity;
    const resolved = req.query.resolved;

    const where = {};
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (resolved === 'true') where.resolved = true;
    if (resolved === 'false') where.resolved = false;

    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.securityEvent.count({ where }),
    ]);

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logger.error({ err }, 'Security events fetch failed');
    res.status(500).json({ error: 'Failed to load security events' });
  }
});

// ── Admin: banned IPs ───────────────────────────────────────────────────────
router.get('/banned', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const activeOnly = req.query.active !== 'false';
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const where = activeOnly ? { active: true } : {};
    const [banned, total] = await Promise.all([
      prisma.bannedIP.findMany({
        where,
        orderBy: { bannedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.bannedIP.count({ where }),
    ]);

    res.json({
      banned,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    logger.error({ err }, 'Banned IPs fetch failed');
    res.status(500).json({ error: 'Failed to load banned IPs' });
  }
});

// ── Admin: ban an IP manually ───────────────────────────────────────────────
router.post('/ban', authenticateToken, requireAdmin, [
  body('ipAddress').isIP(),
  body('reason').optional().trim().isLength({ max: 200 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { ipAddress, reason } = req.body;

    const existing = await prisma.bannedIP.findFirst({
      where: { ipAddress, active: true },
    });
    if (existing) {
      return res.json({ ok: true, message: 'IP already banned', id: existing.id });
    }

    const record = await prisma.bannedIP.create({
      data: {
        ipAddress,
        reason: reason || 'Manual ban via admin portal',
        source: 'manual',
      },
    });

    await prisma.securityEvent.create({
      data: {
        type: 'MANUAL_BAN',
        severity: 'HIGH',
        ipAddress,
        description: `IP ${ipAddress} banned manually by ${req.user.name}`,
        details: { reason: reason || 'Manual ban' },
        source: 'admin',
      },
    });

    res.json({ ok: true, id: record.id });
  } catch (err) {
    logger.error({ err }, 'Manual ban failed');
    res.status(500).json({ error: 'Failed to ban IP' });
  }
});

// ── Admin: unban an IP ──────────────────────────────────────────────────────
router.post('/unban', authenticateToken, requireAdmin, [
  body('ipAddress').isIP(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { ipAddress } = req.body;

    const record = await prisma.bannedIP.findFirst({
      where: { ipAddress, active: true },
    });
    if (!record) {
      return res.json({ ok: true, message: 'IP not currently banned' });
    }

    await prisma.bannedIP.update({
      where: { id: record.id },
      data: { active: false, unbannedAt: new Date(), unbannedBy: req.user.id },
    });

    await prisma.securityEvent.create({
      data: {
        type: 'MANUAL_UNBAN',
        severity: 'INFO',
        ipAddress,
        description: `IP ${ipAddress} unbanned by ${req.user.name}`,
        source: 'admin',
      },
    });

    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, 'Unban failed');
    res.status(500).json({ error: 'Failed to unban IP' });
  }
});

// ── Admin: resolve an event ─────────────────────────────────────────────────
router.post('/events/:id/resolve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const event = await prisma.securityEvent.findUnique({
      where: { id: req.params.id },
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    await prisma.securityEvent.update({
      where: { id: event.id },
      data: { resolved: true, resolvedAt: new Date(), resolvedBy: req.user.id },
    });

    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, 'Resolve event failed');
    res.status(500).json({ error: 'Failed to resolve event' });
  }
});

// ── Admin: get latest detailed report ───────────────────────────────────────
router.get('/report/latest', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const report = await prisma.securityReport.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (!report) return res.status(404).json({ error: 'No reports available' });
    res.json(report);
  } catch (err) {
    logger.error({ err }, 'Latest report fetch failed');
    res.status(500).json({ error: 'Failed to load report' });
  }
});

// ── Admin: event statistics (for charts) ────────────────────────────────────
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await prisma.securityEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { type: true, severity: true, createdAt: true, ipAddress: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const byDay = {};
    const byType = {};
    const bySeverity = {};
    const topIPs = {};

    for (const evt of events) {
      const day = evt.createdAt.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
      byType[evt.type] = (byType[evt.type] || 0) + 1;
      bySeverity[evt.severity] = (bySeverity[evt.severity] || 0) + 1;
      if (evt.ipAddress) {
        topIPs[evt.ipAddress] = (topIPs[evt.ipAddress] || 0) + 1;
      }
    }

    const topAttackers = Object.entries(topIPs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    res.json({
      total: events.length,
      byDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
      byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
      bySeverity: Object.entries(bySeverity).map(([severity, count]) => ({ severity, count })),
      topAttackers,
    });
  } catch (err) {
    logger.error({ err }, 'Security stats failed');
    res.status(500).json({ error: 'Failed to load security stats' });
  }
});

export default router;
