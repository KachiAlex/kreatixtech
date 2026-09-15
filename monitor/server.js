// ── Kreatix Standalone Monitor Server (v2 — auto-discovery) ─────────────────
// Runs on port 5101 — independent of the main backend (port 5100).
// Auto-discovers all PM2 processes, Docker containers, and Nginx domains.
// Groups services by project, identifies Docker vs PM2 vs standalone.

import express from 'express';
import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import {
  insertSnapshot, getSnapshots,
  insertIncident, resolveIncident, getActiveIncident, getIncidents,
  getMaintenance, setMaintenance,
  logRestart, getRestartLog,
  cleanupOldData,
} from './db.js';
import { sendDowntimeAlert, sendRecoveryAlert, sendRestartNotification } from './notifier.js';

const execAsync = promisify(exec);

// Load .env manually (no dotenv dependency) so the monitor stays self-contained
try {
  const envPath = fileURLToPath(new URL('./.env', import.meta.url));
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
} catch { /* .env optional */ }

const app = express();
app.use(express.json());

const PORT = parseInt(process.env.PORT || '5101', 10);
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '60000', 10);
const JWT_SECRET = process.env.JWT_SECRET || '';

// ── Static service definitions (for services that need custom config) ──────
// These override auto-discovered settings. Auto-discovered services not listed
// here will use defaults.
const SERVICE_OVERRIDES = {
  'kreatix-backend': {
    name: 'Kreatix Backend',
    description: 'Main API server (kreatixtech.com)',
    publicUrl: 'https://kreatixtech.com/api/health',
    healthPath: '/api/health',
    project: 'kreatix',
  },
  'kreatix-mail': {
    name: 'Kreatix Mail',
    description: 'Mail server (mail.kreatixtech.com)',
    publicUrl: 'https://mail.kreatixtech.com/api/health',
    healthPath: '/api/health',
    project: 'kreatix',
  },
  'kreatix-academy': {
    name: 'Kreatix Academy',
    description: 'Learning platform (academy.kreatixtech.com)',
    publicUrl: 'https://academy.kreatixtech.com',
    healthPath: '/',
    project: 'kreatix',
  },
  'kreatix-monitor': {
    name: 'Kreatix Monitor',
    description: 'This monitoring server',
    publicUrl: 'https://kreatixtech.com/api/monitoring/ping',
    healthPath: '/ping',
    project: 'kreatix',
    skipRestart: true, // don't restart ourselves
  },
  'kreatix-security-api': {
    name: 'Security Scanner API',
    description: 'Security scanner (security.kreatixtech.com)',
    publicUrl: 'https://security.kreatixtech.com',
    healthPath: '/health',
    project: 'kreatix',
    port: 3700, // host network mode — need to specify port
  },
  'mpi-backend': {
    name: 'MPI Backend',
    description: 'MPI cluster backend',
    healthPath: '/api/v1/health',
    project: 'mpi',
  },
};

// ── State ───────────────────────────────────────────────────────────────────
const previousStates = new Map();
const wsClients = new Set();
let lastHealthData = null;
let checking = false;

// ── Auth middleware ─────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// ── Docker container discovery ──────────────────────────────────────────────
async function discoverDockerContainers() {
  try {
    const { stdout } = await execAsync("docker ps -a --format '{{json .}}'", { maxBuffer: 2 * 1024 * 1024 });
    const lines = stdout.trim().split('\n').filter(Boolean);
    return lines.map(line => JSON.parse(line));
  } catch (e) {
    console.error('[monitor] Docker discovery failed:', e.message);
    return [];
  }
}

async function inspectAllDockerContainers(names) {
  if (names.length === 0) return [];
  try {
    const { stdout } = await execAsync(`docker inspect ${names.join(' ')}`, { maxBuffer: 4 * 1024 * 1024 });
    return JSON.parse(stdout);
  } catch (e) {
    console.error('[monitor] Docker inspect failed:', e.message);
    return [];
  }
}

