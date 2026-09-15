import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { authenticateToken, requireAdminOnly } from '../middleware/auth.js';
import logger from '../lib/logger.js';

const execAsync = promisify(exec);
const router = express.Router();

// ── Service definitions ─────────────────────────────────────────────────────
// Each service is checked by hitting its health endpoint (HTTP) and optionally
// by verifying its PM2 process is online.
const SERVICES = [
  {
    id: 'kreatix-backend',
    name: 'Kreatix Backend',
    description: 'Main API server (kreatixtech.com)',
    url: 'http://localhost:5100/api/health',
    publicUrl: 'https://kreatixtech.com/api/health',
    pm2Name: 'kreatix-backend',
    port: 5100,
    category: 'core',
  },
  {
    id: 'kreatix-mail',
    name: 'Kreatix Mail',
    description: 'Mail server (mail.kreatixtech.com)',
    url: 'http://localhost:3020/api/health',
    publicUrl: 'https://mail.kreatixtech.com/api/health',
    pm2Name: 'kreatix-mail',
    port: 3020,
    category: 'core',
  },
  {
    id: 'kreatix-academy',
    name: 'Kreatix Academy',
    description: 'Learning platform (academy.kreatixtech.com)',
    url: 'http://localhost:3008',
    publicUrl: 'https://academy.kreatixtech.com',
    pm2Name: 'kreatix-academy',
    port: 3008,
    category: 'core',
  },
  {
    id: 'security-api',
    name: 'Security Scanner',
    description: 'Security scanner (security.kreatixtech.com)',
    url: 'http://localhost:3001',
    publicUrl: 'https://security.kreatixtech.com',
    pm2Name: null, // runs via Docker, not PM2
    port: 3001,
    category: 'security',
  },
  {
    id: 'mpi-backend',
    name: 'MPI Backend',
    description: 'MPI cluster backend',
    url: 'http://localhost:4000/api/health',
    publicUrl: null,
    pm2Name: 'mpi-backend',
    port: 4000,
    category: 'internal',
  },
];

// ── Helper: check a single HTTP endpoint ────────────────────────────────────
async function checkHttp(url, timeoutMs = 5000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const start = Date.now();
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const latency = Date.now() - start;
    const ok = resp.ok;
    let body = null;
    try { body = await resp.json(); } catch { /* not JSON */ }
    return { status: ok ? 'up' : 'degraded', httpCode: resp.status, latency, body };
  } catch (e) {
    return { status: 'down', httpCode: null, latency: null, error: e.message };
  }
}

// ── Helper: check PM2 process status ────────────────────────────────────────
async function checkPm2(pm2Name) {
  if (!pm2Name) return { pm2Status: 'n/a' };
  try {
    const { stdout } = await execAsync(`pm2 jlist 2>/dev/null`);
    const apps = JSON.parse(stdout);
    const app = apps.find(a => a.name === pm2Name);
    if (!app) return { pm2Status: 'not_found' };
    return {
      pm2Status: app.pm2_env?.status || 'unknown',
      pid: app.pid,
      uptime: app.pm2_env?.pm_uptime || null,
      restarts: app.pm2_env?.restart_time || 0,
      memory: app.monit?.memory || null,
      cpu: app.monit?.cpu || 0,
    };
  } catch (e) {
    return { pm2Status: 'error', error: e.message };
  }
}

