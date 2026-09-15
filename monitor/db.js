import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const DB_PATH = process.env.DB_PATH || '/opt/kreatix-monitor/health.db';

// Ensure directory exists
try { mkdirSync(dirname(DB_PATH), { recursive: true }); } catch {}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// ── Initialize tables ──────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS health_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    service_id TEXT NOT NULL,
    status TEXT NOT NULL,
    http_code INTEGER,
    latency INTEGER,
    pm2_status TEXT,
    memory INTEGER,
    cpu REAL
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    started_at TEXT NOT NULL,
    resolved_at TEXT,
    duration_seconds INTEGER,
    type TEXT NOT NULL DEFAULT 'down',
    auto_restarted INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled INTEGER NOT NULL DEFAULT 0,
    set_by TEXT,
    set_at TEXT,
    reason TEXT
  );

  CREATE TABLE IF NOT EXISTS restart_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    reason TEXT,
    triggered_by TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_snapshots_service_time ON health_snapshots(service_id, timestamp);
  CREATE INDEX IF NOT EXISTS idx_incidents_service ON incidents(service_id);
  CREATE INDEX IF NOT EXISTS idx_incidents_unresolved ON incidents(resolved_at) WHERE resolved_at IS NULL;
  CREATE INDEX IF NOT EXISTS idx_restart_log_time ON restart_log(timestamp);
`);

// ── Snapshot functions ──────────────────────────────────────────────────────
export function insertSnapshot(s) {
  db.prepare(`INSERT INTO health_snapshots (timestamp, service_id, status, http_code, latency, pm2_status, memory, cpu)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    s.timestamp, s.service_id, s.status, s.http_code ?? null, s.latency ?? null,
    s.pm2_status ?? null, s.memory ?? null, s.cpu ?? null
  );
}

export function getSnapshots(serviceId, hours = 24) {
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  return db.prepare(`SELECT * FROM health_snapshots WHERE service_id = ? AND timestamp >= ? ORDER BY timestamp ASC`).all(serviceId, since);
}

// ── Incident functions ──────────────────────────────────────────────────────
export function insertIncident(incident) {
  const result = db.prepare(`INSERT INTO incidents (service_id, service_name, started_at, type, auto_restarted)
    VALUES (?, ?, ?, ?, ?)`).run(
    incident.service_id, incident.service_name, incident.started_at, incident.type || 'down', incident.auto_restarted ? 1 : 0
  );
  return result.lastInsertRowid;
}

export function resolveIncident(id, resolvedAt, durationSeconds) {
  db.prepare(`UPDATE incidents SET resolved_at = ?, duration_seconds = ? WHERE id = ?`).run(resolvedAt, durationSeconds, id);
}

export function getActiveIncident(serviceId) {
  return db.prepare(`SELECT * FROM incidents WHERE service_id = ? AND resolved_at IS NULL ORDER BY started_at DESC LIMIT 1`).get(serviceId);
}

export function getIncidents(days = 7) {
  const since = new Date(Date.now() - days * 86400 * 1000).toISOString();
  return db.prepare(`SELECT * FROM incidents WHERE started_at >= ? ORDER BY started_at DESC LIMIT 100`).all(since);
}

// ── Maintenance functions ──────────────────────────────────────────────────
export function getMaintenance() {
  const row = db.prepare(`SELECT * FROM maintenance WHERE id = 1`).get();
  if (!row) return { enabled: false, set_by: null, set_at: null, reason: null };
  return { enabled: !!row.enabled, set_by: row.set_by, set_at: row.set_at, reason: row.reason };
}

export function setMaintenance(enabled, setBy, reason) {
  db.prepare(`INSERT INTO maintenance (id, enabled, set_by, set_at, reason) VALUES (1, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET enabled = ?, set_by = ?, set_at = ?, reason = ?`).run(
    enabled ? 1 : 0, setBy, new Date().toISOString(), reason,
    enabled ? 1 : 0, setBy, new Date().toISOString(), reason
  );
}

// ── Restart log functions ───────────────────────────────────────────────────
export function logRestart(serviceId, serviceName, reason, triggeredBy) {
  db.prepare(`INSERT INTO restart_log (timestamp, service_id, service_name, reason, triggered_by)
    VALUES (?, ?, ?, ?, ?)`).run(
    new Date().toISOString(), serviceId, serviceName, reason, triggeredBy
  );
}

export function getRestartLog(days = 7) {
  const since = new Date(Date.now() - days * 86400 * 1000).toISOString();
  return db.prepare(`SELECT * FROM restart_log WHERE timestamp >= ? ORDER BY timestamp DESC LIMIT 50`).all(since);
}

// ── Cleanup old data ────────────────────────────────────────────────────────
export function cleanupOldData() {
  const cutoff = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
  db.prepare(`DELETE FROM health_snapshots WHERE timestamp < ?`).run(cutoff);
  db.prepare(`DELETE FROM restart_log WHERE timestamp < ?`).run(cutoff);
  // Keep incidents forever (small table)
}

export default db;