// Get listening ports by PID (for host-networked containers)
async function getListeningPorts() {
  try {
    const { stdout } = await execAsync('ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null');
    const ports = new Map(); // pid -> [ports]
    for (const line of stdout.split('\n')) {
      const match = line.match(/:(\d+)\s+.*pid=(\d+)/);
      if (match) {
        const port = parseInt(match[1], 10);
        const pid = parseInt(match[2], 10);
        if (!ports.has(pid)) ports.set(pid, []);
        ports.get(pid).push(port);
      }
    }
    return ports;
  } catch (e) {
    return new Map();
  }
}

// ── PM2 process discovery ──────────────────────────────────────────────────
async function discoverPm2Processes() {
  try {
    const { stdout } = await execAsync('pm2 jlist 2>/dev/null', { maxBuffer: 1024 * 1024 });
    return JSON.parse(stdout);
  } catch (e) {
    console.error('[monitor] PM2 discovery failed:', e.message);
    return [];
  }
}

// ── Nginx domain mapping ────────────────────────────────────────────────────
function parseNginxConfigs() {
  const portToDomains = new Map();
  try {
    const files = readdirSync('/etc/nginx/sites-enabled/');
    for (const file of files) {
      try {
        const content = readFileSync(`/etc/nginx/sites-enabled/${file}`, 'utf8');
        const serverNameMatch = content.match(/server_name\s+([^;]+);/);
        const proxyPassMatches = content.matchAll(/proxy_pass\s+http:\/\/127\.0\.0\.1:(\d+)/g);

        if (serverNameMatch) {
          const domains = serverNameMatch[1].trim().split(/\s+/);
          for (const m of proxyPassMatches) {
            const port = parseInt(m[1], 10);
            if (!portToDomains.has(port)) portToDomains.set(port, []);
            portToDomains.get(port).push(...domains);
          }
        }
      } catch (e) { /* skip unreadable files */ }
    }
  } catch (e) {
    console.error('[monitor] Nginx config parsing failed:', e.message);
  }
  return portToDomains;
}

// ── HTTP health check (using curl for Docker compatibility) ─────────────────
// Tries multiple common health paths: /health, /api/health, /api/v1/health, /
async function checkHttp(url, timeoutMs = 5000) {
  const base = url.replace(/\/(api\/v1\/)?health$/, '').replace(/\/$/, '');
  const pathsToTry = [
    url, // try the exact URL first (from override or default)
    `${base}/`,
    `${base}/api/health`,
    `${base}/api/v1/health`,
  ];

  for (const tryUrl of pathsToTry) {
    try {
      const { stdout, stderr } = await execAsync(
        `curl -s -o /dev/null -w '%{http_code}|%{time_total}' --max-time ${Math.ceil(timeoutMs / 1000)} '${tryUrl}' 2>&1`
      );
      const output = stdout.trim();
      const parts = output.split('|');
      const httpCode = parseInt(parts[0], 10);
      const timeTotal = parseFloat(parts[1] || '0');
      const latency = Math.round(timeTotal * 1000);

      if (isNaN(httpCode) || httpCode === 0) continue; // try next path
      if (httpCode >= 200 && httpCode < 400) {
        return { status: 'up', httpCode, latency };
      }
      // Got a response but not 2xx/3xx — record it and try next path
      if (httpCode === 404 && tryUrl !== pathsToTry[pathsToTry.length - 1]) continue;
      return {
        status: 'degraded',
        httpCode,
        latency,
      };
    } catch (e) {
      continue; // try next path
    }
  }
  return { status: 'down', httpCode: null, latency: null, error: 'No response' };
}

// ── Determine service role from image/name ──────────────────────────────────
function inferRole(image, name) {
  const lower = (image + ' ' + name).toLowerCase();
  if (lower.includes('postgres') || lower.includes('mysql') || lower.includes('mariadb')) return 'db';
  if (lower.includes('redis') || lower.includes('memcached')) return 'cache';
  if (lower.includes('nginx') || lower.includes('apache') || lower.includes('caddy')) return 'web';
  return 'app';
}

