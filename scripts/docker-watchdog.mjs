#!/usr/bin/env node
// docker-watchdog — alert via Brevo when Docker containers go down.
//
// Runs from cron every minute. Tracks per-container state in state.json and
// only emails on transitions (up->down, down->up) plus a re-alert every
// REPEAT_ALERT_HOURS while a container stays down.
//
// Config lives in watchdog.env next to this script (or path in WATCHDOG_CONFIG):
//   BREVO_API_KEY=...          (required)
//   BREVO_SENDER_EMAIL=...     (default: hello@kreatixtech.com)
//   BREVO_SENDER_NAME=...      (default: Kreatix Technologies)
//   ALERT_EMAILS=a@b.com,c@d.com
//   REPEAT_ALERT_HOURS=24      (default: 24; 0 disables re-alerts)
//   IGNORE_CONTAINERS=a,b      (names to never alert on)

import { execFile } from 'node:child_process';
import { readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const DIR = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = process.env.WATCHDOG_CONFIG || join(DIR, 'watchdog.env');
const STATE_PATH = join(DIR, 'state.json');

// ── config ──────────────────────────────────────────────────────────────────
const env = {};
try {
  for (const line of readFileSync(CONFIG_PATH, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith('#')) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch (e) {
  console.error(`config unreadable: ${e.message}`);
  process.exit(1);
}

const API_KEY = env.BREVO_API_KEY || process.env.BREVO_API_KEY || '';
const SENDER = {
  email: env.BREVO_SENDER_EMAIL || 'hello@kreatixtech.com',
  name: env.BREVO_SENDER_NAME || 'Kreatix Technologies',
};
const RECIPIENTS = (env.ALERT_EMAILS || 'info@kreatixtech.com').split(',').map(s => s.trim()).filter(Boolean);
const REPEAT_MS = (Number(env.REPEAT_ALERT_HOURS ?? 24) || 0) * 3600e3;
const IGNORE = new Set((env.IGNORE_CONTAINERS || '').split(',').map(s => s.trim()).filter(Boolean));
const HOST = process.env.HOSTNAME_OVERRIDE || 'kreatix-vps (67.211.210.8)';

if (!API_KEY) { console.error('BREVO_API_KEY not configured'); process.exit(1); }

// ── state ───────────────────────────────────────────────────────────────────
let state = { containers: {}, dockerUnreachable: false };
try { state = { ...state, ...JSON.parse(readFileSync(STATE_PATH, 'utf8')) }; } catch { /* first run */ }
const firstRun = Object.keys(state.containers).length === 0;

function saveState() {
  const tmp = STATE_PATH + '.tmp';
  writeFileSync(tmp, JSON.stringify(state, null, 2));
  renameSync(tmp, STATE_PATH);
}

// ── inspect containers ──────────────────────────────────────────────────────
let dockerFailed = false;
let lines = [];
try {
  const { stdout, stderr } = await run('docker', ['ps', '-a', '--format', '{{.Names}}|{{.Status}}']);
  // docker can print template errors to stderr while still exiting 0
  if (!stdout.trim() && stderr.trim()) throw new Error(stderr.trim());
  lines = stdout.trim().split('\n').filter(Boolean);
} catch (e) {
  dockerFailed = true;
}

const events = [];   // {kind:'DOWN'|'UNHEALTHY'|'RECOVERED'|'REMOVED'|'DOCKER_DOWN', name, status}
const seen = new Set();
const now = Date.now();

if (dockerFailed) {
  if (!state.dockerUnreachable) {
    events.push({ kind: 'DOCKER_DOWN', name: 'docker daemon', status: 'docker command failed — daemon may be down' });
    state.dockerUnreachable = true;
  }
} else {
  if (state.dockerUnreachable) {
    events.push({ kind: 'RECOVERED', name: 'docker daemon', status: 'docker is responding again' });
    state.dockerUnreachable = false;
  }

  for (const line of lines) {
    const sep = line.indexOf('|');
    if (sep < 0) continue;
    const name = line.slice(0, sep);
    const status = line.slice(sep + 1);
    seen.add(name);
    if (IGNORE.has(name)) continue;

    // classify
    let current;
    if (/^Up /.test(status)) current = status.includes('(unhealthy)') ? 'unhealthy' : 'up';
    else current = 'down'; // Exited / Created / Dead / Restarting (crash loop)

    const prev = state.containers[name];

    if (!prev) {
      // container first seen — on watchdog's very first run we just baseline
      // and report existing problems in one summary; after that, a new
      // container appearing already-down is itself an event.
      if (current !== 'up') {
        events.push({ kind: current === 'unhealthy' ? 'UNHEALTHY' : 'DOWN', name, status, firstSeen: !firstRun });
      }
      state.containers[name] = { state: current, since: now, lastAlert: current !== 'up' ? now : 0 };
      continue;
    }

    if (prev.state !== current) {
      if (current === 'up') {
        events.push({ kind: 'RECOVERED', name, status });
        state.containers[name] = { state: 'up', since: now, lastAlert: 0 };
      } else {
        events.push({ kind: current === 'unhealthy' ? 'UNHEALTHY' : 'DOWN', name, status });
        state.containers[name] = { state: current, since: now, lastAlert: now };
      }
    } else if (current !== 'up' && REPEAT_MS > 0 && now - (prev.lastAlert || 0) >= REPEAT_MS) {
      events.push({ kind: current === 'unhealthy' ? 'UNHEALTHY' : 'DOWN', name, status, reminder: true });
      prev.lastAlert = now;
    }
  }

  // containers that vanished entirely
  for (const name of Object.keys(state.containers)) {
    if (!seen.has(name)) {
      const prev = state.containers[name];
      if (prev.state !== 'up') {
        events.push({ kind: 'REMOVED', name, status: 'container no longer exists' });
      }
      delete state.containers[name];
    }
  }
}

saveState();

// ── email ───────────────────────────────────────────────────────────────────
if (!events.length) {
  console.log(`ok: ${seen.size} containers checked, all tracked states unchanged`);
  process.exit(0);
}

const KIND_STYLE = {
  DOWN: { color: '#C43C36', label: 'DOWN' },
  UNHEALTHY: { color: '#F2B441', label: 'UNHEALTHY' },
  REMOVED: { color: '#8B5CF6', label: 'REMOVED' },
  RECOVERED: { color: '#16A34A', label: 'RECOVERED' },
  DOCKER_DOWN: { color: '#C43C36', label: 'DOCKER DOWN' },
};

const rows = events.map(e => {
  const s = KIND_STYLE[e.kind];
  return `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #eee">
      <span style="background:${s.color};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold">${s.label}</span>
      ${e.reminder ? ' <span style="color:#999;font-size:11px">(reminder)</span>' : ''}
    </td>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;font-size:13px">${e.name}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;color:#555">${e.status}</td>
  </tr>`;
}).join('');

const bad = events.filter(e => e.kind !== 'RECOVERED').length;
const subject = bad > 0
  ? `[ALERT] ${bad} container${bad > 1 ? 's' : ''} down on ${HOST}`
  : `[OK] Containers recovered on ${HOST}`;

const html = `
<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
  <div style="background:#0E0E0F;padding:20px 28px">
    <span style="color:#fff;font-weight:bold;font-size:16px">Kreatix Technologies — Docker Watchdog</span>
  </div>
  <div style="padding:24px 28px;border:1px solid #eee;border-top:none">
    <p>${events.length} state change${events.length > 1 ? 's' : ''} detected on <strong>${HOST}</strong> at ${new Date().toUTCString()}:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr style="background:#F7F5F2">
        <th style="padding:8px 12px;text-align:left;font-size:12px">Event</th>
        <th style="padding:8px 12px;text-align:left;font-size:12px">Container</th>
        <th style="padding:8px 12px;text-align:left;font-size:12px">Status</th>
      </tr>${rows}
    </table>
    <p style="color:#666;font-size:13px">Check with <code>docker ps -a</code> and restart with <code>docker start &lt;name&gt;</code> or <code>docker compose up -d</code> in the project directory.</p>
  </div>
  <p style="color:#999;font-size:12px;text-align:center">docker-watchdog on ${HOST} — alerts on state transitions, reminders every ${env.REPEAT_ALERT_HOURS ?? 24}h while down.</p>
</div>`;

const text = events.map(e => `[${KIND_STYLE[e.kind].label}] ${e.name}: ${e.status}`).join('\n');

try {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': API_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: SENDER.name, email: SENDER.email },
      to: RECIPIENTS.map(email => ({ email })),
      subject,
      htmlContent: html,
      textContent: `Docker watchdog on ${HOST}:\n\n${text}`,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
  console.log(`alert sent to ${RECIPIENTS.join(', ')}: ${subject}`);
} catch (e) {
  console.error(`email failed: ${e.message}`);
  process.exit(2);
}