// ── Helper: get system metrics ──────────────────────────────────────────────
async function getSystemMetrics() {
  try {
    const { stdout: uptimeOut } = await execAsync('cat /proc/uptime');
    const uptimeSeconds = parseFloat(uptimeOut.split(' ')[0]);

    const { stdout: memOut } = await execAsync("free -m | awk '/Mem:/{print $2,$3,$4,$5,$6,$7}'");
    const [memTotal, memUsed, memFree, memShared, memBuffCache, memAvail] = memOut.trim().split(/\s+/).map(Number);

    const { stdout: swapOut } = await execAsync("free -m | awk '/Swap:/{print $2,$3,$4}'");
    const [swapTotal, swapUsed, swapFree] = swapOut.trim().split(/\s+/).map(Number);

    const { stdout: loadOut } = await execAsync('cat /proc/loadavg');
    const [load1, load5, load15] = loadOut.trim().split(/\s+/).map(Number);

    const { stdout: diskOut } = await execAsync("df / | awk 'NR==2{print $2,$3,$4,$5}'");
    const [diskTotal, diskUsed, diskAvail, diskPct] = diskOut.trim().split(/\s+/);
    const diskPctNum = parseInt(diskPct);

    return {
      uptime: uptimeSeconds,
      uptimeHuman: formatUptime(uptimeSeconds),
      memory: {
        total: memTotal,
        used: memUsed,
        free: memFree,
        available: memAvail,
        shared: memShared,
        cache: memBuffCache,
        usedPct: Math.round((memUsed / memTotal) * 100),
        availablePct: Math.round((memAvail / memTotal) * 100),
      },
      swap: {
        total: swapTotal,
        used: swapUsed,
        free: swapFree,
        usedPct: swapTotal > 0 ? Math.round((swapUsed / swapTotal) * 100) : 0,
      },
      load: { '1min': load1, '5min': load5, '15min': load15 },
      disk: {
        total: diskTotal,
        used: diskUsed,
        available: diskAvail,
        usedPct: diskPctNum,
      },
    };
  } catch (e) {
    logger.error({ err: e }, 'Failed to get system metrics');
    return null;
  }
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// ── Helper: check nginx status ──────────────────────────────────────────────
async function checkNginx() {
  try {
    const { stdout } = await execAsync('systemctl is-active nginx 2>&1');
    return { status: stdout.trim() === 'active' ? 'up' : 'down', active: stdout.trim() === 'active' };
  } catch {
    return { status: 'down', active: false };
  }
}

// ── Helper: check pm2-root systemd service ──────────────────────────────────
async function checkPm2Service() {
  try {
    const { stdout } = await execAsync('systemctl is-active pm2-root 2>&1');
    return { status: stdout.trim() === 'active' ? 'up' : 'down', active: stdout.trim() === 'active' };
  } catch {
    return { status: 'down', active: false };
  }
}

// ── GET /api/monitoring/health — full health status ────────────────────────
router.get('/health', authenticateToken, requireAdminOnly, async (req, res) => {
  try {
    const [services, system, nginx, pm2Service] = await Promise.all([
      Promise.all(SERVICES.map(async (svc) => {
        const [http, pm2] = await Promise.all([
          checkHttp(svc.url),
          checkPm2(svc.pm2Name),
        ]);
        return {
          ...svc,
          http,
          pm2,
          overall: http.status === 'up' && (pm2.pm2Status === 'online' || pm2.pm2Status === 'n/a')
            ? 'healthy'
            : http.status === 'down'
              ? 'down'
              : 'degraded',
        };
      })),
      getSystemMetrics(),
      checkNginx(),
      checkPm2Service(),
    ]);

    const summary = {
      total: services.length,
      healthy: services.filter(s => s.overall === 'healthy').length,
      degraded: services.filter(s => s.overall === 'degraded').length,
      down: services.filter(s => s.overall === 'down').length,
    };

    res.json({
      timestamp: new Date().toISOString(),
      summary,
      services,
      system,
      infrastructure: { nginx, pm2Service },
    });
  } catch (e) {
    logger.error({ err: e }, 'Monitoring health check failed');
    res.status(500).json({ error: 'Failed to get health status' });
  }
});

// ── POST /api/monitoring/restart/:serviceId — restart a service ─────────────
router.post('/restart/:serviceId', authenticateToken, requireAdminOnly, async (req, res) => {
  const { serviceId } = req.params;
  const svc = SERVICES.find(s => s.id === serviceId);

  if (!svc) {
    return res.status(404).json({ error: 'Unknown service' });
  }

  if (!svc.pm2Name) {
    return res.status(400).json({ error: 'This service cannot be restarted via PM2 (managed by Docker)' });
  }

  try {
    logger.info({ user: req.user.email, service: serviceId }, 'Admin requested service restart');

    // Restart via PM2
    const { stdout, stderr } = await execAsync(`pm2 restart ${svc.pm2Name} 2>&1`);
    await execAsync('pm2 save 2>&1');

    // Wait a moment for the service to come up
    await new Promise(r => setTimeout(r, 3000));

    // Check health after restart
    const http = await checkHttp(svc.url, 8000);
    const pm2 = await checkPm2(svc.pm2Name);

    res.json({
      success: true,
      message: `${svc.name} restarted`,
      service: { ...svc, http, pm2 },
      output: stdout || stderr,
    });
  } catch (e) {
    logger.error({ err: e, service: serviceId }, 'Service restart failed');
    res.status(500).json({ error: `Failed to restart ${svc.name}: ${e.message}` });
  }
});

// ── POST /api/monitoring/restart-all — restart all PM2 services ──────────────
router.post('/restart-all', authenticateToken, requireAdminOnly, async (req, res) => {
  try {
    logger.info({ user: req.user.email }, 'Admin requested restart of all services');

    const { stdout } = await execAsync('pm2 restart all 2>&1');
    await execAsync('pm2 save 2>&1');

    await new Promise(r => setTimeout(r, 5000));

    // Re-check all services
    const services = await Promise.all(SERVICES.map(async (svc) => {
      const [http, pm2] = await Promise.all([
        checkHttp(svc.url, 8000),
        checkPm2(svc.pm2Name),
      ]);
      return {
        ...svc,
        http,
        pm2,
        overall: http.status === 'up' && (pm2.pm2Status === 'online' || pm2.pm2Status === 'n/a')
          ? 'healthy'
          : http.status === 'down' ? 'down' : 'degraded',
      };
    }));

    res.json({
      success: true,
      message: 'All PM2 services restarted',
      services,
      output: stdout,
    });
  } catch (e) {
    logger.error({ err: e }, 'Restart all failed');
    res.status(500).json({ error: `Failed to restart all services: ${e.message}` });
  }
});

// ── POST /api/monitoring/restart-nginx — restart Nginx ──────────────────────
router.post('/restart-nginx', authenticateToken, requireAdminOnly, async (req, res) => {
  try {
    logger.info({ user: req.user.email }, 'Admin requested Nginx restart');
    await execAsync('systemctl restart nginx 2>&1');
    await new Promise(r => setTimeout(r, 2000));
    const nginx = await checkNginx();
    res.json({ success: true, message: 'Nginx restarted', nginx });
  } catch (e) {
    logger.error({ err: e }, 'Nginx restart failed');
    res.status(500).json({ error: `Failed to restart Nginx: ${e.message}` });
  }
});

// ── GET /api/monitoring/logs — recent health-check logs ─────────────────────
router.get('/logs', authenticateToken, requireAdminOnly, async (req, res) => {
  try {
    const { stdout } = await execAsync('tail -100 /var/log/kreatix-health.log 2>/dev/null || echo "No logs yet"');
    const lines = stdout.trim().split('\n').filter(Boolean).map(line => {
      // Parse lines like: [2026-09-15 12:24:04] WARN: ...
      const match = line.match(/^\[(.+?)\]\s+(.+)$/);
      if (match) {
        return { timestamp: match[1], message: match[2] };
      }
      return { timestamp: null, message: line };
    });
    res.json({ logs: lines.reverse() }); // newest first
  } catch (e) {
    res.json({ logs: [] });
  }
});

export default router;