// ── Infer project name from container labels or name ───────────────────────
function inferProject(labels, name) {
  if (labels && labels['com.docker.compose.project']) {
    return labels['com.docker.compose.project'].replace(/-/g, ' ');
  }
  // Fallback: use container name prefix
  if (name.startsWith('kreatix')) return 'kreatix';
  if (name.startsWith('ndumi')) return 'ndumi';
  if (name.startsWith('pandicrm') || name.startsWith('pandi')) return 'pandacrm';
  if (name.startsWith('pos-') || name.startsWith('checkout')) return 'checkoutpos';
  if (name.startsWith('carei')) return 'carei';
  if (name.startsWith('xsta360')) return 'xsta360';
  if (name.startsWith('redblog')) return 'redblog';
  if (name.startsWith('smartdrive')) return 'smartdrive';
  if (name.startsWith('mpi-')) return 'mpi';
  return name.split('-')[0] || 'other';
}

// ── Format container name into a readable service name ─────────────────────
function formatServiceName(containerName) {
  // Remove trailing -1, -N suffix
  let name = containerName.replace(/-\d+$/, '');
  // Remove common suffixes
  name = name.replace(/-(app|web|api|db|redis|nginx|postgres|frontend|backend)$/i, '');
  // Title case
  return name.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ── System metrics ──────────────────────────────────────────────────────────
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

    return {
      uptime: uptimeSeconds,
      uptimeHuman: formatUptime(uptimeSeconds),
      memory: { total: memTotal, used: memUsed, free: memFree, available: memAvail, shared: memShared, cache: memBuffCache, usedPct: memTotal ? Math.round((memUsed / memTotal) * 100) : 0, availablePct: memTotal ? Math.round((memAvail / memTotal) * 100) : 0 },
      swap: { total: swapTotal, used: swapUsed, free: swapFree, usedPct: swapTotal > 0 ? Math.round((swapUsed / swapTotal) * 100) : 0 },
      load: { '1min': load1, '5min': load5, '15min': load15 },
      disk: { total: diskTotal, used: diskUsed, available: diskAvail, usedPct: parseInt(diskPct) },
    };
  } catch (e) {
    console.error('[monitor] System metrics failed:', e.message);
    return null;
  }
}

async function checkNginx() {
  try {
    const { stdout } = await execAsync('systemctl is-active nginx 2>&1');
    return { status: stdout.trim() === 'active' ? 'up' : 'down', active: stdout.trim() === 'active' };
  } catch {
    return { status: 'down', active: false };
  }
}

