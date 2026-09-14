import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getIo, connectedUsers } from '../lib/socket.js';
import { sendSecurityAlertEmail } from '../services/email.js';
import logger from '../lib/logger.js';
import {
  getSecurityPreferences,
  isUnauthorizedAccess,
  filterEventsForUser,
} from '../lib/security-notifications.js';

const router = express.Router();

// The agent secret MUST be set in the environment (SECURITY_AGENT_SECRET).
// There is deliberately NO hard-coded fallback: if it is not configured,
// the agent cannot report events.
const AGENT_SECRET = process.env.SECURITY_AGENT_SECRET || '';

const AUTHORIZED_SSH_IPS = (process.env.AUTHORIZED_SSH_IPS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// ── IP Enrichment ────────────────────────────────────────────────────────────
const ipEnrichmentCache = new Map();

async function enrichIP(ip) {
  if (!ip || ipEnrichmentCache.has(ip)) {
    return ipEnrichmentCache.get(ip) || {};
  }
  try {
    const url = `http://ip-api.com/json/${ip}?fields=status,country,city,isp,as,reverse,proxy`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await resp.json();
    if (data.status === 'success') {
      const enriched = {
        country: data.country || null,
        city: data.city || null,
        isp: data.isp || null,
        asn: data.as || null,
        reverseDns: data.reverse || null,
        isProxy: data.proxy || false,
      };
      ipEnrichmentCache.set(ip, enriched);
      return enriched;
    }
  } catch (e) { /* timeout or error, skip enrichment */ }
  ipEnrichmentCache.set(ip, {});
  return {};
}

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
        let enriched = {};
        if (evt.ipAddress) {
          enriched = await enrichIP(evt.ipAddress);
        }

        // Detect successful SSH logins from unknown IPs as unauthorized access
        let details = evt.details || {};
        let severity = evt.severity || 'INFO';
        if (evt.type === 'SSH_SUCCESS' && evt.ipAddress && AUTHORIZED_SSH_IPS.length > 0 && !AUTHORIZED_SSH_IPS.includes(evt.ipAddress)) {
          details = { ...details, unauthorized: true };
          if (severity !== 'CRITICAL') severity = 'HIGH';
        }

        // Update the raw event so downstream notification logic uses the same values
        evt.severity = severity;
        evt.details = details;

        await prisma.securityEvent.create({
          data: {
            type: evt.type,
            severity,
            ipAddress: evt.ipAddress || null,
            country: enriched.country || evt.country || null,
            city: enriched.city || null,
            isp: enriched.isp || null,
            asn: enriched.asn || null,
            reverseDns: enriched.reverseDns || null,
            isProxy: enriched.isProxy || null,
            port: evt.port || null,
            description: evt.description,
            details,
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

    // ── Notify admins based on their security notification preferences ─────
    const rawEvents = data.events || [];
    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'ANALYST'] } },
      select: { id: true, email: true, name: true, notificationPreferences: true },
    });

    const io = getIo();

    for (const admin of admins) {
      const prefs = getSecurityPreferences(admin);
      const matchingEvents = filterEventsForUser(rawEvents, prefs);

      if (matchingEvents.length === 0) continue;

      // In-app notifications and socket events for this admin only
      for (const evt of matchingEvents) {
        const title = `Security Alert: ${evt.type.replace(/_/g, ' ')}`;
        const message = evt.description || `${evt.type} from ${evt.ipAddress || 'unknown'}`;

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

      // Send one consolidated email per admin with only the events they care about
      if (admin.email) {
        sendSecurityAlertEmail({ to: admin.email, events: matchingEvents })
          .catch(e => logger.error({ error: e.message }, 'Security alert email failed'));
      }
    }

    logger.info({ adminCount: admins.length }, 'Security alert notifications processed');

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

// ── Admin: trace IP (detailed intelligence) ─────────────────────────────────
router.get('/trace/:ip', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { ip } = req.params;
    const enriched = await enrichIP(ip);

    // Get all events from this IP
    const events = await prisma.securityEvent.findMany({
      where: { ipAddress: ip },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Check if currently banned
    const banned = await prisma.bannedIP.findFirst({
      where: { ipAddress: ip, active: true },
    });

    res.json({
      ip,
      ...enriched,
      eventCount: events.length,
      isBanned: !!banned,
      banInfo: banned,
      recentEvents: events.map(e => ({
        id: e.id,
        type: e.type,
        severity: e.severity,
        description: e.description,
        createdAt: e.createdAt,
      })),
    });
  } catch (err) {
    logger.error({ err }, 'IP trace failed');
    res.status(500).json({ error: 'Failed to trace IP' });
  }
});

// ── Admin: run vulnerability scan ───────────────────────────────────────────
router.post('/scan', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const scan = await prisma.securityScan.create({
      data: {
        hostname: 'vps3542507',
        status: 'running',
        initiatedBy: req.user.name,
      },
    });

    // Run scan asynchronously
    runSecurityScan(scan.id).catch(e => {
      logger.error({ error: e.message, scanId: scan.id }, 'Security scan failed');
    });

    res.json({ ok: true, scanId: scan.id, message: 'Scan started' });
  } catch (err) {
    logger.error({ err }, 'Scan initiation failed');
    res.status(500).json({ error: 'Failed to start scan' });
  }
});

