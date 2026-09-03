import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'node:crypto';
import http from 'node:http';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import {
  hashPassword, generateSalt, verifyPassword,
  signJwt, verifyJwt, authMiddleware, requireAdmin,
  generateSessionId, hashToken, getExpiry,
  REFRESH_EXPIRES_IN, auditLog,
  type JwtPayload,
} from './auth.js';
import {
  parseRawEmail, generateThreadId, generateSnippet,
  upsertContact, createDefaultFolders, updateFolderCounts,
  buildEmailHtml,
} from './email-utils.js';
import { analyzeEmailSecurity } from './spam-detection.js';
import { generateTotpSecret, verifyTotp, generateOtpAuthUrl } from './totp.js';
import { prepare } from './db.js';
import { storage } from './storage.js';
import { startSyncInterval } from './d1-sync.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// CORS — allow kreatixtech.com subdomains, Capacitor native apps, and Electron desktop app
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const allowed = [
    'https://www.kreatixtech.com',
    'https://kreatixtech.com',
    'https://mail.kreatixtech.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'null', // Electron loads from file:// which sends origin "null"
  ];
  if (allowed.includes(origin) || origin.includes('kreatixtech.com') || origin.startsWith('capacitor://') || origin.startsWith('https://localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-admin-secret');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// ── Env object (mimics Cloudflare Env) ───────────────────────────────────
const env: any = {
  DB: { prepare },
  R2_BUCKET: storage,
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
};

const ADMIN_SECRET = 'KreatixAdmin2026!Secret_Xy9Lm';

// ── Database migrations ──────────────────────────────────────────────────
try {
  env.DB.prepare(`CREATE TABLE IF NOT EXISTS delivery_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_id INTEGER,
    message_id TEXT,
    recipient TEXT,
    event_type TEXT,
    event_data TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`).run();
} catch (e) { console.error('Migration: delivery_events table:', e); }

try {
  env.DB.prepare(`ALTER TABLE emails ADD COLUMN delivery_status TEXT DEFAULT 'sent'`).run();
} catch (e) { /* column already exists */ }

function adminAuthCheck(req: any): boolean {
  return req.headers['x-admin-secret'] === ADMIN_SECRET;
}

async function adminAuth(req: any): Promise<{ user: JwtPayload | null; error?: any }> {
  if (adminAuthCheck(req)) {
    return { user: { sub: 0, email: 'system', role: 'admin', type: 'access' } as any };
  }
  return requireAdmin(req);
}

// ── Rate limiter ──────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

function json(data: any, status = 200) {
  return { status, body: data };
}

function errorResp(message: string, status = 400) {
  return { status, body: { error: message } };
}

function sendResult(res: any, result: any) {
  res.status(result.status || 200).json(result.body);
}

// ── Serve static frontend ─────────────────────────────────────────────────
const distPath = path.join(__dirname, '..', '..', 'public');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ══════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════════════════════════════════════════

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, display_name } = req.body;
    if (!email || !password) return sendResult(res, errorResp('Email and password are required', 400));

    const existing = env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
    if (existing) return sendResult(res, errorResp('Email already registered', 409));

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    const result = env.DB.prepare(
      'INSERT INTO users (email, display_name, password_hash, password_salt) VALUES (?, ?, ?, ?)'
    ).bind(email.toLowerCase(), display_name || '', passwordHash, salt).run();

    const userId = result.meta?.last_row_id;
    if (!userId) return sendResult(res, errorResp('Failed to create user', 500));

    await createDefaultFolders(env, userId);
    env.DB.prepare('INSERT INTO user_settings (user_id) VALUES (?)').bind(userId).run();

    const inboxFolder = env.DB.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?')
      .bind(userId, 'inbox').first();

    await auditLog(env, userId, 'register', 'user', String(userId), req);

    const accessToken = await signJwt({ sub: userId, email: email.toLowerCase(), role: 'user', type: 'access' });
    const refreshToken = await signJwt({ sub: userId, email: email.toLowerCase(), role: 'user', type: 'refresh' }, REFRESH_EXPIRES_IN);

    const sessionId = generateSessionId();
    const tokenHash = await hashToken(refreshToken);
    env.DB.prepare(
      'INSERT INTO sessions (id, user_id, token_hash, device_info, ip_address, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(sessionId, userId, tokenHash, req.headers['user-agent'] || null, req.headers['x-forwarded-for'] || req.socket.remoteAddress || null, getExpiry(REFRESH_EXPIRES_IN)).run();

    env.DB.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").bind(userId).run();

    sendResult(res, json({
      user: { id: userId, email: email.toLowerCase(), display_name: display_name || '', role: 'user' },
      accessToken, refreshToken, inboxFolderId: inboxFolder?.id,
    }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (!rateLimit(`login:${ip}`, 10, 60000)) return sendResult(res, errorResp('Too many login attempts. Please try again later.', 429));

    const { email, password } = req.body;
    if (!email || !password) return sendResult(res, errorResp('Email and password are required', 400));

    const user = env.DB.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').bind(email.toLowerCase()).first();
    if (!user) return sendResult(res, errorResp('Invalid email or password', 401));

    const valid = await verifyPassword(password, user.password_salt, user.password_hash);
    if (!valid) return sendResult(res, errorResp('Invalid email or password', 401));

    // 2FA check
    if (user.totp_enabled === 1 && user.totp_secret) {
      const { totp_code } = req.body;
      if (!totp_code) return sendResult(res, json({ requires2FA: true, message: 'Two-factor authentication code required' }, 200));
      if (!verifyTotp(user.totp_secret, totp_code)) return sendResult(res, errorResp('Invalid 2FA code', 401));
    }

    const accessToken = await signJwt({ sub: user.id, email: user.email, role: user.role, type: 'access' });
    const refreshToken = await signJwt({ sub: user.id, email: user.email, role: user.role, type: 'refresh' }, REFRESH_EXPIRES_IN);

    const sessionId = generateSessionId();
    const tokenHash = await hashToken(refreshToken);
    env.DB.prepare('INSERT INTO sessions (id, user_id, token_hash, device_info, ip_address, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(sessionId, user.id, tokenHash, req.headers['user-agent'] || null, ip, getExpiry(REFRESH_EXPIRES_IN)).run();

    env.DB.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").bind(user.id).run();
    await auditLog(env, user.id, 'login', 'user', String(user.id), req);

    const inboxFolder = env.DB.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').bind(user.id, 'inbox').first();

    sendResult(res, json({
      user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role, avatar_url: user.avatar_url },
      accessToken, refreshToken, inboxFolderId: inboxFolder?.id,
    }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendResult(res, errorResp('Refresh token required', 400));

    const payload = await verifyJwt(refreshToken);
    if (!payload || payload.type !== 'refresh') return sendResult(res, errorResp('Invalid refresh token', 401));

    const tokenHash = await hashToken(refreshToken);
    const session = env.DB.prepare("SELECT * FROM sessions WHERE token_hash = ? AND expires_at > datetime('now')").bind(tokenHash).first();
    if (!session) return sendResult(res, errorResp('Session expired', 401));

    const newAccessToken = await signJwt({ sub: payload.sub, email: payload.email, role: payload.role, type: 'access' });
    sendResult(res, json({ accessToken: newAccessToken }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);

    const body = req.body || {};
    if (body.refreshToken) {
      const tokenHash = await hashToken(body.refreshToken);
      env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
    }

    await auditLog(env, user!.sub, 'logout', 'user', String(user!.sub), req);
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);

    const dbUser = env.DB.prepare('SELECT id, email, display_name, role, is_active, avatar_url, storage_quota, storage_used, created_at, last_login_at FROM users WHERE id = ?').bind(user!.sub).first();
    if (!dbUser) return sendResult(res, errorResp('User not found', 404));

    const settings = env.DB.prepare('SELECT * FROM user_settings WHERE user_id = ?').bind(user!.sub).first();
    sendResult(res, json({ user: dbUser, settings }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// EMAIL ROUTES
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/emails', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);

    const folderId = req.query.folder_id as string;
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '50');
    const offset = (page - 1) * limit;
    const starred = req.query.starred === 'true';
    const unreadOnly = req.query.unread === 'true';

    let query = 'SELECT id, message_id, thread_id, from_address, from_name, to_address, cc_address, subject, snippet, folder_id, is_read, is_starred, is_important, has_attachments, size, direction, status, received_at, sent_at, snooze_until, spam_score, is_spam, security_flags FROM emails WHERE user_id = ?';
    const params: any[] = [user!.sub];

    if (folderId) { query += ' AND folder_id = ?'; params.push(parseInt(folderId)); }
    if (starred) query += ' AND is_starred = 1';
    if (unreadOnly) query += ' AND is_read = 0';
    if (search) {
      query += ' AND (subject LIKE ? OR from_address LIKE ? OR to_address LIKE ? OR text LIKE ?)';
      const sv = `%${search}%`;
      params.push(sv, sv, sv, sv);
    }

    query += ' ORDER BY received_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results } = env.DB.prepare(query).bind(...params).all();

    let emailsWithLabels = results;
    if (results.length > 0) {
      const emailIds = results.map((r: any) => r.id);
      const placeholders = emailIds.map(() => '?').join(',');
      const labelRows = env.DB.prepare(`SELECT el.email_id, l.id, l.name, l.color FROM email_labels el JOIN labels l ON l.id = el.label_id WHERE el.email_id IN (${placeholders})`).bind(...emailIds).all();
      const labelMap = new Map<number, any[]>();
      for (const lr of labelRows.results as any[]) {
        if (!labelMap.has(lr.email_id)) labelMap.set(lr.email_id, []);
        labelMap.get(lr.email_id)!.push({ id: lr.id, name: lr.name, color: lr.color });
      }
      emailsWithLabels = results.map((r: any) => ({ ...r, labels: labelMap.get(r.id) || [] }));
    }

    let countQuery = 'SELECT COUNT(*) as total FROM emails WHERE user_id = ?';
    const countParams: any[] = [user!.sub];
    if (folderId) { countQuery += ' AND folder_id = ?'; countParams.push(parseInt(folderId)); }
    if (starred) countQuery += ' AND is_starred = 1';
    if (unreadOnly) countQuery += ' AND is_read = 0';
    if (search) {
      countQuery += ' AND (subject LIKE ? OR from_address LIKE ? OR to_address LIKE ? OR text LIKE ?)';
      const sv = `%${search}%`;
      countParams.push(sv, sv, sv, sv);
    }
    const countResult = env.DB.prepare(countQuery).bind(...countParams).first();

    sendResult(res, json({
      emails: emailsWithLabels,
      pagination: { page, limit, total: countResult?.total || 0, totalPages: Math.ceil((countResult?.total || 0) / limit) },
    }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.get('/api/emails/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);

    const id = parseInt(req.params.id);
    const emailData = env.DB.prepare('SELECT * FROM emails WHERE id = ? AND user_id = ?').bind(id, user!.sub).first();
    if (!emailData) return sendResult(res, errorResp('Email not found', 404));

    if (!emailData.is_read) {
      env.DB.prepare("UPDATE emails SET is_read = 1, updated_at = datetime('now') WHERE id = ?").bind(id).run();
      if (emailData.folder_id) await updateFolderCounts(env, user!.sub, emailData.folder_id);
    }

    const attachments = env.DB.prepare('SELECT id, filename, mime_type, size, is_inline, content_id, download_url FROM attachments WHERE email_id = ?').bind(id).all();
    const labels = env.DB.prepare('SELECT l.* FROM labels l JOIN email_labels el ON l.id = el.label_id WHERE el.email_id = ?').bind(id).all();

    let thread = null;
    if (emailData.thread_id) {
      thread = env.DB.prepare('SELECT id, from_address, from_name, subject, snippet, received_at, is_read FROM emails WHERE thread_id = ? AND user_id = ? ORDER BY received_at ASC').bind(emailData.thread_id, user!.sub).all();
    }

    sendResult(res, json({ ...emailData, is_read: 1, attachments: attachments.results, labels: labels.results, thread: thread?.results || null }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/emails/:id/read', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    env.DB.prepare("UPDATE emails SET is_read = 1, updated_at = datetime('now') WHERE id = ? AND user_id = ?").bind(id, user!.sub).run();
    const emailData = env.DB.prepare('SELECT folder_id FROM emails WHERE id = ?').bind(id).first();
    if (emailData?.folder_id) await updateFolderCounts(env, user!.sub, emailData.folder_id);
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/emails/:id/unread', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    env.DB.prepare("UPDATE emails SET is_read = 0, updated_at = datetime('now') WHERE id = ? AND user_id = ?").bind(id, user!.sub).run();
    const emailData = env.DB.prepare('SELECT folder_id FROM emails WHERE id = ?').bind(id).first();
    if (emailData?.folder_id) await updateFolderCounts(env, user!.sub, emailData.folder_id);
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/emails/:id/star', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    const { starred } = req.body;
    env.DB.prepare("UPDATE emails SET is_starred = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?").bind(starred ? 1 : 0, id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/emails/bulk', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);

    const { ids, action, folder_id } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return sendResult(res, errorResp('Email IDs required', 400));

    const placeholders = ids.map(() => '?').join(',');
    let query = '';

    switch (action) {
      case 'read':
      case 'mark_read':
        query = `UPDATE emails SET is_read = 1, updated_at = datetime('now') WHERE id IN (${placeholders}) AND user_id = ?`;
        env.DB.prepare(query).bind(...ids, user!.sub).run();
        break;
      case 'unread':
      case 'mark_unread':
        query = `UPDATE emails SET is_read = 0, updated_at = datetime('now') WHERE id IN (${placeholders}) AND user_id = ?`;
        env.DB.prepare(query).bind(...ids, user!.sub).run();
        break;
      case 'star':
        query = `UPDATE emails SET is_starred = 1, updated_at = datetime('now') WHERE id IN (${placeholders}) AND user_id = ?`;
        env.DB.prepare(query).bind(...ids, user!.sub).run();
        break;
      case 'unstar':
        query = `UPDATE emails SET is_starred = 0, updated_at = datetime('now') WHERE id IN (${placeholders}) AND user_id = ?`;
        env.DB.prepare(query).bind(...ids, user!.sub).run();
        break;
      case 'delete':
        query = `DELETE FROM emails WHERE id IN (${placeholders}) AND user_id = ?`;
        env.DB.prepare(query).bind(...ids, user!.sub).run();
        break;
      case 'archive':
        const archiveFolder = env.DB.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').bind(user!.sub, 'archive').first();
        if (archiveFolder) {
          query = `UPDATE emails SET folder_id = ?, updated_at = datetime('now') WHERE id IN (${placeholders}) AND user_id = ?`;
          env.DB.prepare(query).bind(archiveFolder.id, ...ids, user!.sub).run();
        }
        break;
      case 'spam':
        const spamFolder = env.DB.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').bind(user!.sub, 'spam').first();
        if (spamFolder) {
          query = `UPDATE emails SET folder_id = ?, is_spam = 1, updated_at = datetime('now') WHERE id IN (${placeholders}) AND user_id = ?`;
          env.DB.prepare(query).bind(spamFolder.id, ...ids, user!.sub).run();
        }
        break;
      case 'not_spam':
        const inboxFolder = env.DB.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').bind(user!.sub, 'inbox').first();
        if (inboxFolder) {
          query = `UPDATE emails SET folder_id = ?, is_spam = 0, spam_score = 0, updated_at = datetime('now') WHERE id IN (${placeholders}) AND user_id = ?`;
          env.DB.prepare(query).bind(inboxFolder.id, ...ids, user!.sub).run();
        }
        break;
      case 'block_sender':
        const senders = env.DB.prepare(`SELECT DISTINCT from_address FROM emails WHERE id IN (${placeholders}) AND user_id = ?`).bind(...ids, user!.sub).all();
        for (const s of senders.results as any[]) {
          if (s.from_address) {
            try {
              env.DB.prepare('INSERT OR IGNORE INTO blocked_senders (user_id, email_address, reason) VALUES (?, ?, ?)').bind(user!.sub, s.from_address.toLowerCase(), 'manual').run();
            } catch {}
          }
        }
        break;
      case 'move':
        if (!folder_id) return sendResult(res, errorResp('folder_id required for move action', 400));
        query = `UPDATE emails SET folder_id = ?, updated_at = datetime('now') WHERE id IN (${placeholders}) AND user_id = ?`;
        env.DB.prepare(query).bind(folder_id, ...ids, user!.sub).run();
        break;
      default:
        return sendResult(res, errorResp('Invalid action', 400));
    }

    const affectedFolders = env.DB.prepare(`SELECT DISTINCT folder_id FROM emails WHERE id IN (${placeholders})`).bind(...ids).all();
    for (const f of affectedFolders.results as any[]) {
      if (f.folder_id) await updateFolderCounts(env, user!.sub, f.folder_id);
    }
    if (action === 'move' && folder_id) await updateFolderCounts(env, user!.sub, folder_id);

    sendResult(res, json({ success: true, affected: ids.length }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/emails/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);

    const id = parseInt(req.params.id);
    const emailData = env.DB.prepare('SELECT folder_id FROM emails WHERE id = ? AND user_id = ?').bind(id, user!.sub).first();
    if (!emailData) return sendResult(res, errorResp('Email not found', 404));

    const trashFolder = env.DB.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').bind(user!.sub, 'trash').first();

    if (emailData.folder_id === trashFolder?.id) {
      env.DB.prepare('DELETE FROM emails WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
    } else {
      env.DB.prepare("UPDATE emails SET folder_id = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?").bind(trashFolder?.id, id, user!.sub).run();
    }

    if (emailData.folder_id) await updateFolderCounts(env, user!.sub, emailData.folder_id);
    if (trashFolder) await updateFolderCounts(env, user!.sub, trashFolder.id);

    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// COMPOSE / SEND
// ══════════════════════════════════════════════════════════════════════════

app.post('/api/send', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);

    const { to, cc, bcc, subject, body, html, from, fromName, replyToId, attachments: clientAttachments } = req.body;
    if (!to || !subject) return sendResult(res, errorResp('To and subject are required', 400));

    const splitEmails = (val: any): string[] | null => {
      if (!val) return null;
      if (Array.isArray(val)) return val;
      return val.split(',').map((s: string) => s.trim()).filter(Boolean);
    };

    const toList = splitEmails(to);
    const ccList = splitEmails(cc);
    const bccList = splitEmails(bcc);

    const dbUser = env.DB.prepare('SELECT email, display_name FROM users WHERE id = ?').bind(user!.sub).first();
    const senderEmail = from || dbUser.email;
    const senderName = fromName || dbUser.display_name || 'Kreatix Mail User';

    const settings = env.DB.prepare('SELECT signature_html, signature_image_url FROM user_settings WHERE user_id = ?').bind(user!.sub).first();
    let signatureHtml = settings?.signature_html || '';
    if (settings?.signature_image_url) {
      signatureHtml = `<img src="${settings.signature_image_url}" alt="Signature" style="max-height: 80px; max-width: 300px; margin-bottom: 8px;" />${signatureHtml}`;
    }
    const htmlContent = html || buildEmailHtml(body || '', signatureHtml);

    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${senderName} <${senderEmail}>`,
          to: toList,
          ...(ccList && ccList.length > 0 ? { cc: ccList } : {}),
          ...(bccList && bccList.length > 0 ? { bcc: bccList } : {}),
          subject,
          text: body || '',
          html: htmlContent,
          ...(clientAttachments && clientAttachments.length > 0 ? {
            attachments: clientAttachments.map((att: any) => ({ filename: att.filename, content: att.content })),
          } : {}),
        }),
      });

      if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        // Save to outbox on failure
        env.DB.prepare(
          `INSERT INTO outbox (user_id, to_address, cc_address, bcc_address, subject, body, html, from_address, from_name, reply_to_id, attachments, error_message, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'failed')`
        ).bind(user!.sub, toList!.join(','), ccList?.join(',') || null, bccList?.join(',') || null, subject, body || '', htmlContent, senderEmail, senderName, replyToId || null, clientAttachments ? JSON.stringify(clientAttachments) : null, `Resend API error: ${errorText}`).run();
        return sendResult(res, json({ error: `Resend API error: ${errorText}`, saved_to_outbox: true }, 500));
      }

      const resendResult = await resendResponse.json() as any;

      const sentFolder = env.DB.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').bind(user!.sub, 'sent').first();

      const threadId = generateThreadId({
        messageId: resendResult.id, fromAddress: senderEmail, fromName: senderName,
        toAddress: toList!.join(','), ccAddress: ccList?.join(',') || null,
        subject, text: body || '', html: htmlContent, inReplyTo: replyToId ? String(replyToId) : null,
        references: null, attachments: [],
      });

      const snippet = generateSnippet(body || '');
      let totalSize = new TextEncoder().encode(body || '').length;
      if (clientAttachments) { for (const att of clientAttachments) totalSize += att.content.length; }

      const emailResult = env.DB.prepare(
        `INSERT INTO emails (user_id, message_id, thread_id, from_address, from_name, to_address, cc_address, bcc_address, subject, text, html, snippet, folder_id, is_read, direction, status, sent_at, size, has_attachments)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'outbound', 'sent', datetime('now'), ?, ?)`
      ).bind(user!.sub, resendResult.id || null, threadId, senderEmail, senderName, toList!.join(','), ccList?.join(',') || null, bccList?.join(',') || null, subject, body || '', htmlContent, snippet, sentFolder?.id, totalSize, clientAttachments && clientAttachments.length > 0 ? 1 : 0).run();

      if (sentFolder) await updateFolderCounts(env, user!.sub, sentFolder.id);

      const sentEmailId = emailResult.meta?.last_row_id;

      // Add read receipt tracking pixel
      if (sentEmailId) {
        const trackingPixel = `<img src="${req.protocol}://${req.get('host')}/api/track/open/${sentEmailId}/${user!.sub}" width="1" height="1" alt="" style="display:none;"/>`;
        const htmlWithTracking = (htmlContent || '') + trackingPixel;
        env.DB.prepare("UPDATE emails SET html = ? WHERE id = ?").bind(htmlWithTracking, sentEmailId).run();
      }

      if (clientAttachments && clientAttachments.length > 0 && sentEmailId) {
        for (const att of clientAttachments) {
          const attId = crypto.randomUUID();
          const r2Key = `attachments/${user!.sub}/${sentEmailId}/${attId}/${att.filename}`;
          const binaryStr = Buffer.from(att.content, 'base64');
          await env.R2_BUCKET.put(r2Key, binaryStr, { httpMetadata: { contentType: att.mimeType } });
          env.DB.prepare('INSERT INTO attachments (id, email_id, user_id, filename, mime_type, size, r2_key, is_inline, content_id) VALUES (?, ?, ?, ?, ?, ?, ?, 0, null)')
            .bind(attId, sentEmailId, user!.sub, att.filename, att.mimeType, att.content.length, r2Key).run();
        }
      }

      const recipients = toList!;
      for (const r of recipients) await upsertContact(env, user!.sub, r);

      await auditLog(env, user!.sub, 'send', 'email', String(emailResult.meta?.last_row_id), req, { to, subject });

      sendResult(res, json({ success: true, id: emailResult.meta?.last_row_id, messageId: resendResult.id }));
    } catch (e: any) {
      // Save to outbox on network/exception failure
      env.DB.prepare(
        `INSERT INTO outbox (user_id, to_address, cc_address, bcc_address, subject, body, html, from_address, from_name, reply_to_id, attachments, error_message, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'failed')`
      ).bind(user!.sub, toList!.join(','), ccList?.join(',') || null, bccList?.join(',') || null, subject, body || '', htmlContent, senderEmail, senderName, replyToId || null, clientAttachments ? JSON.stringify(clientAttachments) : null, e.message).run();
      sendResult(res, json({ error: e.message, saved_to_outbox: true }, 500));
    }
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// OUTBOX
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/outbox', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT * FROM outbox WHERE user_id = ? AND status = ? ORDER BY created_at DESC').bind(user!.sub, 'failed').all();
    sendResult(res, json({ outbox: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/outbox/:id/retry', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = req.params.id;
    const item = env.DB.prepare('SELECT * FROM outbox WHERE id = ? AND user_id = ?').bind(id, user!.sub).first() as any;
    if (!item) return sendResult(res, errorResp('Outbox item not found', 404));

    const toList = item.to_address.split(',').map((s: string) => s.trim()).filter(Boolean);
    const ccList = item.cc_address ? item.cc_address.split(',').map((s: string) => s.trim()).filter(Boolean) : null;
    const bccList = item.bcc_address ? item.bcc_address.split(',').map((s: string) => s.trim()).filter(Boolean) : null;
    const clientAttachments = item.attachments ? JSON.parse(item.attachments) : null;

    env.DB.prepare("UPDATE outbox SET status = 'retrying', retry_count = retry_count + 1, updated_at = datetime('now') WHERE id = ?").bind(id).run();

    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${item.from_name} <${item.from_address}>`,
          to: toList,
          ...(ccList && ccList.length > 0 ? { cc: ccList } : {}),
          ...(bccList && bccList.length > 0 ? { bcc: bccList } : {}),
          subject: item.subject,
          text: item.body || '',
          html: item.html || '',
          ...(clientAttachments && clientAttachments.length > 0 ? {
            attachments: clientAttachments.map((att: any) => ({ filename: att.filename, content: att.content })),
          } : {}),
        }),
      });

      if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        env.DB.prepare("UPDATE outbox SET status = 'failed', error_message = ?, updated_at = datetime('now') WHERE id = ?").bind(`Resend API error: ${errorText}`, id).run();
        return sendResult(res, json({ error: `Retry failed: ${errorText}` }, 500));
      }

      const resendResult = await resendResponse.json() as any;

      // Move to sent emails
      const sentFolder = env.DB.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').bind(user!.sub, 'sent').first();
      const threadId = generateThreadId({
        messageId: resendResult.id, fromAddress: item.from_address, fromName: item.from_name,
        toAddress: item.to_address, ccAddress: item.cc_address, subject: item.subject,
        text: item.body || '', html: item.html || '', inReplyTo: item.reply_to_id ? String(item.reply_to_id) : null,
        references: null, attachments: [],
      });
      const snippet = generateSnippet(item.body || '');
      const emailResult = env.DB.prepare(
        `INSERT INTO emails (user_id, message_id, thread_id, from_address, from_name, to_address, cc_address, bcc_address, subject, text, html, snippet, folder_id, is_read, direction, status, sent_at, size, has_attachments)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'outbound', 'sent', datetime('now'), ?, ?)`
      ).bind(user!.sub, resendResult.id || null, threadId, item.from_address, item.from_name, item.to_address, item.cc_address, item.bcc_address, item.subject, item.body || '', item.html || '', snippet, sentFolder?.id, item.body?.length || 0, clientAttachments && clientAttachments.length > 0 ? 1 : 0).run();

      if (sentFolder) await updateFolderCounts(env, user!.sub, sentFolder.id);

      const sentEmailId = emailResult.meta?.last_row_id;
      if (clientAttachments && clientAttachments.length > 0 && sentEmailId) {
        for (const att of clientAttachments) {
          const attId = crypto.randomUUID();
          const r2Key = `attachments/${user!.sub}/${sentEmailId}/${attId}/${att.filename}`;
          const binaryStr = Buffer.from(att.content, 'base64');
          await env.R2_BUCKET.put(r2Key, binaryStr, { httpMetadata: { contentType: att.mimeType } });
          env.DB.prepare('INSERT INTO attachments (id, email_id, user_id, filename, mime_type, size, r2_key, is_inline, content_id) VALUES (?, ?, ?, ?, ?, ?, ?, 0, null)')
            .bind(attId, sentEmailId, user!.sub, att.filename, att.mimeType, att.content.length, r2Key).run();
        }
      }

      for (const r of toList) await upsertContact(env, user!.sub, r);
      await auditLog(env, user!.sub, 'send', 'email', String(sentEmailId), req, { to: item.to_address, subject: item.subject, retried: true });

      // Mark outbox item as sent
      env.DB.prepare("UPDATE outbox SET status = 'sent', updated_at = datetime('now') WHERE id = ?").bind(id).run();

      sendResult(res, json({ success: true, id: sentEmailId, messageId: resendResult.id }));
    } catch (e: any) {
      env.DB.prepare("UPDATE outbox SET status = 'failed', error_message = ?, updated_at = datetime('now') WHERE id = ?").bind(e.message, id).run();
      sendResult(res, json({ error: e.message }, 500));
    }
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/outbox/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = req.params.id;
    env.DB.prepare('DELETE FROM outbox WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// SIGNATURE IMAGE UPLOAD
// ══════════════════════════════════════════════════════════════════════════

app.post('/api/settings/signature-image', upload.single('file'), async (req: any, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const file = req.file;
    if (!file) return sendResult(res, errorResp('No file provided', 400));
    const fileId = crypto.randomUUID();
    const ext = file.originalname.split('.').pop() || 'png';
    const r2Key = `signatures/${user!.sub}/${fileId}.${ext}`;
    await env.R2_BUCKET.put(r2Key, file.buffer, { httpMetadata: { contentType: file.mimetype } });
    const imageUrl = `/api/signature-image/${user!.sub}/${fileId}.${ext}`;
    env.DB.prepare('UPDATE user_settings SET signature_image_url = ?, updated_at = datetime(\'now\') WHERE user_id = ?').bind(imageUrl, user!.sub).run();
    sendResult(res, json({ success: true, url: imageUrl }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/settings/signature-image', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    env.DB.prepare('UPDATE user_settings SET signature_image_url = NULL, updated_at = datetime(\'now\') WHERE user_id = ?').bind(user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.get('/api/signature-image/:userId/:filename', async (req, res) => {
  try {
    const r2Key = `signatures/${req.params.userId}/${req.params.filename}`;
    const obj = await env.R2_BUCKET.get(r2Key);
    if (!obj) return res.status(404).send('Not found');
    res.set('Content-Type', obj.httpMetadata?.contentType || 'image/png');
    res.send(obj.body);
  } catch (e: any) { res.status(500).send(e.message); }
});

// ══════════════════════════════════════════════════════════════════════════
// FOLDERS
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/folders', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT * FROM folders WHERE user_id = ? ORDER BY sort_order ASC').bind(user!.sub).all();
    sendResult(res, json({ folders: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/folders', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { name, icon, color } = req.body;
    if (!name) return sendResult(res, errorResp('Folder name required', 400));
    const maxOrder = env.DB.prepare('SELECT MAX(sort_order) as max FROM folders WHERE user_id = ?').bind(user!.sub).first();
    const result = env.DB.prepare('INSERT INTO folders (user_id, name, type, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(user!.sub, name, 'custom', icon || 'folder', color || '#5f6368', (maxOrder?.max || 0) + 1).run();
    sendResult(res, json({ id: result.meta?.last_row_id, name, type: 'custom', icon: icon || 'folder', color: color || '#5f6368' }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.patch('/api/folders/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    const { name, icon, color, sort_order } = req.body;
    const updates: string[] = [];
    const params: any[] = [];
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (icon !== undefined) { updates.push('icon = ?'); params.push(icon); }
    if (color !== undefined) { updates.push('color = ?'); params.push(color); }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); params.push(sort_order); }
    if (updates.length === 0) return sendResult(res, errorResp('No fields to update', 400));
    updates.push("updated_at = datetime('now')");
    params.push(id, user!.sub);
    env.DB.prepare(`UPDATE folders SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).bind(...params).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/folders/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    const folder = env.DB.prepare('SELECT type FROM folders WHERE id = ? AND user_id = ?').bind(id, user!.sub).first();
    if (!folder) return sendResult(res, errorResp('Folder not found', 404));
    if (folder.type !== 'custom') return sendResult(res, errorResp('Cannot delete system folders', 400));
    env.DB.prepare('DELETE FROM folders WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// LABELS
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/labels', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT * FROM labels WHERE user_id = ? ORDER BY name ASC').bind(user!.sub).all();
    sendResult(res, json({ labels: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/labels', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { name, color } = req.body;
    if (!name) return sendResult(res, errorResp('Label name required', 400));
    try {
      const result = env.DB.prepare('INSERT INTO labels (user_id, name, color) VALUES (?, ?, ?)').bind(user!.sub, name, color || '#6B7280').run();
      sendResult(res, json({ id: result.meta?.last_row_id, name, color: color || '#6B7280' }, 201));
    } catch (e: any) { sendResult(res, errorResp('Label already exists', 409)); }
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/emails/:emailId/labels', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const emailId = parseInt(req.params.emailId);
    const { label_ids } = req.body;
    if (!Array.isArray(label_ids)) return sendResult(res, errorResp('label_ids array required', 400));
    env.DB.prepare('DELETE FROM email_labels WHERE email_id = ?').bind(emailId).run();
    for (const labelId of label_ids) {
      env.DB.prepare('INSERT OR IGNORE INTO email_labels (email_id, label_id) VALUES (?, ?)').bind(emailId, labelId).run();
    }
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/labels/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    env.DB.prepare('DELETE FROM labels WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// DRAFTS
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/drafts', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT * FROM drafts WHERE user_id = ? ORDER BY updated_at DESC').bind(user!.sub).all();
    sendResult(res, json({ drafts: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/drafts', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { to_address, cc_address, bcc_address, subject, text, html, in_reply_to } = req.body;
    const result = env.DB.prepare('INSERT INTO drafts (user_id, to_address, cc_address, bcc_address, subject, text, html, in_reply_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(user!.sub, to_address || null, cc_address || null, bcc_address || null, subject || null, text || null, html || null, in_reply_to || null).run();
    sendResult(res, json({ id: result.meta?.last_row_id }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.put('/api/drafts/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    const { to_address, cc_address, bcc_address, subject, text, html } = req.body;
    env.DB.prepare('UPDATE drafts SET to_address = ?, cc_address = ?, bcc_address = ?, subject = ?, text = ?, html = ?, updated_at = datetime(\'now\') WHERE id = ? AND user_id = ?')
      .bind(to_address || null, cc_address || null, bcc_address || null, subject || null, text || null, html || null, id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/drafts/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    env.DB.prepare('DELETE FROM drafts WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/settings', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    let settings = env.DB.prepare('SELECT * FROM user_settings WHERE user_id = ?').bind(user!.sub).first();
    if (!settings) {
      env.DB.prepare('INSERT INTO user_settings (user_id) VALUES (?)').bind(user!.sub).run();
      settings = env.DB.prepare('SELECT * FROM user_settings WHERE user_id = ?').bind(user!.sub).first();
    }
    sendResult(res, json(settings));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.put('/api/settings', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const body = req.body;
    const allowed = ['theme', 'density', 'language', 'signature_html', 'signature_image_url', 'auto_save_drafts', 'show_snippets', 'items_per_page', 'reply_to_address', 'forward_to_address', 'notify_on_new_email', 'vacation_enabled', 'vacation_subject', 'vacation_body', 'vacation_start', 'vacation_end'];
    const updates: string[] = [];
    const params: any[] = [];
    for (const [key, value] of Object.entries(body)) {
      if (allowed.includes(key)) { updates.push(`${key} = ?`); params.push(value); }
    }
    if (updates.length === 0) return sendResult(res, errorResp('No valid fields to update', 400));
    updates.push("updated_at = datetime('now')");
    params.push(user!.sub);
    env.DB.prepare(`UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?`).bind(...params).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// CONTACTS
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/contacts', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const search = req.query.search as string;
    let query = 'SELECT * FROM contacts WHERE user_id = ?';
    const params: any[] = [user!.sub];
    if (search) { query += ' AND (email LIKE ? OR display_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY display_name ASC, email ASC LIMIT 100';
    const { results } = env.DB.prepare(query).bind(...params).all();
    sendResult(res, json({ contacts: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// ATTACHMENTS
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/attachments/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = req.params.id;
    const attachment = env.DB.prepare('SELECT * FROM attachments WHERE id = ? AND user_id = ?').bind(id, user!.sub).first();
    if (!attachment) return sendResult(res, errorResp('Attachment not found', 404));
    const obj = await env.R2_BUCKET.get(attachment.r2_key);
    if (!obj) return sendResult(res, errorResp('File not found in storage', 404));
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
    res.send(obj.body);
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/admin/users', async (req, res) => {
  try {
    const { user, error: authError } = await adminAuth(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT id, email, display_name, role, is_active, avatar_url, storage_quota, storage_used, created_at, last_login_at FROM users ORDER BY created_at DESC').all();
    sendResult(res, json({ users: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/admin/users', async (req, res) => {
  try {
    const { user, error: authError } = await adminAuth(req);
    if (authError) return sendResult(res, authError);
    const { email, password, display_name, role } = req.body;
    if (!email || !password) return sendResult(res, errorResp('Email and password required', 400));
    const existing = env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
    if (existing) return sendResult(res, errorResp('Email already registered', 409));
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const result = env.DB.prepare('INSERT INTO users (email, display_name, password_hash, password_salt, role) VALUES (?, ?, ?, ?, ?)')
      .bind(email.toLowerCase(), display_name || '', passwordHash, salt, role || 'user').run();
    const userId = result.meta?.last_row_id;
    await createDefaultFolders(env, userId);
    env.DB.prepare('INSERT INTO user_settings (user_id) VALUES (?)').bind(userId).run();
    await auditLog(env, user!.sub, 'create_user', 'user', String(userId), req, { email });
    sendResult(res, json({ id: userId, email: email.toLowerCase(), display_name: display_name || '', role: role || 'user' }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.patch('/api/admin/users/:id', async (req, res) => {
  try {
    const { user, error: authError } = await adminAuth(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    const { is_active, role, display_name, storage_quota, password } = req.body;
    const updates: string[] = [];
    const params: any[] = [];
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }
    if (role !== undefined) { updates.push('role = ?'); params.push(role); }
    if (display_name !== undefined) { updates.push('display_name = ?'); params.push(display_name); }
    if (storage_quota !== undefined) { updates.push('storage_quota = ?'); params.push(storage_quota); }
    if (password) {
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);
      updates.push('password_hash = ?', 'password_salt = ?');
      params.push(hash, salt);
    }
    if (updates.length === 0) return sendResult(res, errorResp('No fields to update', 400));
    params.push(id);
    env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
    await auditLog(env, user!.sub, 'update_user', 'user', String(id), req);
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { user, error: authError } = await adminAuth(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    if (id === user!.sub) return sendResult(res, errorResp('Cannot delete yourself', 400));
    env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    await auditLog(env, user!.sub, 'delete_user', 'user', String(id), req);
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.get('/api/admin/audit', async (req, res) => {
  try {
    const { user, error: authError } = await adminAuth(req);
    if (authError) return sendResult(res, authError);
    const page = parseInt(req.query.page as string || '1');
    const limit = 50;
    const offset = (page - 1) * limit;
    const { results } = env.DB.prepare('SELECT a.*, u.email as user_email FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
    sendResult(res, json({ logs: results, page }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const { user, error: authError } = await adminAuth(req);
    if (authError) return sendResult(res, authError);
    const totalUsers = env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
    const activeUsers = env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').first();
    const totalEmails = env.DB.prepare('SELECT COUNT(*) as count FROM emails').first();
    const totalStorage = env.DB.prepare('SELECT SUM(storage_used) as total FROM users').first();
    sendResult(res, json({
      totalUsers: totalUsers?.count || 0,
      activeUsers: activeUsers?.count || 0,
      totalEmails: totalEmails?.count || 0,
      totalStorageUsed: totalStorage?.total || 0,
    }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// SIGNATURES
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/signatures', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT * FROM signatures WHERE user_id = ?').bind(user!.sub).all();
    sendResult(res, json({ signatures: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/signatures', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { name, html, is_default } = req.body;
    if (is_default) env.DB.prepare('UPDATE signatures SET is_default = 0 WHERE user_id = ?').bind(user!.sub).run();
    const result = env.DB.prepare('INSERT INTO signatures (user_id, name, html, is_default) VALUES (?, ?, ?, ?)').bind(user!.sub, name || 'Default', html || '', is_default ? 1 : 0).run();
    sendResult(res, json({ id: result.meta?.last_row_id }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/signatures/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    env.DB.prepare('DELETE FROM signatures WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// ALIASES
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/aliases', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT * FROM aliases WHERE user_id = ?').bind(user!.sub).all();
    sendResult(res, json({ aliases: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/aliases', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { alias_email, forward_to } = req.body;
    if (!alias_email || !forward_to) return sendResult(res, errorResp('alias_email and forward_to required', 400));
    try {
      const result = env.DB.prepare('INSERT INTO aliases (user_id, alias_email, forward_to) VALUES (?, ?, ?)').bind(user!.sub, alias_email, forward_to).run();
      sendResult(res, json({ id: result.meta?.last_row_id }, 201));
    } catch (e: any) { sendResult(res, errorResp('Alias already exists', 409)); }
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/aliases/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    env.DB.prepare('DELETE FROM aliases WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// SESSIONS
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/sessions', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare("SELECT id, device_info, ip_address, created_at, expires_at FROM sessions WHERE user_id = ? AND expires_at > datetime('now') ORDER BY created_at DESC").bind(user!.sub).all();
    sendResult(res, json({ sessions: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = req.params.id;
    env.DB.prepare('DELETE FROM sessions WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// SNOOZE
// ══════════════════════════════════════════════════════════════════════════

app.post('/api/emails/:id/snooze', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    const { snooze_until } = req.body;
    if (!snooze_until) return sendResult(res, errorResp('snooze_until required', 400));
    env.DB.prepare("UPDATE emails SET snooze_until = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?").bind(snooze_until, id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/emails/:id/unsnooze', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    env.DB.prepare("UPDATE emails SET snooze_until = NULL, updated_at = datetime('now') WHERE id = ? AND user_id = ?").bind(id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// CALENDAR
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/calendar/events', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const start = req.query.start as string;
    const end = req.query.end as string;
    let q = 'SELECT * FROM calendar_events WHERE user_id = ?';
    const p: any[] = [user!.sub];
    if (start && end) { q += ' AND start_time >= ? AND end_time <= ?'; p.push(start, end); }
    q += ' ORDER BY start_time ASC';
    const { results } = env.DB.prepare(q).bind(...p).all();
    sendResult(res, json({ events: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/calendar/events', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { title, description, location, start_time, end_time, all_day, color, reminder_minutes } = req.body;
    if (!title || !start_time || !end_time) return sendResult(res, errorResp('title, start_time, end_time required', 400));
    const result = env.DB.prepare('INSERT INTO calendar_events (user_id, title, description, location, start_time, end_time, all_day, color, reminder_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(user!.sub, title, description || null, location || null, start_time, end_time, all_day || 0, color || '#F2782E', reminder_minutes || 15).run();
    sendResult(res, json({ id: result.meta?.last_row_id }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.put('/api/calendar/events/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    const { title, description, location, start_time, end_time, all_day, color, reminder_minutes } = req.body;
    env.DB.prepare("UPDATE calendar_events SET title=?, description=?, location=?, start_time=?, end_time=?, all_day=?, color=?, reminder_minutes=?, updated_at=datetime('now') WHERE id=? AND user_id=?")
      .bind(title, description || null, location || null, start_time, end_time, all_day || 0, color || '#F2782E', reminder_minutes || 15, id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/calendar/events/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    env.DB.prepare('DELETE FROM calendar_events WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// CHAT
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/chat/conversations', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT * FROM chat_conversations WHERE user_id = ? ORDER BY last_message_at DESC NULLS LAST').bind(user!.sub).all();
    sendResult(res, json({ conversations: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/chat/conversations', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { participant_email, participant_name } = req.body;
    if (!participant_email) return sendResult(res, errorResp('participant_email required', 400));
    const result = env.DB.prepare('INSERT INTO chat_conversations (user_id, participant_email, participant_name) VALUES (?, ?, ?)').bind(user!.sub, participant_email, participant_name || null).run();
    sendResult(res, json({ id: result.meta?.last_row_id }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.get('/api/chat/conversations/:convId/messages', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const convId = parseInt(req.params.convId);
    const { results } = env.DB.prepare('SELECT * FROM chat_messages WHERE conversation_id = ? AND user_id = ? ORDER BY created_at ASC').bind(convId, user!.sub).all();
    sendResult(res, json({ messages: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/chat/conversations/:convId/messages', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const convId = parseInt(req.params.convId);
    const { body, sender_email, sender_name, direction } = req.body;
    if (!body) return sendResult(res, errorResp('body required', 400));
    const result = env.DB.prepare('INSERT INTO chat_messages (conversation_id, user_id, sender_email, sender_name, body, direction) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(convId, user!.sub, sender_email || '', sender_name || '', body, direction || 'outbound').run();
    env.DB.prepare("UPDATE chat_conversations SET last_message = ?, last_message_at = datetime('now') WHERE id = ?").bind(body.substring(0, 100), convId).run();
    sendResult(res, json({ id: result.meta?.last_row_id }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/chat/conversations/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    env.DB.prepare('DELETE FROM chat_conversations WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// FILES
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/files', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT id, filename, mime_type, size, folder, is_starred, created_at FROM files WHERE user_id = ? ORDER BY created_at DESC').bind(user!.sub).all();
    sendResult(res, json({ files: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/files/upload', upload.single('file'), async (req: any, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);

    const file = req.file;
    if (!file) return sendResult(res, errorResp('No file provided', 400));

    const fileId = crypto.randomUUID();
    const r2Key = `files/${user!.sub}/${fileId}/${file.originalname}`;
    await env.R2_BUCKET.put(r2Key, file.buffer, { httpMetadata: { contentType: file.mimetype } });
    env.DB.prepare('INSERT INTO files (id, user_id, filename, mime_type, size, r2_key) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(fileId, user!.sub, file.originalname, file.mimetype, file.size, r2Key).run();
    env.DB.prepare('UPDATE users SET storage_used = storage_used + ? WHERE id = ?').bind(file.size, user!.sub).run();
    sendResult(res, json({ id: fileId, filename: file.originalname, size: file.size }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.get('/api/files/:fileId/download', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const fileId = req.params.fileId;
    const file = env.DB.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?').bind(fileId, user!.sub).first();
    if (!file) return sendResult(res, errorResp('File not found', 404));
    const obj = await env.R2_BUCKET.get(file.r2_key);
    if (!obj) return sendResult(res, errorResp('File not in storage', 404));
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(obj.body);
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/files/:fileId', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const fileId = req.params.fileId;
    const file = env.DB.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?').bind(fileId, user!.sub).first();
    if (!file) return sendResult(res, errorResp('File not found', 404));
    await env.R2_BUCKET.delete(file.r2_key);
    env.DB.prepare('DELETE FROM files WHERE id = ? AND user_id = ?').bind(fileId, user!.sub).run();
    env.DB.prepare('UPDATE users SET storage_used = MAX(0, storage_used - ?) WHERE id = ?').bind(file.size, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// STORAGE USAGE
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/storage', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const userData = env.DB.prepare('SELECT storage_quota, storage_used FROM users WHERE id = ?').bind(user!.sub).first();
    sendResult(res, json({ quota: userData?.storage_quota || 0, used: userData?.storage_used || 0 }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// UNREAD COUNT (for polling)
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/emails/unread-count', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results: folders } = env.DB.prepare('SELECT id, name, type, unread_count, total_count FROM folders WHERE user_id = ? ORDER BY sort_order ASC').bind(user!.sub).all();
    const totalUnread = env.DB.prepare('SELECT COUNT(*) as count FROM emails WHERE user_id = ? AND is_read = 0 AND folder_id IN (SELECT id FROM folders WHERE user_id = ? AND type = ?)').bind(user!.sub, user!.sub, 'inbox').first();
    sendResult(res, json({ folders, totalUnread: totalUnread?.count || 0 }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// INBOUND EMAIL WEBHOOK (Resend Inbound)
// ══════════════════════════════════════════════════════════════════════════

app.post('/api/inbound-email', express.raw({ type: '*/*', limit: '50mb' }), async (req, res) => {
  try {
    const rawEmail = req.body as Buffer;
    const parsed = await parseRawEmail(rawEmail.buffer.slice(rawEmail.byteOffset, rawEmail.byteOffset + rawEmail.byteLength) as ArrayBuffer);

    // Find the user by the recipient email
    const recipientEmail = parsed.toAddress.split(',')[0].trim().toLowerCase();
    const user = env.DB.prepare('SELECT id FROM users WHERE email = ? AND is_active = 1').bind(recipientEmail).first() as any;

    if (!user) {
      // Try linked accounts
      const linked = env.DB.prepare('SELECT user_id FROM linked_accounts WHERE email = ? AND is_active = 1').bind(recipientEmail).first() as any;
      if (!linked) {
        console.log(`Rejected inbound email for ${recipientEmail} - no matching user`);
        return res.status(200).json({ status: 'ignored', reason: 'no matching user' });
      }
      user.id = linked.user_id;
    }

    // Check if sender is blocked
    const blocked = env.DB.prepare('SELECT id FROM blocked_senders WHERE user_id = ? AND email_address = ?').bind(user.id, parsed.fromAddress.toLowerCase()).first();
    if (blocked) {
      env.DB.prepare('INSERT INTO security_log (user_id, event_type, details) VALUES (?, ?, ?)').bind(
        user.id, 'sender_blocked', JSON.stringify({ from: parsed.fromAddress, subject: parsed.subject })
      ).run();
      console.log(`Email from blocked sender ${parsed.fromAddress} rejected`);
      return res.status(200).json({ status: 'blocked', reason: 'sender blocked' });
    }

    // Check if sender is trusted
    const trusted = env.DB.prepare('SELECT id FROM trusted_senders WHERE user_id = ? AND email_address = ?').bind(user.id, parsed.fromAddress.toLowerCase()).first();

    // Run spam analysis
    const security = trusted ? { spamScore: 0, isSpam: false, flags: { phishing: false, suspicious_links: false, spoofed_sender: false, high_risk_keywords: false, mismatched_urls: false, excessive_caps: false, suspicious_attachment: false }, reason: 'trusted sender' } : analyzeEmailSecurity({
      fromAddress: parsed.fromAddress,
      fromName: parsed.fromName,
      toAddress: parsed.toAddress,
      subject: parsed.subject,
      text: parsed.text,
      html: parsed.html,
      attachments: parsed.attachments.map(a => ({ filename: a.filename, mimeType: a.mimeType })),
    });

    const inboxFolder = env.DB.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').bind(user.id, 'inbox').first() as any;
    const spamFolder = env.DB.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').bind(user.id, 'spam').first() as any;

    // Route to spam folder if spam score >= 50
    let targetFolder = security.isSpam ? spamFolder : inboxFolder;
    let markAsRead = 0;
    let markAsStarred = 0;

    // Apply email rules/filters (only if not spam)
    if (!security.isSpam) {
      const { results: rules } = env.DB.prepare('SELECT * FROM email_rules WHERE user_id = ? AND is_active = 1 ORDER BY priority ASC').bind(user.id).all();
      for (const rule of rules as any[]) {
        let matches = false;
        const fieldValue = rule.condition_field === 'from' ? parsed.fromAddress.toLowerCase() :
                           rule.condition_field === 'subject' ? (parsed.subject || '').toLowerCase() :
                           rule.condition_field === 'to' ? parsed.toAddress.toLowerCase() :
                           (parsed.text || '').toLowerCase();
        const condValue = rule.condition_value.toLowerCase();
        switch (rule.condition_op) {
          case 'contains': matches = fieldValue.includes(condValue); break;
          case 'equals': matches = fieldValue === condValue; break;
          case 'starts_with': matches = fieldValue.startsWith(condValue); break;
          case 'ends_with': matches = fieldValue.endsWith(condValue); break;
        }
        if (matches) {
          switch (rule.action) {
            case 'move_to_folder':
              const ruleFolder = env.DB.prepare('SELECT id FROM folders WHERE id = ? AND user_id = ?').bind(parseInt(rule.action_value), user.id).first();
              if (ruleFolder) targetFolder = ruleFolder as any;
              break;
            case 'mark_read': markAsRead = 1; break;
            case 'mark_star': markAsStarred = 1; break;
            case 'delete':
              console.log(`Email deleted by rule: ${rule.name}`);
              return res.status(200).json({ status: 'filtered', rule: rule.name });
            case 'block_sender':
              env.DB.prepare('INSERT OR IGNORE INTO blocked_senders (user_id, email_address, reason) VALUES (?, ?, ?)').bind(user.id, parsed.fromAddress.toLowerCase(), 'rule').run();
              return res.status(200).json({ status: 'filtered', rule: rule.name });
          }
          break; // Only apply first matching rule
        }
      }
    }

    const threadId = generateThreadId(parsed);
    const snippet = generateSnippet(parsed.text);
    const size = new TextEncoder().encode(parsed.text + (parsed.html || '')).length;

    const emailResult = env.DB.prepare(
      `INSERT INTO emails (user_id, message_id, thread_id, in_reply_to, ref_header, from_address, from_name, to_address, cc_address, subject, text, html, snippet, folder_id, direction, status, size, has_attachments, spam_score, is_spam, security_flags, is_read, is_starred)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'inbound', 'received', ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      user.id, parsed.messageId, threadId, parsed.inReplyTo, parsed.references,
      parsed.fromAddress, parsed.fromName, parsed.toAddress, parsed.ccAddress,
      parsed.subject, parsed.text, parsed.html, snippet, targetFolder?.id,
      size, parsed.attachments.length > 0 ? 1 : 0,
      security.spamScore, security.isSpam ? 1 : 0, JSON.stringify(security.flags),
      markAsRead, markAsStarred
    ).run();

    const emailId = emailResult.meta?.last_row_id;

    // Log security events
    if (security.isSpam) {
      env.DB.prepare('INSERT INTO security_log (user_id, event_type, email_id, details) VALUES (?, ?, ?, ?)').bind(
        user.id, 'spam_detected', emailId, JSON.stringify({ from: parsed.fromAddress, subject: parsed.subject, score: security.spamScore, reason: security.reason })
      ).run();
    }
    if (security.flags.phishing) {
      env.DB.prepare('INSERT INTO security_log (user_id, event_type, email_id, details) VALUES (?, ?, ?, ?)').bind(
        user.id, 'phishing_blocked', emailId, JSON.stringify({ from: parsed.fromAddress, subject: parsed.subject, score: security.spamScore })
      ).run();
    }

    for (const attachment of parsed.attachments) {
      const attId = crypto.randomUUID();
      const r2Key = `attachments/${user.id}/${emailId}/${attId}/${attachment.filename}`;
      await env.R2_BUCKET.put(r2Key, attachment.content, { httpMetadata: { contentType: attachment.mimeType } });
      env.DB.prepare(
        'INSERT INTO attachments (id, email_id, user_id, filename, mime_type, size, r2_key, is_inline, content_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(attId, emailId, user.id, attachment.filename, attachment.mimeType, attachment.size, r2Key, attachment.isInline ? 1 : 0, attachment.contentId || null).run();
    }

    if (inboxFolder) await updateFolderCounts(env, user.id, inboxFolder.id);
    if (spamFolder && security.isSpam) await updateFolderCounts(env, user.id, spamFolder.id);
    if (targetFolder && targetFolder !== inboxFolder && targetFolder !== spamFolder) await updateFolderCounts(env, user.id, targetFolder.id);
    await upsertContact(env, user.id, parsed.fromAddress, parsed.fromName);

    // Send push notification via WebSocket
    if (!security.isSpam) {
      try {
        const userEmail = env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(user.id).first() as any;
        if (userEmail?.email) {
          broadcastNotification(userEmail.email, {
            type: 'new_email',
            from: parsed.fromAddress,
            from_name: parsed.fromName,
            subject: parsed.subject || '(no subject)',
            email_id: emailId,
          });
        }
      } catch (pushErr) { console.error('WS notification failed:', pushErr); }
    }

    // Vacation auto-reply
    if (!security.isSpam) {
      const vacation = env.DB.prepare('SELECT vacation_enabled, vacation_subject, vacation_body, vacation_start, vacation_end FROM user_settings WHERE user_id = ?').bind(user.id).first() as any;
      if (vacation?.vacation_enabled) {
        const now = new Date();
        const start = vacation.vacation_start ? new Date(vacation.vacation_start) : null;
        const end = vacation.vacation_end ? new Date(vacation.vacation_end) : null;
        const inRange = (!start || now >= start) && (!end || now <= end);
        if (inRange && vacation.vacation_body) {
          try {
            const senderName = env.DB.prepare('SELECT display_name, email FROM users WHERE id = ?').bind(user.id).first() as any;
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: `${senderName?.display_name || 'Auto-Reply'} <${senderName?.email}>`,
                to: parsed.fromAddress,
                subject: vacation.vacation_subject || 'Out of Office',
                text: vacation.vacation_body,
              }),
            });
          } catch (e) { console.error('Vacation auto-reply failed:', e); }
        }
      }
    }

    console.log(`Inbound email stored: ${parsed.subject} for ${recipientEmail}`);
    res.status(200).json({ status: 'stored', emailId });
  } catch (e: any) {
    console.error('Inbound email error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// LINKED ACCOUNTS (Multi-account management)
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/linked-accounts', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT * FROM linked_accounts WHERE user_id = ? ORDER BY is_default DESC, created_at ASC').bind(user!.sub).all();
    const dbUser = env.DB.prepare('SELECT email, display_name FROM users WHERE id = ?').bind(user!.sub).first();
    sendResult(res, json({ accounts: results, primaryEmail: dbUser?.email, primaryName: dbUser?.display_name }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/linked-accounts', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { email, display_name } = req.body;
    if (!email) return sendResult(res, errorResp('Email is required', 400));

    const existing = env.DB.prepare('SELECT id FROM linked_accounts WHERE user_id = ? AND email = ?').bind(user!.sub, email.toLowerCase()).first();
    if (existing) return sendResult(res, errorResp('This account is already linked', 409));

    const result = env.DB.prepare(
      'INSERT INTO linked_accounts (user_id, email, display_name) VALUES (?, ?, ?)'
    ).bind(user!.sub, email.toLowerCase(), display_name || null).run();

    sendResult(res, json({ id: result.meta?.last_row_id, email: email.toLowerCase(), display_name: display_name || null }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/linked-accounts/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    env.DB.prepare('DELETE FROM linked_accounts WHERE id = ? AND user_id = ?').bind(req.params.id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.patch('/api/linked-accounts/:id/default', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    env.DB.prepare('UPDATE linked_accounts SET is_default = 0 WHERE user_id = ?').bind(user!.sub).run();
    env.DB.prepare('UPDATE linked_accounts SET is_default = 1 WHERE id = ? AND user_id = ?').bind(req.params.id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// SECURITY: Blocked Senders, Trusted Senders, Security Log
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/security/blocked', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT * FROM blocked_senders WHERE user_id = ? ORDER BY blocked_at DESC').bind(user!.sub).all();
    sendResult(res, json({ blocked: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/security/block', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { email_address, reason } = req.body;
    if (!email_address) return sendResult(res, errorResp('Email address is required', 400));
    env.DB.prepare('INSERT OR IGNORE INTO blocked_senders (user_id, email_address, reason) VALUES (?, ?, ?)').bind(user!.sub, email_address.toLowerCase(), reason || 'manual').run();
    sendResult(res, json({ success: true }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/security/blocked/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    env.DB.prepare('DELETE FROM blocked_senders WHERE id = ? AND user_id = ?').bind(req.params.id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.get('/api/security/trusted', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT * FROM trusted_senders WHERE user_id = ? ORDER BY added_at DESC').bind(user!.sub).all();
    sendResult(res, json({ trusted: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/security/trust', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { email_address } = req.body;
    if (!email_address) return sendResult(res, errorResp('Email address is required', 400));
    env.DB.prepare('INSERT OR IGNORE INTO trusted_senders (user_id, email_address) VALUES (?, ?)').bind(user!.sub, email_address.toLowerCase()).run();
    // Remove from blocked if present
    env.DB.prepare('DELETE FROM blocked_senders WHERE user_id = ? AND email_address = ?').bind(user!.sub, email_address.toLowerCase()).run();
    sendResult(res, json({ success: true }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/security/trusted/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    env.DB.prepare('DELETE FROM trusted_senders WHERE id = ? AND user_id = ?').bind(req.params.id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.get('/api/security/log', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const limit = parseInt(req.query.limit as string || '50');
    const { results } = env.DB.prepare('SELECT * FROM security_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').bind(user!.sub, limit).all();
    sendResult(res, json({ events: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// 2FA (TOTP)
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/2fa/status', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const u = env.DB.prepare('SELECT totp_enabled FROM users WHERE id = ?').bind(user!.sub).first();
    sendResult(res, json({ enabled: u?.totp_enabled === 1 }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/2fa/setup', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const u = env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(user!.sub).first();
    const secret = generateTotpSecret();
    // Store secret temporarily (not enabled yet)
    env.DB.prepare('UPDATE users SET totp_secret = ? WHERE id = ?').bind(secret, user!.sub).run();
    const otpauthUrl = generateOtpAuthUrl(secret, u?.email || '');
    sendResult(res, json({ secret, otpauthUrl }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/2fa/verify', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { code } = req.body;
    if (!code) return sendResult(res, errorResp('Verification code is required', 400));
    const u = env.DB.prepare('SELECT totp_secret FROM users WHERE id = ?').bind(user!.sub).first();
    if (!u?.totp_secret) return sendResult(res, errorResp('2FA not set up. Call /api/2fa/setup first.', 400));
    if (!verifyTotp(u.totp_secret, code)) return sendResult(res, errorResp('Invalid verification code', 401));
    env.DB.prepare('UPDATE users SET totp_enabled = 1 WHERE id = ?').bind(user!.sub).run();
    await auditLog(env, user!.sub, 'enable_2fa', 'user', String(user!.sub), req);
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/2fa/disable', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { code } = req.body;
    const u = env.DB.prepare('SELECT totp_secret FROM users WHERE id = ?').bind(user!.sub).first();
    if (u?.totp_secret && !verifyTotp(u.totp_secret, code || '')) return sendResult(res, errorResp('Invalid verification code', 401));
    env.DB.prepare('UPDATE users SET totp_enabled = 0, totp_secret = NULL WHERE id = ?').bind(user!.sub).run();
    await auditLog(env, user!.sub, 'disable_2fa', 'user', String(user!.sub), req);
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/templates', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT * FROM email_templates WHERE user_id = ? ORDER BY updated_at DESC').bind(user!.sub).all();
    sendResult(res, json({ templates: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/templates', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { name, subject, body, html, category } = req.body;
    if (!name) return sendResult(res, errorResp('Template name is required', 400));
    const result = env.DB.prepare('INSERT INTO email_templates (user_id, name, subject, body, html, category) VALUES (?, ?, ?, ?, ?, ?)').bind(user!.sub, name, subject || null, body || null, html || null, category || 'general').run();
    sendResult(res, json({ id: result.meta?.last_row_id }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.put('/api/templates/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { name, subject, body, html, category } = req.body;
    env.DB.prepare('UPDATE email_templates SET name = ?, subject = ?, body = ?, html = ?, category = ?, updated_at = datetime(\'now\') WHERE id = ? AND user_id = ?').bind(name, subject, body, html, category || 'general', req.params.id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/templates/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    env.DB.prepare('DELETE FROM email_templates WHERE id = ? AND user_id = ?').bind(req.params.id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// EMAIL RULES / FILTERS
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/rules', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT * FROM email_rules WHERE user_id = ? ORDER BY priority ASC, created_at ASC').bind(user!.sub).all();
    sendResult(res, json({ rules: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.post('/api/rules', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { name, condition_field, condition_op, condition_value, action, action_value, priority } = req.body;
    if (!name || !condition_field || !condition_op || !condition_value || !action) return sendResult(res, errorResp('Missing required fields', 400));
    const result = env.DB.prepare('INSERT INTO email_rules (user_id, name, condition_field, condition_op, condition_value, action, action_value, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(user!.sub, name, condition_field, condition_op, condition_value, action, action_value || null, priority || 0).run();
    sendResult(res, json({ id: result.meta?.last_row_id }, 201));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.put('/api/rules/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { name, condition_field, condition_op, condition_value, action, action_value, priority, is_active } = req.body;
    env.DB.prepare('UPDATE email_rules SET name = ?, condition_field = ?, condition_op = ?, condition_value = ?, action = ?, action_value = ?, priority = ?, is_active = ? WHERE id = ? AND user_id = ?').bind(name, condition_field, condition_op, condition_value, action, action_value || null, priority || 0, is_active !== undefined ? is_active : 1, req.params.id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.delete('/api/rules/:id', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    env.DB.prepare('DELETE FROM email_rules WHERE id = ? AND user_id = ?').bind(req.params.id, user!.sub).run();
    sendResult(res, json({ success: true }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// READ RECEIPTS
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/emails/:id/receipts', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const { results } = env.DB.prepare('SELECT * FROM read_receipts WHERE email_id = ? AND user_id = ? ORDER BY read_at DESC').bind(req.params.id, user!.sub).all();
    sendResult(res, json({ receipts: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

app.get('/api/emails/:id/delivery', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const emailId = parseInt(req.params.id);
    const email = env.DB.prepare('SELECT id, delivery_status, to_address, cc_address, bcc_address, message_id FROM emails WHERE id = ? AND user_id = ?').bind(emailId, user!.sub).first() as any;
    if (!email) return sendResult(res, errorResp('Email not found', 404));
    const { results: events } = env.DB.prepare('SELECT id, recipient, event_type, event_data, created_at FROM delivery_events WHERE email_id = ? ORDER BY created_at ASC').bind(emailId).all();
    sendResult(res, json({ delivery_status: email.delivery_status, message_id: email.message_id, events }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// RESEND WEBHOOK — delivery tracking
// ══════════════════════════════════════════════════════════════════════════

app.post('/api/webhooks/resend', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const rawBody = req.body.toString('utf8');

    // Verify Svix signature
    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || '';

    if (webhookSecret && svixId && svixTimestamp && svixSignature) {
      // Check timestamp tolerance (5 minutes)
      const now = Math.floor(Date.now() / 1000);
      const ts = parseInt(svixTimestamp, 10);
      if (Math.abs(now - ts) > 300) {
        console.error('Webhook timestamp outside tolerance');
        return res.status(401).json({ error: 'Stale webhook' });
      }

      // Decode secret (strip whsec_ prefix, base64 decode)
      const secretKey = webhookSecret.startsWith('whsec_') ? webhookSecret.slice(6) : webhookSecret;
      const secretBytes = Buffer.from(secretKey, 'base64');

      // Compute expected signature: HMAC-SHA256 over "{id}.{timestamp}.{body}"
      const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
      const expectedSig = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');

      // Check against provided signatures (space-separated, each "v1,<sig>")
      const signatures = svixSignature.split(' ');
      const valid = signatures.some(sig => {
        const parts = sig.split(',');
        if (parts.length === 2 && parts[0] === 'v1') {
          return crypto.timingSafeEqual(Buffer.from(parts[1]), Buffer.from(expectedSig));
        }
        return false;
      });

      if (!valid) {
        console.error('Webhook signature verification failed');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } else if (webhookSecret) {
      console.error('Webhook missing Svix headers');
      return res.status(401).json({ error: 'Missing signature headers' });
    }

    const { type, data } = JSON.parse(rawBody);
    if (!type || !data) return res.status(200).json({ ok: true });

    const messageId = data.email_id || data.message_id || null;
    const recipient = data.to || data.recipient || null;

    // Find the email by message_id
    let emailRow = null;
    if (messageId) {
      emailRow = env.DB.prepare('SELECT id, user_id FROM emails WHERE message_id = ?').bind(messageId).first() as any;
    }

    // Map Resend event types to delivery status
    const statusMap: Record<string, string> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
    };
    const deliveryStatus = statusMap[type] || type;

    // Store the event
    env.DB.prepare(
      'INSERT INTO delivery_events (email_id, message_id, recipient, event_type, event_data) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      emailRow?.id || null,
      messageId,
      recipient,
      type,
      JSON.stringify(data)
    ).run();

    // Update email delivery_status (only for the most significant event)
    if (emailRow?.id) {
      const priority = ['bounced', 'complained', 'delivered', 'opened', 'clicked', 'sent'];
      const current = env.DB.prepare('SELECT delivery_status FROM emails WHERE id = ?').bind(emailRow.id).first() as any;
      const currentStatus = current?.delivery_status || 'sent';
      if (priority.indexOf(deliveryStatus) < priority.indexOf(currentStatus)) {
        env.DB.prepare('UPDATE emails SET delivery_status = ? WHERE id = ?').bind(deliveryStatus, emailRow.id).run();
      }
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).json({ ok: true });
  }
});

// Read receipt tracking pixel endpoint (no auth — called by email client)
app.get('/api/track/open/:emailId/:userId', async (req, res) => {
  try {
    const emailId = parseInt(req.params.emailId);
    const userId = parseInt(req.params.userId);
    const email = env.DB.prepare('SELECT from_address, subject FROM emails WHERE id = ? AND user_id = ?').bind(emailId, userId).first() as any;
    if (email) {
      env.DB.prepare('INSERT INTO read_receipts (user_id, email_id, recipient, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)').bind(
        userId, emailId, email.from_address, req.headers['x-forwarded-for'] || req.socket.remoteAddress || null, req.headers['user-agent'] || null
      ).run();
    }
    // Return 1x1 transparent GIF
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.send(pixel);
  } catch { res.status(404).end(); }
});

// ══════════════════════════════════════════════════════════════════════════
// VACATION RESPONDER (check on inbound email)
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
// EMAIL THREAD (conversation view)
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/emails/:id/thread', async (req, res) => {
  try {
    const { user, error: authError } = await authMiddleware(req);
    if (authError) return sendResult(res, authError);
    const id = parseInt(req.params.id);
    const emailData = env.DB.prepare('SELECT thread_id FROM emails WHERE id = ? AND user_id = ?').bind(id, user!.sub).first() as any;
    if (!emailData?.thread_id) return sendResult(res, json({ thread: [] }));
    const { results } = env.DB.prepare('SELECT id, from_address, from_name, to_address, subject, snippet, text, html, received_at, is_read, direction, has_attachments FROM emails WHERE thread_id = ? AND user_id = ? ORDER BY received_at ASC').bind(emailData.thread_id, user!.sub).all();
    sendResult(res, json({ thread: results }));
  } catch (e: any) { sendResult(res, errorResp(e.message, 500)); }
});

// ══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ── SPA fallback (serve index.html for non-API routes) ───────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/ws')) return res.status(404).json({ error: 'Not found' });
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not found');
  }
});

// ══════════════════════════════════════════════════════════════════════════
// WEBSOCKET NOTIFICATION SERVER
// ══════════════════════════════════════════════════════════════════════════

const wsClients = new Map<string, Set<import('ws').WebSocket>>();

function broadcastNotification(email: string, payload: object) {
  const clients = wsClients.get(email.toLowerCase());
  if (!clients) return;
  const msg = JSON.stringify(payload);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) ws.send(msg);
  }
}

const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', async (ws: import('ws').WebSocket, req) => {
  try {
    const url = new URL(req.url || '', 'http://localhost');
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');
    if (!token || !email) { ws.close(1008, 'Missing credentials'); return; }

    const payload = await verifyJwt(token) as JwtPayload | null;
    if (!payload) { ws.close(1008, 'Invalid token'); return; }

    const userKey = email.toLowerCase();
    if (!wsClients.has(userKey)) wsClients.set(userKey, new Set());
    wsClients.get(userKey)!.add(ws);

    ws.on('close', () => {
      const set = wsClients.get(userKey);
      if (set) { set.delete(ws); if (set.size === 0) wsClients.delete(userKey); }
    });

    ws.send(JSON.stringify({ type: 'connected' }));
  } catch (err) {
    ws.close(1008, 'Auth error');
  }
});

const PORT = parseInt(process.env.PORT || '3000');
httpServer.listen(PORT, '127.0.0.1', () => {
  console.log(`Kreatix Mail server running on http://127.0.0.1:${PORT}`);
  startSyncInterval(env);
});