async function checkPm2Service() {
  try {
    const { stdout } = await execAsync('systemctl is-active pm2-root 2>&1');
    return { status: stdout.trim() === 'active' ? 'up' : 'down', active: stdout.trim() === 'active' };
  } catch {
    return { status: 'down', active: false };
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

// ── Restart a service (PM2 or Docker) ───────────────────────────────────────
async function restartService(svc, triggeredBy = 'auto', reason = 'auto-restart') {
  try {
    if (svc.type === 'pm2') {
      await execAsync(`pm2 restart ${svc.pm2Name} 2>&1`);
      await execAsync('pm2 save 2>&1');
    } else if (svc.type === 'docker') {
      await execAsync(`docker restart ${svc.dockerContainer} 2>&1`);
    } else {
      throw new Error(`Cannot restart ${svc.type} services`);
    }
    logRestart(svc.id, svc.name, reason, triggeredBy);
    if (triggeredBy === 'auto') {
      sendRestartNotification(svc, reason, 'auto').catch(() => {});
    }
    return true;
  } catch (e) {
    console.error(`[monitor] Failed to restart ${svc.id}:`, e.message);
    return false;
  }
}

// ── Build service list from auto-discovery ──────────────────────────────────
async function discoverAllServices() {
  const services = [];
  const portToDomains = parseNginxConfigs();
  const listeningPorts = await getListeningPorts();

  // ── Discover PM2 processes ──
  const pm2Processes = await discoverPm2Processes();
  for (const p of pm2Processes) {
    const name = p.name;
    const override = SERVICE_OVERRIDES[name] || {};
    // Try PORT env first, then look up PID's listening ports
    let port = p.pm2_env?.PORT || override.port || null;
    if (!port && p.pid) {
      const ports = listeningPorts.get(p.pid) || [];
      port = ports.find(pp => pp !== 22) || ports[0] || null;
    }

    services.push({
      id: name,
      name: override.name || formatServiceName(name),
      description: override.description || `PM2 process: ${name}`,
      type: 'pm2',
      role: 'app',
      project: override.project || 'pm2',
      port,
      publicUrl: override.publicUrl || (port ? portToDomains.get(port)?.[0] : null) || null,
      healthPath: override.healthPath || '/api/health',
      pm2Name: name,
      skipRestart: override.skipRestart || false,
      _pm2: {
        status: p.pm2_env?.status || 'unknown',
        pid: p.pid,
        uptime: p.pm2_env?.pm_uptime || null,
        restarts: p.pm2_env?.restart_time || 0,
        memory: p.monit?.memory || null,
        cpu: p.monit?.cpu || 0,
      },
    });
  }

  // ── Discover Docker containers ──
  const dockerContainers = await discoverDockerContainers();
  const containerNames = dockerContainers.map(c => c.Names);
  const dockerDetails = await inspectAllDockerContainers(containerNames);

  for (const d of dockerDetails) {
    const containerName = d.Name.replace('/', '');
    const labels = d.Config.Labels || {};
    const composeProject = labels['com.docker.compose.project'] || null;
    const image = d.Config.Image || '';
    const role = inferRole(image, containerName);
    const networkMode = d.HostConfig?.NetworkMode || 'default';
    const pid = d.State?.Pid || 0;

    // Determine port
    let port = null;
    if (networkMode === 'host') {
      // For host network, look up the PID's listening ports
      const ports = listeningPorts.get(pid) || [];
      // Pick the first non-22 (SSH) port
      port = ports.find(p => p !== 22) || ports[0] || null;
    } else {
      // For bridge network, check port mappings
      const portBindings = d.NetworkSettings?.Ports || {};
      for (const [containerPort, hostBindings] of Object.entries(portBindings)) {
        if (hostBindings && hostBindings[0]) {
          port = parseInt(hostBindings[0].HostPort, 10);
          break;
        }
      }
    }

    // Check if this container is already tracked as a PM2 process (skip duplicates)
    // Some containers might overlap with PM2-managed services
    const override = SERVICE_OVERRIDES[containerName] || {};
    const projectName = override.project || (composeProject ? composeProject.replace(/-/g, ' ') : inferProject(labels, containerName));

    // Skip if this is a database/cache that shouldn't be HTTP-checked
    const hasHttpPort = port != null && role !== 'db' && role !== 'cache';

    services.push({
      id: containerName,
      name: override.name || formatServiceName(containerName),
      description: override.description || `Docker: ${image.split('/').pop()}`,
      type: 'docker',
      role,
      project: projectName,
      port: override.port || port,
      publicUrl: override.publicUrl || (port ? portToDomains.get(port)?.[0] : null) || null,
      healthPath: override.healthPath || (role === 'web' ? '/' : '/health'),
      dockerContainer: containerName,
      skipRestart: override.skipRestart || false,
      _docker: {
        container: containerName,
        image: image.split('/').pop(),
        status: d.State?.Status || 'unknown',
        health: d.State?.Health?.Status || 'none',
        restartCount: d.RestartCount || 0,
        networkMode,
        pid,
        startedAt: d.State?.StartedAt || null,
        ports: Object.entries(d.NetworkSettings?.Ports || {}).map(([k, v]) => {
          if (v && v[0]) return `${v[0].HostIp}:${v[0].HostPort}->${k}`;
          return k;
        }),
      },
    });
  }

  return services;
}

// ── Main health check loop ──────────────────────────────────────────────────
async function runHealthCheck() {
  if (checking) return;
  checking = true;

  try {
    const maintenance = getMaintenance();
    const timestamp = new Date().toISOString();

    // Discover all services
    const allServices = await discoverAllServices();

    // Check HTTP health for services with ports (in parallel, batched)
    const servicesWithHttp = allServices.filter(s => s.port && s.role !== 'db' && s.role !== 'cache');
    const httpResults = await Promise.all(
      servicesWithHttp.map(s => {
        const url = `http://localhost:${s.port}${s.healthPath || '/health'}`;
        return checkHttp(url, 5000);
      })
    );

    // Build the final service list with health data
    const services = allServices.map((svc, i) => {
      let http = null;
      let overall = 'healthy';

      if (svc.port && svc.role !== 'db' && svc.role !== 'cache') {
        const httpIdx = servicesWithHttp.findIndex(s => s.id === svc.id);
        if (httpIdx >= 0) {
          http = httpResults[httpIdx];
          overall = http.status === 'up' ? 'healthy' : http.status === 'down' ? 'down' : 'degraded';
        }
      } else if (svc.type === 'docker') {
        // For databases/caches, check Docker status
        const dockerStatus = svc._docker?.status;
        const dockerHealth = svc._docker?.health;
        if (dockerStatus === 'running' && (dockerHealth === 'healthy' || dockerHealth === 'none')) {
          overall = 'healthy';
        } else if (dockerStatus === 'running' && dockerHealth === 'unhealthy') {
          overall = 'degraded';
        } else if (dockerStatus === 'restarting') {
          overall = 'down';
        } else {
          overall = 'down';
        }
      } else if (svc.type === 'pm2') {
        overall = svc._pm2?.status === 'online' ? 'healthy' : 'down';
      }

      // Store snapshot
      insertSnapshot({
        timestamp,
        service_id: svc.id,
        status: overall,
        http_code: http?.httpCode ?? null,
        latency: http?.latency ?? null,
        pm2_status: svc._pm2?.status ?? null,
        memory: svc._pm2?.memory ?? null,
        cpu: svc._pm2?.cpu ?? null,
      });

      // Detect state change
      const prev = previousStates.get(svc.id);
      if (prev && prev.overall !== overall) {
        handleStateChange(svc, prev.overall, overall, timestamp, maintenance.enabled, http);
      }
      previousStates.set(svc.id, { overall, timestamp });

      return {
        ...svc,
        http,
        overall,
        pm2: svc._pm2 || null,
        docker: svc._docker || null,
        _pm2: undefined,
        _docker: undefined,
      };
    });

    // Group by project
    const projectMap = new Map();
    for (const svc of services) {
      const proj = svc.project || 'other';
      if (!projectMap.has(proj)) projectMap.set(proj, []);
      projectMap.get(proj).push(svc);
    }

    const projects = Array.from(projectMap.entries())
      .map(([name, svcs]) => ({
        name,
        services: svcs.sort((a, b) => {
          // Sort: apps first, then web, then db, then cache
          const roleOrder = { app: 0, api: 0, web: 1, db: 2, cache: 3 };
          return (roleOrder[a.role] ?? 4) - (roleOrder[b.role] ?? 4);
        }),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const summary = {
      total: services.length,
      healthy: services.filter(s => s.overall === 'healthy').length,
      degraded: services.filter(s => s.overall === 'degraded').length,
      down: services.filter(s => s.overall === 'down').length,
      projects: projects.length,
      dockerContainers: services.filter(s => s.type === 'docker').length,
      pm2Processes: services.filter(s => s.type === 'pm2').length,
    };

    const [system, nginx, pm2Service] = await Promise.all([
      getSystemMetrics(),
      checkNginx(),
      checkPm2Service(),
    ]);

    lastHealthData = {
      timestamp,
      summary,
      projects,
      services, // flat list for backward compat
      system,
      infrastructure: { nginx, pm2Service },
      maintenance,
    };

    broadcast('health', lastHealthData);

    // Auto-restart down PM2 services (not Docker — Docker has its own restart policy)
    if (!maintenance.enabled) {
      for (const svc of services) {
        if (svc.overall === 'down' && svc.type === 'pm2' && !svc.skipRestart) {
          const recentRestarts = getRestartLog(1);
          const lastRestart = recentRestarts.find(r => r.service_id === svc.id);
          if (lastRestart) {
            const restartAge = Date.now() - new Date(lastRestart.timestamp).getTime();
            if (restartAge < 120000) continue;
          }
          console.log(`[monitor] Auto-restarting ${svc.id} (was down)`);
          await restartService(svc, 'auto', 'Service detected as down');
        }
      }
    }
  } catch (e) {
    console.error('[monitor] Health check failed:', e.message);
  } finally {
    checking = false;
  }
}

// ── Handle state change ──────────────────────────────────────────────────────
function handleStateChange(svc, oldState, newState, timestamp, maintenanceEnabled, http) {
  console.log(`[monitor] State change: ${svc.id} ${oldState} → ${newState}`);

  if (newState === 'down' || newState === 'degraded') {
    insertIncident({
      service_id: svc.id,
      service_name: svc.name,
      started_at: timestamp,
      type: newState,
      auto_restarted: !maintenanceEnabled && svc.type === 'pm2' && !svc.skipRestart,
    });
    sendDowntimeAlert({ ...svc, http }).catch(() => {});
  } else if (newState === 'healthy' && (oldState === 'down' || oldState === 'degraded')) {
    const incident = getActiveIncident(svc.id);
    if (incident) {
      const durationSeconds = Math.round((new Date(timestamp).getTime() - new Date(incident.started_at).getTime()) / 1000);
      resolveIncident(incident.id, timestamp, durationSeconds);
      sendRecoveryAlert({ ...svc, http }, durationSeconds).catch(() => {});
    }
  }
}

// ── WebSocket broadcast ──────────────────────────────────────────────────────
function broadcast(type, data) {
  const msg = JSON.stringify({ type, data });
  for (const ws of wsClients) {
    if (ws.readyState === 1) {
      try { ws.send(msg); } catch {}
    }
  }
}

// ── API endpoints ───────────────────────────────────────────────────────────

app.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health', authMiddleware, async (req, res) => {
  if (lastHealthData) return res.json(lastHealthData);
  await runHealthCheck();
  res.json(lastHealthData || { error: 'Health check not yet available' });
});

// Force a fresh discovery + health check cycle (bypasses the 60s interval)
app.post('/rediscover', authMiddleware, async (req, res) => {
  console.log('[monitor] Manual re-discovery triggered by', req.user?.email || 'admin');
  await runHealthCheck();
  res.json({
    success: true,
    message: 'Re-discovery complete',
    summary: lastHealthData?.summary,
    projects: lastHealthData?.projects?.map(p => ({ name: p.name, services: p.services.length })),
  });
});

app.get('/history', authMiddleware, (req, res) => {
  const serviceId = req.query.serviceId;
  const hours = parseInt(req.query.hours || '24', 10);
  if (!serviceId) return res.status(400).json({ error: 'serviceId required' });
  res.json({ serviceId, hours, snapshots: getSnapshots(serviceId, hours) });
});

app.get('/incidents', authMiddleware, (req, res) => {
  const days = parseInt(req.query.days || '7', 10);
  res.json({ incidents: getIncidents(days) });
});

app.get('/restart-log', authMiddleware, (req, res) => {
  const days = parseInt(req.query.days || '7', 10);
  res.json({ restarts: getRestartLog(days) });
});

app.post('/restart/:serviceId', authMiddleware, async (req, res) => {
  // Find service in last health data
  const svc = lastHealthData?.services?.find(s => s.id === req.params.serviceId);
  if (!svc) return res.status(404).json({ error: 'Unknown service' });
  if (svc.skipRestart) return res.status(400).json({ error: 'This service cannot be restarted' });
  if (!svc.pm2Name && !svc.dockerContainer) return res.status(400).json({ error: 'Service cannot be restarted' });

  const reason = req.body?.reason || 'Manual restart via dashboard';
  const success = await restartService(svc, req.user?.email || 'admin', reason);

  if (success) {
    await new Promise(r => setTimeout(r, 3000));
    if (svc.port) {
      const url = `http://localhost:${svc.port}${svc.healthPath || '/health'}`;
      const http = await checkHttp(url, 8000);
      res.json({ success: true, message: `${svc.name} restarted`, service: { ...svc, http } });
    } else {
      res.json({ success: true, message: `${svc.name} restarted`, service: svc });
    }
  } else {
    res.status(500).json({ error: `Failed to restart ${svc.name}` });
  }
});

app.post('/restart-all', authMiddleware, async (req, res) => {
  const restartable = lastHealthData?.services?.filter(s =>
    (s.pm2Name || s.dockerContainer) && !s.skipRestart && s.type === 'pm2'
  ) || [];
  const results = [];

  for (const svc of restartable) {
    console.log(`[monitor] Sequential restart: ${svc.id}`);
    const success = await restartService(svc, req.user?.email || 'admin', 'Restart all via dashboard');
    results.push({ serviceId: svc.id, name: svc.name, success });
    await new Promise(r => setTimeout(r, 5000));
    if (svc.port) {
      const url = `http://localhost:${svc.port}${svc.healthPath || '/health'}`;
      const http = await checkHttp(url, 8000);
      results[results.length - 1].status = http.status;
      results[results.length - 1].httpCode = http.httpCode;
    }
  }

  await new Promise(r => setTimeout(r, 3000));
  await runHealthCheck();
  res.json({ success: true, message: 'All PM2 services restarted sequentially', results });
});

app.post('/restart-nginx', authMiddleware, async (req, res) => {
  try {
    await execAsync('systemctl restart nginx 2>&1');
    await new Promise(r => setTimeout(r, 2000));
    const nginx = await checkNginx();
    res.json({ success: true, message: 'Nginx restarted', nginx });
  } catch (e) {
    res.status(500).json({ error: `Failed to restart Nginx: ${e.message}` });
  }
});

app.get('/maintenance', authMiddleware, (req, res) => {
  res.json(getMaintenance());
});

app.post('/maintenance', authMiddleware, (req, res) => {
  const enabled = !!req.body?.enabled;
  const reason = req.body?.reason || (enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
  setMaintenance(enabled, req.user?.email || 'admin', reason);
  broadcast('maintenance', getMaintenance());
  res.json({ success: true, maintenance: getMaintenance() });
});

app.get('/logs', authMiddleware, async (req, res) => {
  try {
    const { stdout } = await execAsync('tail -100 /var/log/kreatix-health.log 2>/dev/null || echo ""');
    const lines = stdout.trim().split('\n').filter(Boolean).map(line => {
      const match = line.match(/^\[(.+?)\]\s+(.+)$/);
      return match ? { timestamp: match[1], message: match[2] } : { timestamp: null, message: line };
    });
    res.json({ logs: lines.reverse() });
  } catch {
    res.json({ logs: [] });
  }
});

// ── WebSocket server ────────────────────────────────────────────────────────
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`[monitor] Server running on port ${PORT} (auto-discovery mode)`);
  console.log(`[monitor] Health check interval: ${CHECK_INTERVAL}ms`);
  runHealthCheck();
  setInterval(runHealthCheck, CHECK_INTERVAL);
  setInterval(cleanupOldData, 3600 * 1000);
});

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const token = url.searchParams.get('token');

  if (!token) { ws.close(1008, 'Token required'); return; }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN') { ws.close(1008, 'Admin access required'); return; }
  } catch { ws.close(1008, 'Invalid token'); return; }

  wsClients.add(ws);
  console.log(`[monitor] WebSocket client connected (${wsClients.size} total)`);

  if (lastHealthData) ws.send(JSON.stringify({ type: 'health', data: lastHealthData }));
  ws.send(JSON.stringify({ type: 'maintenance', data: getMaintenance() }));

  ws.on('close', () => { wsClients.delete(ws); });
  ws.on('error', () => { wsClients.delete(ws); });
});

process.on('SIGTERM', () => { wss.close(); server.close(() => process.exit(0)); });
process.on('SIGINT', () => { wss.close(); server.close(() => process.exit(0)); });

export default app;