// ── Admin: get scan status / results ────────────────────────────────────────
router.get('/scan/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const scan = await prisma.securityScan.findUnique({
      where: { id: req.params.id },
    });
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    res.json(scan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scan' });
  }
});

// ── Admin: list scan history ────────────────────────────────────────────────
router.get('/scans', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const scans = await prisma.securityScan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json({ scans });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list scans' });
  }
});

// ── Admin: export security report as DOCX ──────────────────────────────────
router.get('/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
            WidthType, HeadingLevel, AlignmentType, BorderStyle,
            PageBreak, Header, Footer, PageNumber } = await import('docx');

    const [latestReport, events, bannedIPs, stats, latestScan] = await Promise.all([
      prisma.securityReport.findFirst({ orderBy: { createdAt: 'desc' } }),
      prisma.securityEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.bannedIP.findMany({ where: { active: true }, orderBy: { bannedAt: 'desc' } }),
      prisma.securityEvent.count(),
      prisma.securityScan.findFirst({ where: { status: 'completed' }, orderBy: { createdAt: 'desc' } }),
    ]);

    const now = new Date();
    const f2b = latestReport?.fail2banStats || {};
    const ssh = latestReport?.sshConfig || {};
    const disk = latestReport?.diskUsage || {};
    const mem = latestReport?.memoryUsage || {};

    const severityColors = {
      CRITICAL: 'C43C36', HIGH: 'E0641C', MEDIUM: 'F2B441', LOW: '3B82F6', INFO: '6B6F76'
    };

    function heading(text, level = HeadingLevel.HEADING_1) {
      return new Paragraph({ heading: level, children: [new TextRun({ text, bold: true, color: 'F2782E' })] });
    }

    function para(text, opts = {}) {
      return new Paragraph({ children: [new TextRun({ text, ...opts })] });
    }

    function tableRow(cells, isHeader = false) {
      return new TableRow({
        children: cells.map(c => new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: String(c), bold: isHeader, size: 18 })] })],
          width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
        })),
      });
    }

    const doc = new Document({
      sections: [{
        properties: {},
        headers: { default: new Header({ children: [para('Kreatix Technologies — Security Report', { size: 16, color: '6B6F76' })] }) },
        footers: { default: new Footer({ children: [new Paragraph({ children: [new TextRun({ text: 'Generated ', size: 16, color: '6B6F76' }), new TextRun({ children: [PageNumber.CURRENT], size: 16 }), new TextRun({ text: ' of ', size: 16, color: '6B6F76' }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16 })] })] }) },
        children: [
          // Cover
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2000 } }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'VPS SECURITY REPORT', bold: true, size: 56, color: 'F2782E' })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: 'Kreatix Technologies', size: 32, color: '0E0E0F' })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), size: 24, color: '6B6F76' })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: now.toLocaleTimeString('en-US'), size: 20, color: '6B6F76' })] }),
          new Paragraph({ children: [new PageBreak()] }),

          // Executive Summary
          heading('1. Executive Summary'),
          para(`Hostname: ${latestReport?.hostname || 'N/A'}`),
          para(`Uptime: ${latestReport?.uptime || 'N/A'}`),
          para(`Firewall Status: ${latestReport?.ufwStatus || 'Unknown'}`),
          para(`Total Security Events: ${stats}`),
          para(`Active IP Bans: ${bannedIPs.length}`),
          para(`Fail2ban Currently Banned: ${f2b.currentlyBanned ?? 'N/A'}`),
          para(`Fail2ban Total Banned: ${f2b.totalBanned ?? 'N/A'}`),
          para(''),

          // System Status
          heading('2. System Status'),
          heading('2.1 SSH Configuration', HeadingLevel.HEADING_2),
          para(`Password Authentication: ${ssh.passwordAuth || 'Unknown'}`),
          para(`Permit Root Login: ${ssh.permitRootLogin || 'Unknown'}`),
          para(`Max Auth Tries: ${ssh.maxAuthTries || 'Default'}`),
          para(`Authorized Keys: ${ssh.authorizedKeysCount ?? 0} key(s)`),
          para(`authorized_keys2: ${ssh.authorizedKeys2Exists ? 'EXISTS (WARNING)' : 'Not present (OK)'}`),
          para(''),
          heading('2.2 Disk & Memory', HeadingLevel.HEADING_2),
          para(`Disk Usage: ${disk.usePercent || 'N/A'} (${disk.used || '?'} used of ${disk.total || '?'})`),
          para(`Memory: ${mem.used ? `${mem.used} MB / ${mem.total} MB` : 'N/A'}`),
          para(''),
          heading('2.3 Fail2ban', HeadingLevel.HEADING_2),
          para(`Currently Banned: ${f2b.currentlyBanned ?? 'N/A'}`),
          para(`Currently Failed: ${f2b.currentlyFailed ?? 'N/A'}`),
          para(`Total Banned: ${f2b.totalBanned ?? 'N/A'}`),
          para(`Active Jails: ${f2b.jails || 'N/A'}`),
          para(''),

          // Scan Results (if available)
          ...(latestScan ? [
            heading('3. Vulnerability Scan Results'),
            para(`Scan Date: ${new Date(latestScan.createdAt).toLocaleString()}`),
            para(`Security Score: ${latestScan.securityScore ?? 'N/A'}/100`),
            para(`Duration: ${latestScan.duration ?? 'N/A'}s`),
            para(''),
            ...(latestScan.findings ? [
              heading('3.1 Findings', HeadingLevel.HEADING_2),
              ...latestScan.findings.map(f => para(`• [${f.severity}] ${f.title}: ${f.description}`)),
              para(''),
            ] : []),
            ...(latestScan.recommendations ? [
              heading('3.2 Recommendations', HeadingLevel.HEADING_2),
              ...latestScan.recommendations.map(r => para(`• ${r}`)),
              para(''),
            ] : []),
          ] : [heading('3. Vulnerability Scan Results'), para('No scan has been run yet.'), para('')]),

          // Threat Feed
          heading('4. Recent Security Events'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              tableRow(['Date', 'Type', 'Severity', 'IP Address', 'Description'], true),
              ...events.slice(0, 50).map(e => tableRow([
                new Date(e.createdAt).toLocaleString(),
                e.type.replace(/_/g, ' '),
                e.severity,
                e.ipAddress || '—',
                e.description.substring(0, 80),
              ])),
            ],
          }),
          para(''),

          // Banned IPs
          heading('5. Active IP Bans'),
          bannedIPs.length > 0
            ? new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  tableRow(['IP Address', 'Reason', 'Jail', 'Banned At', 'Source'], true),
                  ...bannedIPs.map(b => tableRow([
                    b.ipAddress, b.reason || '—', b.jail,
                    new Date(b.bannedAt).toLocaleString(), b.source,
                  ])),
                ],
              })
            : para('No active IP bans.'),

          para(''),
          heading('6. Recommendations'),
          para('1. Ensure SSH password authentication is disabled (key-only access)'),
          para('2. Remove authorized_keys2 file if present'),
          para('3. Keep fail2ban active and monitor ban rates'),
          para('4. Regularly run vulnerability scans (at least weekly)'),
          para('5. Review and update UFW firewall rules periodically'),
          para('6. Monitor disk usage and clean up old Docker images/containers'),
          para('7. Keep all system packages updated with security patches'),
          para(''),
          para('— End of Report —', { italics: true, color: '6B6F76' }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="kreatix-security-report-${now.toISOString().split('T')[0]}.docx"`);
    res.send(buffer);
  } catch (err) {
    logger.error({ err }, 'DOCX export failed');
    res.status(500).json({ error: 'Failed to export report' });
  }
});

// ── Scan runner (async) ─────────────────────────────────────────────────────
async function runSecurityScan(scanId) {
  const startTime = Date.now();
  const { execSync } = await import('child_process');

  function run(cmd) {
    try { return execSync(cmd, { timeout: 30000, encoding: 'utf-8' }).trim(); }
    catch { return ''; }
  }

  const findings = [];
  const recommendations = [];

  // 1. SSH Audit
  const sshPassword = run("grep -i '^PasswordAuthentication' /etc/ssh/sshd_config | awk '{print $2}'") || 'unknown';
  const sshRoot = run("grep -i '^PermitRootLogin' /etc/ssh/sshd_config | awk '{print $2}'") || 'unknown';
  const sshKeys = run("wc -l < /root/.ssh/authorized_keys 2>/dev/null") || '0';
  const sshKeys2 = run("test -f /root/.ssh/authorized_keys2 && echo yes || echo no");

  const sshAudit = { passwordAuth: sshPassword, permitRootLogin: sshRoot, authorizedKeysCount: parseInt(sshKeys), authorizedKeys2Exists: sshKeys2 === 'yes' };

  if (sshPassword === 'yes') {
    findings.push({ severity: 'CRITICAL', title: 'SSH Password Auth Enabled', description: 'Password authentication is enabled. Key-only access is recommended.' });
    recommendations.push('Disable SSH password authentication in /etc/ssh/sshd_config');
  }
  if (sshRoot === 'yes') {
    findings.push({ severity: 'HIGH', title: 'Root Login Permitted', description: 'Direct root login via SSH is enabled.' });
    recommendations.push('Set PermitRootLogin to "no" or "prohibit-password"');
  }
  if (sshKeys2 === 'yes') {
    findings.push({ severity: 'HIGH', title: 'authorized_keys2 Exists', description: 'Legacy authorized_keys2 file detected.' });
    recommendations.push('Remove /root/.ssh/authorized_keys2 and consolidate keys into authorized_keys');
  }

  // 2. Firewall Audit
  const ufwStatus = run('ufw status verbose 2>/dev/null | head -1') || 'unknown';
  const ufwRules = run('ufw status 2>/dev/null | grep -E "ALLOW|DENY|LIMIT"').split('\n').filter(Boolean);
  const firewallAudit = { status: ufwStatus, rules: ufwRules };

  if (!ufwStatus.includes('active')) {
    findings.push({ severity: 'CRITICAL', title: 'Firewall Inactive', description: 'UFW firewall is not active.' });
    recommendations.push('Enable UFW firewall with: ufw enable');
  }

  // 3. Open Ports
  const ssOutput = run("ss -tlnp | grep LISTEN | awk '{print $4}' | sed 's/.*://' | sort -un");
  const openPorts = ssOutput.split('\n').filter(Boolean).map(p => parseInt(p));
  const exposedPorts = openPorts.filter(p => p !== 22 && p !== 80 && p !== 443);
  if (exposedPorts.length > 0) {
    findings.push({ severity: 'MEDIUM', title: 'Unexpected Open Ports', description: `Ports ${exposedPorts.join(', ')} are open and listening.` });
    recommendations.push(`Review and restrict access to ports: ${exposedPorts.join(', ')}`);
  }

  // 4. Docker Audit
  const dockerPs = run("docker ps --format '{{.Names}} {{.Ports}}' 2>/dev/null");
  const dockerContainers = dockerPs.split('\n').filter(Boolean).map(line => {
    const [container, ...ports] = line.split(' ');
    return { container, ports: ports.join(' ') };
  });
  const dockerExposed = dockerContainers.filter(c => c.ports.includes('0.0.0.0'));
  const dockerAudit = { containers: dockerContainers, exposedCount: dockerExposed.length };

  if (dockerExposed.length > 0) {
    findings.push({ severity: 'HIGH', title: 'Docker Ports Exposed', description: `${dockerExposed.length} container(s) have ports exposed to 0.0.0.0.` });
    recommendations.push('Bind Docker containers to 127.0.0.1 instead of 0.0.0.0 where possible');
  }

  // 5. File Permissions
  const passwdPerms = run("stat -c '%a' /etc/passwd");
  const shadowPerms = run("stat -c '%a' /etc/shadow");
  const filePermissions = { passwd: passwdPerms, shadow: shadowPerms };

  if (shadowPerms !== '640' && shadowPerms !== '000') {
    findings.push({ severity: 'MEDIUM', title: 'Shadow File Permissions', description: `/etc/shadow has permissions ${shadowPerms}, expected 640.` });
    recommendations.push('Set /etc/shadow permissions to 640');
  }

  // 6. Chkrootkit (if installed)
  let chkrootkit = null;
  const chkrootkitBin = run('which chkrootkit 2>/dev/null');
  if (chkrootkitBin) {
    const chkOutput = run('chkrootkit 2>/dev/null | grep -v "not infected" | grep -i "infected\\|suspicious" | head -10');
    chkrootkit = { installed: true, output: chkOutput || 'clean' };
    if (chkOutput) {
      findings.push({ severity: 'CRITICAL', title: 'Rootkit Detection', description: `Chkrootkit found suspicious entries: ${chkOutput}` });
      recommendations.push('Investigate chkrootkit findings immediately');
    }
  } else {
    chkrootkit = { installed: false };
    recommendations.push('Install chkrootkit for rootkit detection: apt install chkrootkit');
  }

  // 7. Nmap localhost scan (if installed)
  let nmapResults = null;
  const nmapBin = run('which nmap 2>/dev/null');
  if (nmapBin) {
    const nmapOutput = run('nmap -sT -F localhost 2>/dev/null');
    nmapResults = { installed: true, output: nmapOutput };
  } else {
    nmapResults = { installed: false };
    recommendations.push('Install nmap for port scanning: apt install nmap');
  }

  // 8. Lynis (if installed)
  let lynisReport = null;
  const lynisBin = run('which lynis 2>/dev/null');
  if (lynisBin) {
    const lynisOutput = run('lynis audit system --quick 2>/dev/null | tail -50');
    const lynisScore = run('grep "^hardening_index" /var/log/lynis.log 2>/dev/null | tail -1 | awk "{print $2}"');
    lynisReport = { installed: true, output: lynisOutput, score: lynisScore };
  } else {
    lynisReport = { installed: false };
    recommendations.push('Install Lynis for comprehensive auditing: apt install lynis');
  }

  // Calculate security score
  let score = 100;
  findings.forEach(f => {
    if (f.severity === 'CRITICAL') score -= 20;
    else if (f.severity === 'HIGH') score -= 10;
    else if (f.severity === 'MEDIUM') score -= 5;
    else score -= 2;
  });
  score = Math.max(0, score);

  const summary = `Scan completed with ${findings.length} findings. Security score: ${score}/100. ${findings.filter(f => f.severity === 'CRITICAL').length} critical, ${findings.filter(f => f.severity === 'HIGH').length} high, ${findings.filter(f => f.severity === 'MEDIUM').length} medium.`;

  await prisma.securityScan.update({
    where: { id: scanId },
    data: {
      status: 'completed',
      lynisReport,
      nmapResults,
      chkrootkit,
      openPorts,
      sshAudit,
      dockerAudit,
      firewallAudit,
      filePermissions,
      securityScore: score,
      findings,
      recommendations,
      summary,
      completedAt: new Date(),
      duration: Math.round((Date.now() - startTime) / 1000),
    },
  });

  // Create security event for the scan
  await prisma.securityEvent.create({
    data: {
      type: 'SECURITY_SCAN',
      severity: score < 50 ? 'CRITICAL' : score < 70 ? 'HIGH' : score < 90 ? 'MEDIUM' : 'LOW',
      description: `Security scan completed. Score: ${score}/100. ${findings.length} findings.`,
      details: { scanId, findings: findings.length, score },
      source: 'scan',
    },
  });

  logger.info({ scanId, score, findings: findings.length }, 'Security scan completed');
}

// ── Admin: auto-remediate scan findings ─────────────────────────────────────
router.post('/remediate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { scanId } = req.body;
    const { execSync } = await import('child_process');

    function run(cmd) {
      try { return execSync(cmd, { timeout: 30000, encoding: 'utf-8' }).trim(); }
      catch { return ''; }
    }

    const scan = scanId
      ? await prisma.securityScan.findUnique({ where: { id: scanId } })
      : await prisma.securityScan.findFirst({ where: { status: 'completed' }, orderBy: { createdAt: 'desc' } });

    if (!scan) return res.status(404).json({ error: 'No scan found to remediate' });

    const actions = [];
    const skipped = [];

    for (const finding of (scan.findings || [])) {
      switch (finding.title) {
        case 'Firewall Inactive': {
          // Allow essential ports then enable UFW
          run('ufw allow 22/tcp');
          run('ufw allow 80/tcp');
          run('ufw allow 443/tcp');
          // Allow Docker-related ports that are needed
          const neededPorts = [5432, 5435, 5100, 3000, 3001];
          for (const p of neededPorts) {
            run(`ufw allow ${p}/tcp`);
          }
          const result = run('ufw --force enable');
          actions.push({
            finding: finding.title,
            action: 'Enabled UFW firewall with rules for ports 22, 80, 443, 3000-3001, 5100, 5432, 5435',
            output: result,
          });
          break;
        }

        case 'Unexpected Open Ports': {
          // Parse ports from the description
          const portMatch = finding.description.match(/Ports (.+) are open/);
          if (portMatch) {
            const ports = portMatch[1].split(',').map(p => parseInt(p.trim()));
            // Essential ports to keep open
            const essential = new Set([22, 80, 443, 5432, 5435, 5100, 3000, 3001]);
            const nonEssential = ports.filter(p => !essential.has(p));
            for (const p of nonEssential) {
              run(`ufw deny ${p}/tcp`);
            }
            if (nonEssential.length > 0) {
              actions.push({
                finding: finding.title,
                action: `Blocked ${nonEssential.length} non-essential ports via UFW: ${nonEssential.join(', ')}`,
              });
            }
          }
          break;
        }

        case 'Docker Ports Exposed': {
          // Get containers with 0.0.0.0 bindings
          const dockerPs = run("docker ps --format '{{.Names}} {{.Ports}}' 2>/dev/null");
          const containers = dockerPs.split('\n').filter(Boolean).map(line => {
            const [name, ...rest] = line.split(' ');
            return { name, ports: rest.join(' ') };
          });
          const exposed = containers.filter(c => c.ports.includes('0.0.0.0'));
          // Add UFW deny rules for exposed Docker ports that aren't essential
          const essentialPorts = new Set([22, 80, 443, 5432, 5435, 5100, 3000, 3001]);
          for (const c of exposed) {
            const portMatches = c.ports.matchAll(/0\.0\.0\.0:(\d+)/g);
            for (const m of portMatches) {
              const port = parseInt(m[1]);
              if (!essentialPorts.has(port)) {
                run(`ufw deny ${port}/tcp`);
              }
            }
          }
          actions.push({
            finding: finding.title,
            action: 'Added UFW deny rules for non-essential Docker exposed ports. To fully fix, update docker-compose.yml to bind to 127.0.0.1 instead of 0.0.0.0.',
            note: 'Docker port rebinding requires manual docker-compose.yml changes. UFW rules added as interim protection.',
          });
          break;
        }

        case 'Shadow File Permissions': {
          run('chmod 640 /etc/shadow');
          actions.push({
            finding: finding.title,
            action: 'Set /etc/shadow permissions to 640',
          });
          break;
        }

        case 'SSH Password Auth Enabled': {
          // Backup and fix sshd_config
          run("cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak.$(date +%s)");
          run("sed -i 's/^#\\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config");
          run("sed -i 's/^#\\?PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config");
          // Check for cloud-init override
          const cloudInit = run("test -f /etc/ssh/sshd_config.d/60-cloud-init.conf && echo yes || echo no");
          if (cloudInit === 'yes') {
            run("sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config.d/60-cloud-init.conf");
          }
          run('systemctl restart sshd 2>/dev/null || systemctl restart ssh 2>/dev/null');
          actions.push({
            finding: finding.title,
            action: 'Disabled SSH password authentication and restarted SSH service',
          });
          break;
        }

        case 'Root Login Permitted': {
          run("sed -i 's/^#\\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config");
          run('systemctl restart sshd 2>/dev/null || systemctl restart ssh 2>/dev/null');
          actions.push({
            finding: finding.title,
            action: 'Set PermitRootLogin to no and restarted SSH',
          });
          break;
        }

        case 'authorized_keys2 Exists': {
          run('rm -f /root/.ssh/authorized_keys2');
          actions.push({
            finding: finding.title,
            action: 'Removed legacy authorized_keys2 file',
          });
          break;
        }

        case 'Rootkit Detection': {
          skipped.push({
            finding: finding.title,
            reason: 'Rootkit detection requires manual investigation. This finding may be a false positive - verify with rkhunter or manual inspection.',
          });
          break;
        }

        default:
          skipped.push({
            finding: finding.title,
            reason: 'No automated remediation available for this finding type.',
          });
      }
    }

    // Create a security event for the remediation
    await prisma.securityEvent.create({
      data: {
        type: 'SECURITY_SCAN',
        severity: 'INFO',
        description: `Auto-remediation applied: ${actions.length} fix(es) applied, ${skipped.length} skipped.`,
        details: { actions, skipped, scanId: scan.id },
        source: 'remediation',
      },
    });

    res.json({
      ok: true,
      actionsApplied: actions.length,
      actionsSkipped: skipped.length,
      actions,
      skipped,
    });
  } catch (err) {
    logger.error({ err }, 'Remediation failed');
    res.status(500).json({ error: 'Failed to apply remediation' });
  }
});

// ── Admin: Firewall Management ──────────────────────────────────────────────
function parseUfwRules(output) {
  const rules = [];
  const lines = output.split('\n').filter(Boolean);
  for (const line of lines) {
    // Skip header lines
    if (line.startsWith('Status:') || line.startsWith('--') || line.trim() === '') continue;
    // Parse lines like:
    // "22/tcp                     ALLOW IN    Anywhere"
    // "80/tcp (v6)                 ALLOW IN    Anywhere (v6)"
    // "DENY IN                     192.168.1.1"
    const match = line.match(/^(\S+)\s+(ALLOW|DENY|REJECT|LIMIT)\s+(IN|OUT|FWD)?\s*(.*)$/);
    if (match) {
      const [, port, action, direction, source] = match;
      rules.push({
        port: port.split(' ')[0],
        action,
        direction: direction || 'IN',
        source: source || 'Anywhere',
        raw: line.trim(),
      });
    }
  }
  return rules;
}

// GET /api/security/firewall — get current firewall status and rules
router.get('/firewall', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { execSync } = await import('child_process');
    function run(cmd) {
      try { return execSync(cmd, { timeout: 10000, encoding: 'utf-8' }).trim(); }
      catch { return ''; }
    }

    const statusOutput = run('ufw status verbose 2>/dev/null');
    const isActive = statusOutput.includes('Status: active');
    const rules = parseUfwRules(statusOutput);

    // Get default policies
    const defaultIncoming = (statusOutput.match(/Default:\s*(\S+)\s+\(incoming\)/) || [])[1] || 'deny';
    const defaultOutgoing = (statusOutput.match(/(\S+)\s+\(outgoing\)/) || [])[1] || 'allow';
    const defaultRouted = (statusOutput.match(/(\S+)\s+\(routed\)/) || [])[1] || 'deny';

    // Check if ufw is installed
    const ufwInstalled = !!run('which ufw 2>/dev/null');

    res.json({
      installed: ufwInstalled,
      active: isActive,
      rules,
      defaults: { incoming: defaultIncoming, outgoing: defaultOutgoing, routed: defaultRouted },
      raw: statusOutput,
    });
  } catch (err) {
    logger.error({ err }, 'Failed to get firewall status');
    res.status(500).json({ error: 'Failed to get firewall status' });
  }
});

// POST /api/security/firewall/rule — add a new firewall rule
router.post('/firewall/rule', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { execSync } = await import('child_process');
    function run(cmd) {
      try { return execSync(cmd, { timeout: 10000, encoding: 'utf-8' }).trim(); }
      catch (e) { return e.stdout?.trim() || e.message; }
    }

    const { action, port, protocol, source, direction } = req.body;

    if (!action || !port) return res.status(400).json({ error: 'Action and port are required' });
    if (!['allow', 'deny', 'reject', 'limit'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use: allow, deny, reject, or limit' });
    }

    let cmd = `ufw ${action}`;
    if (direction === 'out') cmd += ' out';
    if (source && source !== 'Anywhere') cmd += ` from ${source}`;
    cmd += ` to any port ${port}`;
    if (protocol && protocol !== 'both') cmd += ` proto ${protocol}`;

    const result = run(cmd);
    const success = result.includes('Rules updated') || result.includes('Skipping') || !result.includes('ERROR');

    // Get updated rules
    const statusOutput = run('ufw status verbose 2>/dev/null');
    const rules = parseUfwRules(statusOutput);

    // Log the action
    await prisma.securityEvent.create({
      data: {
        type: 'SECURITY_SCAN',
        severity: 'INFO',
        description: `Firewall rule ${action}ed: ${action} ${port}${protocol && protocol !== 'both' ? '/' + protocol : ''}${source && source !== 'Anywhere' ? ' from ' + source : ''}`,
        details: { action: 'firewall_rule_add', command: cmd, result },
        source: 'firewall',
      },
    });

    res.json({ ok: success, rules, message: result });
  } catch (err) {
    logger.error({ err }, 'Failed to add firewall rule');
    res.status(500).json({ error: 'Failed to add firewall rule' });
  }
});

// DELETE /api/security/firewall/rule — remove a firewall rule by rule number
router.delete('/firewall/rule', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { execSync } = await import('child_process');
    function run(cmd) {
      try { return execSync(cmd, { timeout: 10000, encoding: 'utf-8' }).trim(); }
      catch (e) { return e.stdout?.trim() || e.message; }
    }

    const { ruleNumber } = req.body;
    if (!ruleNumber) return res.status(400).json({ error: 'Rule number is required' });

    const result = run(`echo y | ufw delete ${ruleNumber}`);
    const success = result.includes('Rules updated') || !result.includes('ERROR');

    // Get updated rules
    const statusOutput = run('ufw status verbose 2>/dev/null');
    const rules = parseUfwRules(statusOutput);

    await prisma.securityEvent.create({
      data: {
        type: 'SECURITY_SCAN',
        severity: 'INFO',
        description: `Firewall rule #${ruleNumber} deleted`,
        details: { action: 'firewall_rule_delete', ruleNumber, result },
        source: 'firewall',
      },
    });

    res.json({ ok: success, rules, message: result });
  } catch (err) {
    logger.error({ err }, 'Failed to delete firewall rule');
    res.status(500).json({ error: 'Failed to delete firewall rule' });
  }
});

// POST /api/security/firewall/enable — enable or disable the firewall
router.post('/firewall/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { execSync } = await import('child_process');
    function run(cmd) {
      try { return execSync(cmd, { timeout: 10000, encoding: 'utf-8' }).trim(); }
      catch (e) { return e.stdout?.trim() || e.message; }
    }

    const { enable } = req.body;
    const result = enable ? run('echo y | ufw enable') : run('ufw disable');
    const success = !result.includes('ERROR');

    const statusOutput = run('ufw status verbose 2>/dev/null');
    const isActive = statusOutput.includes('Status: active');
    const rules = parseUfwRules(statusOutput);

    await prisma.securityEvent.create({
      data: {
        type: 'SECURITY_SCAN',
        severity: enable ? 'INFO' : 'WARNING',
        description: `Firewall ${enable ? 'enabled' : 'disabled'}`,
        details: { action: 'firewall_toggle', enable, result },
        source: 'firewall',
      },
    });

    res.json({ ok: success, active: isActive, rules, message: result });
  } catch (err) {
    logger.error({ err }, 'Failed to toggle firewall');
    res.status(500).json({ error: 'Failed to toggle firewall' });
  }
});

// POST /api/security/firewall/default — set default policies
router.post('/firewall/default', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { execSync } = await import('child_process');
    function run(cmd) {
      try { return execSync(cmd, { timeout: 10000, encoding: 'utf-8' }).trim(); }
      catch (e) { return e.stdout?.trim() || e.message; }
    }

    const { incoming, outgoing, routed } = req.body;
    let result = '';

    if (incoming) run(`ufw default ${incoming} incoming`);
    if (outgoing) run(`ufw default ${outgoing} outgoing`);
    if (routed) run(`ufw default ${routed} routed`);

    const statusOutput = run('ufw status verbose 2>/dev/null');
    const rules = parseUfwRules(statusOutput);
    const defaultIncoming = (statusOutput.match(/Default:\s*(\S+)\s+\(incoming\)/) || [])[1] || 'deny';
    const defaultOutgoing = (statusOutput.match(/(\S+)\s+\(outgoing\)/) || [])[1] || 'allow';
    const defaultRouted = (statusOutput.match(/(\S+)\s+\(routed\)/) || [])[1] || 'deny';

    await prisma.securityEvent.create({
      data: {
        type: 'SECURITY_SCAN',
        severity: 'INFO',
        description: `Firewall default policies updated: incoming=${incoming || defaultIncoming}, outgoing=${outgoing || defaultOutgoing}, routed=${routed || defaultRouted}`,
        details: { action: 'firewall_default', incoming, outgoing, routed },
        source: 'firewall',
      },
    });

    res.json({
      ok: true,
      rules,
      defaults: { incoming: defaultIncoming, outgoing: defaultOutgoing, routed: defaultRouted },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to set firewall defaults');
    res.status(500).json({ error: 'Failed to set firewall defaults' });
  }
});

export default router;
