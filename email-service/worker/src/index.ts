import PostalMime from 'postal-mime';
import {
  hashPassword, generateSalt, verifyPassword,
  signJwt, verifyJwt, authMiddleware, requireAdmin,
  generateSessionId, hashToken, getExpiry,
  REFRESH_EXPIRES_IN, auditLog,
  type JwtPayload,
} from './auth';
import {
  parseRawEmail, generateThreadId, generateSnippet,
  upsertContact, createDefaultFolders, updateFolderCounts,
  buildEmailHtml,
} from './email-utils';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  RESEND_API_KEY: string;
  R2_BUCKET: R2Bucket;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
}

function errorResp(message: string, status = 400): Response {
  return json({ error: message }, status);
}

const ADMIN_SECRET = 'KreatixAdmin2026!Secret_Xy9Lm';

function adminAuthCheck(request: Request): boolean {
  const secret = request.headers.get('X-Admin-Secret');
  return secret === ADMIN_SECRET;
}

async function adminAuth(request: Request, env: Env): Promise<{ user: JwtPayload | null; error?: Response }> {
  if (adminAuthCheck(request)) {
    return { user: { sub: 0, email: 'system', role: 'admin', type: 'access' } as any };
  }
  return requireAdmin(request, env);
}

// ── Rate limiter (simple in-memory) ───────────────────────────────────────
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ── Non-API routes: serve static assets (SPA) ───────────────────────
    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    // ── API Routes ──────────────────────────────────────────────────────
    try {
      // ════════════════════════════════════════════════════════════════
      // AUTH ROUTES
      // ════════════════════════════════════════════════════════════════

      // ── POST /api/auth/register ──────────────────────────────────────
      if (path === '/api/auth/register' && method === 'POST') {
        const { email, password, display_name } = await request.json() as any;
        if (!email || !password) return errorResp('Email and password are required', 400);

        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
        if (existing) return errorResp('Email already registered', 409);

        const salt = generateSalt();
        const passwordHash = await hashPassword(password, salt);

        const result = await env.DB.prepare(
          'INSERT INTO users (email, display_name, password_hash, password_salt) VALUES (?, ?, ?, ?)'
        ).bind(email.toLowerCase(), display_name || '', passwordHash, salt).run();

        const userId = result.meta?.last_row_id;
        if (!userId) return errorResp('Failed to create user', 500);

        await createDefaultFolders(env, userId);
        await env.DB.prepare('INSERT INTO user_settings (user_id) VALUES (?)').bind(userId).run();

        const inboxFolder = await env.DB.prepare(
          'SELECT id FROM folders WHERE user_id = ? AND type = ?'
        ).bind(userId, 'inbox').first() as any;

        await auditLog(env, userId, 'register', 'user', String(userId), request);

        const accessToken = await signJwt({ sub: userId, email: email.toLowerCase(), role: 'user', type: 'access' });
        const refreshToken = await signJwt({ sub: userId, email: email.toLowerCase(), role: 'user', type: 'refresh' }, REFRESH_EXPIRES_IN);

        const sessionId = generateSessionId();
        const tokenHash = await hashToken(refreshToken);
        await env.DB.prepare(
          'INSERT INTO sessions (id, user_id, token_hash, device_info, ip_address, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
          sessionId, userId, tokenHash,
          request.headers.get('User-Agent') || null,
          request.headers.get('CF-Connecting-IP') || null,
          getExpiry(REFRESH_EXPIRES_IN)
        ).run();

        await env.DB.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").bind(userId).run();

        return json({
          user: { id: userId, email: email.toLowerCase(), display_name: display_name || '', role: 'user' },
          accessToken,
          refreshToken,
          inboxFolderId: inboxFolder?.id,
        }, 201);
      }

      // ── POST /api/auth/login ─────────────────────────────────────────
      if (path === '/api/auth/login' && method === 'POST') {
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!rateLimit(`login:${ip}`, 10, 60000)) {
          return errorResp('Too many login attempts. Please try again later.', 429);
        }

        const { email, password } = await request.json() as any;
        if (!email || !password) return errorResp('Email and password are required', 400);

        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE email = ? AND is_active = 1'
        ).bind(email.toLowerCase()).first() as any;

        if (!user) return errorResp('Invalid email or password', 401);

        const valid = await verifyPassword(password, user.password_salt, user.password_hash);
        if (!valid) return errorResp('Invalid email or password', 401);

        const accessToken = await signJwt({ sub: user.id, email: user.email, role: user.role, type: 'access' });
        const refreshToken = await signJwt({ sub: user.id, email: user.email, role: user.role, type: 'refresh' }, REFRESH_EXPIRES_IN);

        const sessionId = generateSessionId();
        const tokenHash = await hashToken(refreshToken);
        await env.DB.prepare(
          'INSERT INTO sessions (id, user_id, token_hash, device_info, ip_address, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
          sessionId, user.id, tokenHash,
          request.headers.get('User-Agent') || null,
          ip,
          getExpiry(REFRESH_EXPIRES_IN)
        ).run();

        await env.DB.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").bind(user.id).run();
        await auditLog(env, user.id, 'login', 'user', String(user.id), request);

        const inboxFolder = await env.DB.prepare(
          'SELECT id FROM folders WHERE user_id = ? AND type = ?'
        ).bind(user.id, 'inbox').first() as any;

        return json({
          user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role, avatar_url: user.avatar_url },
          accessToken,
          refreshToken,
          inboxFolderId: inboxFolder?.id,
        });
      }

      // ── POST /api/auth/refresh ───────────────────────────────────────
      if (path === '/api/auth/refresh' && method === 'POST') {
        const { refreshToken } = await request.json() as any;
        if (!refreshToken) return errorResp('Refresh token required', 400);

        const payload = await verifyJwt(refreshToken);
        if (!payload || payload.type !== 'refresh') return errorResp('Invalid refresh token', 401);

        const tokenHash = await hashToken(refreshToken);
        const session = await env.DB.prepare(
          'SELECT * FROM sessions WHERE token_hash = ? AND expires_at > datetime(\'now\')'
        ).bind(tokenHash).first() as any;

        if (!session) return errorResp('Session expired', 401);

        const newAccessToken = await signJwt({ sub: payload.sub, email: payload.email, role: payload.role, type: 'access' });
        return json({ accessToken: newAccessToken });
      }

      // ── POST /api/auth/logout ────────────────────────────────────────
      if (path === '/api/auth/logout' && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;

        const body = await request.json().catch(() => ({})) as any;
        if (body.refreshToken) {
          const tokenHash = await hashToken(body.refreshToken);
          await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
        }

        await auditLog(env, user!.sub, 'logout', 'user', String(user!.sub), request);
        return json({ success: true });
      }

      // ── GET /api/auth/me ─────────────────────────────────────────────
      if (path === '/api/auth/me' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;

        const dbUser = await env.DB.prepare(
          'SELECT id, email, display_name, role, is_active, avatar_url, storage_quota, storage_used, created_at, last_login_at FROM users WHERE id = ?'
        ).bind(user!.sub).first() as any;

        if (!dbUser) return errorResp('User not found', 404);

        const settings = await env.DB.prepare('SELECT * FROM user_settings WHERE user_id = ?').bind(user!.sub).first();
        return json({ user: dbUser, settings });
      }

      // ════════════════════════════════════════════════════════════════
      // EMAIL ROUTES (require auth)
      // ════════════════════════════════════════════════════════════════

      // ── GET /api/emails ──────────────────────────────────────────────
      if (path === '/api/emails' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;

        const folderId = url.searchParams.get('folder_id');
        const search = url.searchParams.get('search');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;
        const starred = url.searchParams.get('starred') === 'true';
        const unreadOnly = url.searchParams.get('unread') === 'true';

        let query = 'SELECT id, message_id, thread_id, from_address, from_name, to_address, cc_address, subject, snippet, folder_id, is_read, is_starred, is_important, has_attachments, size, direction, status, received_at, sent_at, snooze_until FROM emails WHERE user_id = ?';
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

        const { results } = await env.DB.prepare(query).bind(...params).all();

        // Fetch labels for the returned emails
        let emailsWithLabels = results;
        if (results.length > 0) {
          const emailIds = results.map((r: any) => r.id);
          const placeholders = emailIds.map(() => '?').join(',');
          const labelRows = await env.DB.prepare(
            `SELECT el.email_id, l.id, l.name, l.color FROM email_labels el JOIN labels l ON l.id = el.label_id WHERE el.email_id IN (${placeholders})`
          ).bind(...emailIds).all();
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
        const countResult = await env.DB.prepare(countQuery).bind(...countParams).first() as any;

        return json({
          emails: emailsWithLabels,
          pagination: { page, limit, total: countResult?.total || 0, totalPages: Math.ceil((countResult?.total || 0) / limit) },
        });
      }

      // ── GET /api/emails/:id ──────────────────────────────────────────
      if (path.match(/^\/api\/emails\/\d+$/) && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;

        const id = parseInt(path.split('/').pop()!);
        const emailData = await env.DB.prepare('SELECT * FROM emails WHERE id = ? AND user_id = ?').bind(id, user!.sub).first() as any;
        if (!emailData) return errorResp('Email not found', 404);

        if (!emailData.is_read) {
          await env.DB.prepare("UPDATE emails SET is_read = 1, updated_at = datetime('now') WHERE id = ?").bind(id).run();
          if (emailData.folder_id) await updateFolderCounts(env, user!.sub, emailData.folder_id);
        }

        const attachments = await env.DB.prepare(
          'SELECT id, filename, mime_type, size, is_inline, content_id, download_url FROM attachments WHERE email_id = ?'
        ).bind(id).all();

        const labels = await env.DB.prepare(
          'SELECT l.* FROM labels l JOIN email_labels el ON l.id = el.label_id WHERE el.email_id = ?'
        ).bind(id).all();

        let thread = null;
        if (emailData.thread_id) {
          thread = await env.DB.prepare(
            'SELECT id, from_address, from_name, subject, snippet, received_at, is_read FROM emails WHERE thread_id = ? AND user_id = ? ORDER BY received_at ASC'
          ).bind(emailData.thread_id, user!.sub).all();
        }

        return json({ ...emailData, is_read: 1, attachments: attachments.results, labels: labels.results, thread: thread?.results || null });
      }

      // ── POST /api/emails/:id/read ────────────────────────────────────
      if (path.match(/^\/api\/emails\/\d+\/read$/) && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/')[3]);
        await env.DB.prepare("UPDATE emails SET is_read = 1, updated_at = datetime('now') WHERE id = ? AND user_id = ?").bind(id, user!.sub).run();
        const emailData = await env.DB.prepare('SELECT folder_id FROM emails WHERE id = ?').bind(id).first() as any;
        if (emailData?.folder_id) await updateFolderCounts(env, user!.sub, emailData.folder_id);
        return json({ success: true });
      }

      // ── POST /api/emails/:id/unread ──────────────────────────────────
      if (path.match(/^\/api\/emails\/\d+\/unread$/) && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/')[3]);
        await env.DB.prepare("UPDATE emails SET is_read = 0, updated_at = datetime('now') WHERE id = ? AND user_id = ?").bind(id, user!.sub).run();
        const emailData = await env.DB.prepare('SELECT folder_id FROM emails WHERE id = ?').bind(id).first() as any;
        if (emailData?.folder_id) await updateFolderCounts(env, user!.sub, emailData.folder_id);
        return json({ success: true });
      }

      // ── POST /api/emails/:id/star ────────────────────────────────────
      if (path.match(/^\/api\/emails\/\d+\/star$/) && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/')[3]);
        const { starred } = await request.json().catch(() => ({})) as any;
        await env.DB.prepare("UPDATE emails SET is_starred = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?")
          .bind(starred ? 1 : 0, id, user!.sub).run();
        return json({ success: true });
      }

      // ── POST /api/emails/bulk ────────────────────────────────────────
      if (path === '/api/emails/bulk' && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;

        const { ids, action, folder_id } = await request.json() as any;
        if (!ids || !Array.isArray(ids) || ids.length === 0) return errorResp('Email IDs required', 400);

        const placeholders = ids.map(() => '?').join(',');
        let query = '';

        switch (action) {
          case 'read':
            query = `UPDATE emails SET is_read = 1, updated_at = datetime('now') WHERE id IN (${placeholders}) AND user_id = ?`;
            await env.DB.prepare(query).bind(...ids, user!.sub).run();
            break;
          case 'unread':
            query = `UPDATE emails SET is_read = 0, updated_at = datetime('now') WHERE id IN (${placeholders}) AND user_id = ?`;
            await env.DB.prepare(query).bind(...ids, user!.sub).run();
            break;
          case 'star':
            query = `UPDATE emails SET is_starred = 1, updated_at = datetime('now') WHERE id IN (${placeholders}) AND user_id = ?`;
            await env.DB.prepare(query).bind(...ids, user!.sub).run();
            break;
          case 'unstar':
            query = `UPDATE emails SET is_starred = 0, updated_at = datetime('now') WHERE id IN (${placeholders}) AND user_id = ?`;
            await env.DB.prepare(query).bind(...ids, user!.sub).run();
            break;
          case 'delete':
            query = `DELETE FROM emails WHERE id IN (${placeholders}) AND user_id = ?`;
            await env.DB.prepare(query).bind(...ids, user!.sub).run();
            break;
          case 'move':
            if (!folder_id) return errorResp('folder_id required for move action', 400);
            query = `UPDATE emails SET folder_id = ?, updated_at = datetime('now') WHERE id IN (${placeholders}) AND user_id = ?`;
            await env.DB.prepare(query).bind(folder_id, ...ids, user!.sub).run();
            break;
          default:
            return errorResp('Invalid action', 400);
        }

        const affectedFolders = await env.DB.prepare(
          `SELECT DISTINCT folder_id FROM emails WHERE id IN (${placeholders})`
        ).bind(...ids).all();
        for (const f of affectedFolders.results as any[]) {
          if (f.folder_id) await updateFolderCounts(env, user!.sub, f.folder_id);
        }
        if (action === 'move' && folder_id) await updateFolderCounts(env, user!.sub, folder_id);

        return json({ success: true, affected: ids.length });
      }

      // ── DELETE /api/emails/:id ───────────────────────────────────────
      if (path.match(/^\/api\/emails\/\d+$/) && method === 'DELETE') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;

        const id = parseInt(path.split('/').pop()!);
        const emailData = await env.DB.prepare('SELECT folder_id FROM emails WHERE id = ? AND user_id = ?').bind(id, user!.sub).first() as any;
        if (!emailData) return errorResp('Email not found', 404);

        const trashFolder = await env.DB.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').bind(user!.sub, 'trash').first() as any;

        if (emailData.folder_id === trashFolder?.id) {
          await env.DB.prepare('DELETE FROM emails WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
        } else {
          await env.DB.prepare("UPDATE emails SET folder_id = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?")
            .bind(trashFolder?.id, id, user!.sub).run();
        }

        if (emailData.folder_id) await updateFolderCounts(env, user!.sub, emailData.folder_id);
        if (trashFolder) await updateFolderCounts(env, user!.sub, trashFolder.id);

        return json({ success: true });
      }

      // ════════════════════════════════════════════════════════════════
      // COMPOSE / SEND
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/send' && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;

        const { to, cc, bcc, subject, body, html, from, fromName, replyToId } = await request.json() as any;
        if (!to || !subject) return errorResp('To and subject are required', 400);

        const dbUser = await env.DB.prepare('SELECT email, display_name FROM users WHERE id = ?').bind(user!.sub).first() as any;
        const senderEmail = from || dbUser.email;
        const senderName = fromName || dbUser.display_name || 'Kreatix Mail User';

        const settings = await env.DB.prepare('SELECT signature_html FROM user_settings WHERE user_id = ?').bind(user!.sub).first() as any;
        const signatureHtml = settings?.signature_html || '';
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
              to: Array.isArray(to) ? to : [to],
              ...(cc ? { cc: Array.isArray(cc) ? cc : [cc] } : {}),
              ...(bcc ? { bcc: Array.isArray(bcc) ? bcc : [bcc] } : {}),
              subject,
              text: body || '',
              html: htmlContent,
            }),
          });

          if (!resendResponse.ok) {
            const errorText = await resendResponse.text();
            return json({ error: `Resend API error: ${errorText}` }, 500);
          }

          const resendResult = await resendResponse.json() as any;

          const sentFolder = await env.DB.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').bind(user!.sub, 'sent').first() as any;

          const threadId = generateThreadId({
            messageId: resendResult.id,
            fromAddress: senderEmail,
            fromName: senderName,
            toAddress: Array.isArray(to) ? to.join(',') : to,
            ccAddress: cc || null,
            subject,
            text: body || '',
            html: htmlContent,
            inReplyTo: replyToId ? String(replyToId) : null,
            references: null,
            attachments: [],
          });

          const snippet = generateSnippet(body || '');

          const emailResult = await env.DB.prepare(
            `INSERT INTO emails (user_id, message_id, thread_id, from_address, from_name, to_address, cc_address, bcc_address, subject, text, html, snippet, folder_id, is_read, direction, status, sent_at, size)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'outbound', 'sent', datetime('now'), ?)`
          ).bind(
            user!.sub, resendResult.id || null, threadId,
            senderEmail, senderName,
            Array.isArray(to) ? to.join(',') : to,
            cc || null, bcc || null,
            subject, body || '', htmlContent, snippet,
            sentFolder?.id,
            new TextEncoder().encode(body || '').length
          ).run();

          if (sentFolder) await updateFolderCounts(env, user!.sub, sentFolder.id);

          const recipients = Array.isArray(to) ? to : [to];
          for (const r of recipients) await upsertContact(env, user!.sub, r);

          await auditLog(env, user!.sub, 'send', 'email', String(emailResult.meta?.last_row_id), request, { to, subject });

          return json({ success: true, id: emailResult.meta?.last_row_id, messageId: resendResult.id });
        } catch (e: any) {
          return json({ error: e.message }, 500);
        }
      }

      // ════════════════════════════════════════════════════════════════
      // FOLDERS
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/folders' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { results } = await env.DB.prepare('SELECT * FROM folders WHERE user_id = ? ORDER BY sort_order ASC').bind(user!.sub).all();
        return json({ folders: results });
      }

      if (path === '/api/folders' && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { name, icon, color } = await request.json() as any;
        if (!name) return errorResp('Folder name required', 400);
        const maxOrder = await env.DB.prepare('SELECT MAX(sort_order) as max FROM folders WHERE user_id = ?').bind(user!.sub).first() as any;
        const result = await env.DB.prepare(
          'INSERT INTO folders (user_id, name, type, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(user!.sub, name, 'custom', icon || 'folder', color || '#5f6368', (maxOrder?.max || 0) + 1).run();
        return json({ id: result.meta?.last_row_id, name, type: 'custom', icon: icon || 'folder', color: color || '#5f6368' }, 201);
      }

      if (path.match(/^\/api\/folders\/\d+$/) && method === 'PATCH') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/').pop()!);
        const { name, icon, color, sort_order } = await request.json() as any;
        const updates: string[] = [];
        const params: any[] = [];
        if (name !== undefined) { updates.push('name = ?'); params.push(name); }
        if (icon !== undefined) { updates.push('icon = ?'); params.push(icon); }
        if (color !== undefined) { updates.push('color = ?'); params.push(color); }
        if (sort_order !== undefined) { updates.push('sort_order = ?'); params.push(sort_order); }
        if (updates.length === 0) return errorResp('No fields to update', 400);
        updates.push("updated_at = datetime('now')");
        params.push(id, user!.sub);
        await env.DB.prepare(`UPDATE folders SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).bind(...params).run();
        return json({ success: true });
      }

      if (path.match(/^\/api\/folders\/\d+$/) && method === 'DELETE') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/').pop()!);
        const folder = await env.DB.prepare('SELECT type FROM folders WHERE id = ? AND user_id = ?').bind(id, user!.sub).first() as any;
        if (!folder) return errorResp('Folder not found', 404);
        if (folder.type !== 'custom') return errorResp('Cannot delete system folders', 400);
        await env.DB.prepare('DELETE FROM folders WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
        return json({ success: true });
      }

      // ════════════════════════════════════════════════════════════════
      // LABELS
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/labels' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { results } = await env.DB.prepare('SELECT * FROM labels WHERE user_id = ? ORDER BY name ASC').bind(user!.sub).all();
        return json({ labels: results });
      }

      if (path === '/api/labels' && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { name, color } = await request.json() as any;
        if (!name) return errorResp('Label name required', 400);
        try {
          const result = await env.DB.prepare('INSERT INTO labels (user_id, name, color) VALUES (?, ?, ?)')
            .bind(user!.sub, name, color || '#6B7280').run();
          return json({ id: result.meta?.last_row_id, name, color: color || '#6B7280' }, 201);
        } catch (e: any) { return errorResp('Label already exists', 409); }
      }

      if (path.match(/^\/api\/emails\/\d+\/labels$/) && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const emailId = parseInt(path.split('/')[3]);
        const { label_ids } = await request.json() as any;
        if (!Array.isArray(label_ids)) return errorResp('label_ids array required', 400);
        await env.DB.prepare('DELETE FROM email_labels WHERE email_id = ?').bind(emailId).run();
        for (const labelId of label_ids) {
          await env.DB.prepare('INSERT OR IGNORE INTO email_labels (email_id, label_id) VALUES (?, ?)').bind(emailId, labelId).run();
        }
        return json({ success: true });
      }

      if (path.match(/^\/api\/labels\/\d+$/) && method === 'DELETE') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/').pop()!);
        await env.DB.prepare('DELETE FROM labels WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
        return json({ success: true });
      }

      // ════════════════════════════════════════════════════════════════
      // DRAFTS
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/drafts' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { results } = await env.DB.prepare('SELECT * FROM drafts WHERE user_id = ? ORDER BY updated_at DESC').bind(user!.sub).all();
        return json({ drafts: results });
      }

      if (path === '/api/drafts' && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { to_address, cc_address, bcc_address, subject, text, html, in_reply_to } = await request.json() as any;
        const result = await env.DB.prepare(
          'INSERT INTO drafts (user_id, to_address, cc_address, bcc_address, subject, text, html, in_reply_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(user!.sub, to_address || null, cc_address || null, bcc_address || null, subject || null, text || null, html || null, in_reply_to || null).run();
        return json({ id: result.meta?.last_row_id }, 201);
      }

      if (path.match(/^\/api\/drafts\/\d+$/) && method === 'PUT') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/').pop()!);
        const { to_address, cc_address, bcc_address, subject, text, html } = await request.json() as any;
        await env.DB.prepare(
          `UPDATE drafts SET to_address = ?, cc_address = ?, bcc_address = ?, subject = ?, text = ?, html = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`
        ).bind(to_address || null, cc_address || null, bcc_address || null, subject || null, text || null, html || null, id, user!.sub).run();
        return json({ success: true });
      }

      if (path.match(/^\/api\/drafts\/\d+$/) && method === 'DELETE') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/').pop()!);
        await env.DB.prepare('DELETE FROM drafts WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
        return json({ success: true });
      }

      // ════════════════════════════════════════════════════════════════
      // SETTINGS
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/settings' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        let settings = await env.DB.prepare('SELECT * FROM user_settings WHERE user_id = ?').bind(user!.sub).first();
        if (!settings) {
          await env.DB.prepare('INSERT INTO user_settings (user_id) VALUES (?)').bind(user!.sub).run();
          settings = await env.DB.prepare('SELECT * FROM user_settings WHERE user_id = ?').bind(user!.sub).first();
        }
        return json(settings);
      }

      if (path === '/api/settings' && method === 'PUT') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const body = await request.json() as any;
        const allowed = ['theme', 'density', 'language', 'signature_html', 'auto_save_drafts', 'show_snippets', 'items_per_page', 'reply_to_address', 'forward_to_address', 'notify_on_new_email'];
        const updates: string[] = [];
        const params: any[] = [];
        for (const [key, value] of Object.entries(body)) {
          if (allowed.includes(key)) { updates.push(`${key} = ?`); params.push(value); }
        }
        if (updates.length === 0) return errorResp('No valid fields to update', 400);
        updates.push("updated_at = datetime('now')");
        params.push(user!.sub);
        await env.DB.prepare(`UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?`).bind(...params).run();
        return json({ success: true });
      }

      // ════════════════════════════════════════════════════════════════
      // CONTACTS
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/contacts' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const search = url.searchParams.get('search');
        let query = 'SELECT * FROM contacts WHERE user_id = ?';
        const params: any[] = [user!.sub];
        if (search) { query += ' AND (email LIKE ? OR display_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        query += ' ORDER BY display_name ASC, email ASC LIMIT 100';
        const { results } = await env.DB.prepare(query).bind(...params).all();
        return json({ contacts: results });
      }

      // ════════════════════════════════════════════════════════════════
      // ATTACHMENTS
      // ════════════════════════════════════════════════════════════════

      if (path.match(/^\/api\/attachments\/[\w-]+$/) && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = path.split('/').pop()!;
        const attachment = await env.DB.prepare('SELECT * FROM attachments WHERE id = ? AND user_id = ?').bind(id, user!.sub).first() as any;
        if (!attachment) return errorResp('Attachment not found', 404);
        const object = await env.R2_BUCKET.get(attachment.r2_key);
        if (!object) return errorResp('File not found in storage', 404);
        return new Response(object.body, {
          headers: { 'Content-Type': attachment.mime_type, 'Content-Disposition': `attachment; filename="${attachment.filename}"` },
        });
      }

      // ════════════════════════════════════════════════════════════════
      // ADMIN ROUTES
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/admin/users' && method === 'GET') {
        const { user, error: authError } = await adminAuth(request, env);
        if (authError) return authError;
        const { results } = await env.DB.prepare(
          'SELECT id, email, display_name, role, is_active, avatar_url, storage_quota, storage_used, created_at, last_login_at FROM users ORDER BY created_at DESC'
        ).all();
        return json({ users: results });
      }

      if (path === '/api/admin/users' && method === 'POST') {
        const { user, error: authError } = await adminAuth(request, env);
        if (authError) return authError;
        const { email, password, display_name, role } = await request.json() as any;
        if (!email || !password) return errorResp('Email and password required', 400);
        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
        if (existing) return errorResp('Email already registered', 409);
        const salt = generateSalt();
        const passwordHash = await hashPassword(password, salt);
        const result = await env.DB.prepare(
          'INSERT INTO users (email, display_name, password_hash, password_salt, role) VALUES (?, ?, ?, ?, ?)'
        ).bind(email.toLowerCase(), display_name || '', passwordHash, salt, role || 'user').run();
        const userId = result.meta?.last_row_id;
        await createDefaultFolders(env, userId);
        await env.DB.prepare('INSERT INTO user_settings (user_id) VALUES (?)').bind(userId).run();
        await auditLog(env, user!.sub, 'create_user', 'user', String(userId), request, { email });
        return json({ id: userId, email: email.toLowerCase(), display_name: display_name || '', role: role || 'user' }, 201);
      }

      if (path.match(/^\/api\/admin\/users\/\d+$/) && method === 'PATCH') {
        const { user, error: authError } = await adminAuth(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/').pop()!);
        const { is_active, role, display_name, storage_quota, password } = await request.json() as any;
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
        if (updates.length === 0) return errorResp('No fields to update', 400);
        params.push(id);
        await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
        await auditLog(env, user!.sub, 'update_user', 'user', String(id), request);
        return json({ success: true });
      }

      if (path.match(/^\/api\/admin\/users\/\d+$/) && method === 'DELETE') {
        const { user, error: authError } = await adminAuth(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/').pop()!);
        if (id === user!.sub) return errorResp('Cannot delete yourself', 400);
        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
        await auditLog(env, user!.sub, 'delete_user', 'user', String(id), request);
        return json({ success: true });
      }

      if (path === '/api/admin/audit' && method === 'GET') {
        const { user, error: authError } = await adminAuth(request, env);
        if (authError) return authError;
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = 50;
        const offset = (page - 1) * limit;
        const { results } = await env.DB.prepare(
          'SELECT a.*, u.email as user_email FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT ? OFFSET ?'
        ).bind(limit, offset).all();
        return json({ logs: results, page });
      }

      if (path === '/api/admin/stats' && method === 'GET') {
        const { user, error: authError } = await adminAuth(request, env);
        if (authError) return authError;
        const totalUsers = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first() as any;
        const activeUsers = await env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').first() as any;
        const totalEmails = await env.DB.prepare('SELECT COUNT(*) as count FROM emails').first() as any;
        const totalStorage = await env.DB.prepare('SELECT SUM(storage_used) as total FROM users').first() as any;
        return json({
          totalUsers: totalUsers?.count || 0,
          activeUsers: activeUsers?.count || 0,
          totalEmails: totalEmails?.count || 0,
          totalStorageUsed: totalStorage?.total || 0,
        });
      }

      // ════════════════════════════════════════════════════════════════
      // SIGNATURES
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/signatures' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { results } = await env.DB.prepare('SELECT * FROM signatures WHERE user_id = ?').bind(user!.sub).all();
        return json({ signatures: results });
      }

      if (path === '/api/signatures' && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { name, html, is_default } = await request.json() as any;
        if (is_default) await env.DB.prepare('UPDATE signatures SET is_default = 0 WHERE user_id = ?').bind(user!.sub).run();
        const result = await env.DB.prepare('INSERT INTO signatures (user_id, name, html, is_default) VALUES (?, ?, ?, ?)')
          .bind(user!.sub, name || 'Default', html || '', is_default ? 1 : 0).run();
        return json({ id: result.meta?.last_row_id }, 201);
      }

      if (path.match(/^\/api\/signatures\/\d+$/) && method === 'DELETE') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/').pop()!);
        await env.DB.prepare('DELETE FROM signatures WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
        return json({ success: true });
      }

      // ════════════════════════════════════════════════════════════════
      // ALIASES
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/aliases' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { results } = await env.DB.prepare('SELECT * FROM aliases WHERE user_id = ?').bind(user!.sub).all();
        return json({ aliases: results });
      }

      if (path === '/api/aliases' && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { alias_email, forward_to } = await request.json() as any;
        if (!alias_email || !forward_to) return errorResp('alias_email and forward_to required', 400);
        try {
          const result = await env.DB.prepare('INSERT INTO aliases (user_id, alias_email, forward_to) VALUES (?, ?, ?)')
            .bind(user!.sub, alias_email, forward_to).run();
          return json({ id: result.meta?.last_row_id }, 201);
        } catch (e: any) { return errorResp('Alias already exists', 409); }
      }

      if (path.match(/^\/api\/aliases\/\d+$/) && method === 'DELETE') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/').pop()!);
        await env.DB.prepare('DELETE FROM aliases WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
        return json({ success: true });
      }

      // ════════════════════════════════════════════════════════════════
      // SESSIONS
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/sessions' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { results } = await env.DB.prepare(
          "SELECT id, device_info, ip_address, created_at, expires_at FROM sessions WHERE user_id = ? AND expires_at > datetime('now') ORDER BY created_at DESC"
        ).bind(user!.sub).all();
        return json({ sessions: results });
      }

      if (path.match(/^\/api\/sessions\/[\w-]+$/) && method === 'DELETE') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = path.split('/').pop()!;
        await env.DB.prepare('DELETE FROM sessions WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
        return json({ success: true });
      }

      // ════════════════════════════════════════════════════════════════
      // SNOOZE
      // ════════════════════════════════════════════════════════════════

      if (path.match(/^\/api\/emails\/\d+\/snooze$/) && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/')[3]);
        const { snooze_until } = await request.json() as any;
        if (!snooze_until) return errorResp('snooze_until required', 400);
        await env.DB.prepare("UPDATE emails SET snooze_until = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?")
          .bind(snooze_until, id, user!.sub).run();
        return json({ success: true });
      }

      if (path.match(/^\/api\/emails\/\d+\/unsnooze$/) && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/')[3]);
        await env.DB.prepare("UPDATE emails SET snooze_until = NULL, updated_at = datetime('now') WHERE id = ? AND user_id = ?")
          .bind(id, user!.sub).run();
        return json({ success: true });
      }

      // ════════════════════════════════════════════════════════════════
      // ATTACHMENT DOWNLOAD
      // ════════════════════════════════════════════════════════════════

      if (path.match(/^\/api\/attachments\/[\w-]+$/) && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const attId = path.split('/').pop()!;
        const att = await env.DB.prepare('SELECT * FROM attachments WHERE id = ? AND user_id = ?').bind(attId, user!.sub).first() as any;
        if (!att) return errorResp('Attachment not found', 404);
        const obj = await env.R2_BUCKET.get(att.r2_key);
        if (!obj) return errorResp('File not found in storage', 404);
        const headers = new Headers();
        headers.set('Content-Type', att.mime_type);
        headers.set('Content-Disposition', `attachment; filename="${att.filename}"`);
        return new Response(obj.body, { headers });
      }

      // ════════════════════════════════════════════════════════════════
      // CALENDAR
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/calendar/events' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const start = url.searchParams.get('start');
        const end = url.searchParams.get('end');
        let q = 'SELECT * FROM calendar_events WHERE user_id = ?';
        const p: any[] = [user!.sub];
        if (start && end) { q += ' AND start_time >= ? AND end_time <= ?'; p.push(start, end); }
        q += ' ORDER BY start_time ASC';
        const { results } = await env.DB.prepare(q).bind(...p).all();
        return json({ events: results });
      }

      if (path === '/api/calendar/events' && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { title, description, location, start_time, end_time, all_day, color, reminder_minutes } = await request.json() as any;
        if (!title || !start_time || !end_time) return errorResp('title, start_time, end_time required', 400);
        const result = await env.DB.prepare(
          'INSERT INTO calendar_events (user_id, title, description, location, start_time, end_time, all_day, color, reminder_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(user!.sub, title, description || null, location || null, start_time, end_time, all_day || 0, color || '#F2782E', reminder_minutes || 15).run();
        return json({ id: result.meta?.last_row_id }, 201);
      }

      if (path.match(/^\/api\/calendar\/events\/\d+$/) && method === 'PUT') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/').pop()!);
        const { title, description, location, start_time, end_time, all_day, color, reminder_minutes } = await request.json() as any;
        await env.DB.prepare(
          "UPDATE calendar_events SET title=?, description=?, location=?, start_time=?, end_time=?, all_day=?, color=?, reminder_minutes=?, updated_at=datetime('now') WHERE id=? AND user_id=?"
        ).bind(title, description || null, location || null, start_time, end_time, all_day || 0, color || '#F2782E', reminder_minutes || 15, id, user!.sub).run();
        return json({ success: true });
      }

      if (path.match(/^\/api\/calendar\/events\/\d+$/) && method === 'DELETE') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/').pop()!);
        await env.DB.prepare('DELETE FROM calendar_events WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
        return json({ success: true });
      }

      // ════════════════════════════════════════════════════════════════
      // CHAT
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/chat/conversations' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { results } = await env.DB.prepare(
          'SELECT * FROM chat_conversations WHERE user_id = ? ORDER BY last_message_at DESC NULLS LAST'
        ).bind(user!.sub).all();
        return json({ conversations: results });
      }

      if (path === '/api/chat/conversations' && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { participant_email, participant_name } = await request.json() as any;
        if (!participant_email) return errorResp('participant_email required', 400);
        const result = await env.DB.prepare(
          'INSERT INTO chat_conversations (user_id, participant_email, participant_name) VALUES (?, ?, ?)'
        ).bind(user!.sub, participant_email, participant_name || null).run();
        return json({ id: result.meta?.last_row_id }, 201);
      }

      if (path.match(/^\/api\/chat\/conversations\/\d+\/messages$/) && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const convId = parseInt(path.split('/')[4]);
        const { results } = await env.DB.prepare(
          'SELECT * FROM chat_messages WHERE conversation_id = ? AND user_id = ? ORDER BY created_at ASC'
        ).bind(convId, user!.sub).all();
        return json({ messages: results });
      }

      if (path.match(/^\/api\/chat\/conversations\/\d+\/messages$/) && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const convId = parseInt(path.split('/')[4]);
        const { body, sender_email, sender_name, direction } = await request.json() as any;
        if (!body) return errorResp('body required', 400);
        const result = await env.DB.prepare(
          'INSERT INTO chat_messages (conversation_id, user_id, sender_email, sender_name, body, direction) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(convId, user!.sub, sender_email || '', sender_name || '', body, direction || 'outbound').run();
        await env.DB.prepare(
          "UPDATE chat_conversations SET last_message = ?, last_message_at = datetime('now') WHERE id = ?"
        ).bind(body.substring(0, 100), convId).run();
        return json({ id: result.meta?.last_row_id }, 201);
      }

      if (path.match(/^\/api\/chat\/conversations\/\d+$/) && method === 'DELETE') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const id = parseInt(path.split('/').pop()!);
        await env.DB.prepare('DELETE FROM chat_conversations WHERE id = ? AND user_id = ?').bind(id, user!.sub).run();
        return json({ success: true });
      }

      // ════════════════════════════════════════════════════════════════
      // FILES (user-uploaded files in R2)
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/files' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const { results } = await env.DB.prepare(
          'SELECT id, filename, mime_type, size, folder, is_starred, created_at FROM files WHERE user_id = ? ORDER BY created_at DESC'
        ).bind(user!.sub).all();
        return json({ files: results });
      }

      if (path === '/api/files/upload' && method === 'POST') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file) return errorResp('No file provided', 400);
        const fileId = crypto.randomUUID();
        const r2Key = `files/${user!.sub}/${fileId}/${file.name}`;
        await env.R2_BUCKET.put(r2Key, file.stream(), {
          httpMetadata: { contentType: file.type },
        });
        await env.DB.prepare(
          'INSERT INTO files (id, user_id, filename, mime_type, size, r2_key) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(fileId, user!.sub, file.name, file.type, file.size, r2Key).run();
        // Update storage used
        await env.DB.prepare('UPDATE users SET storage_used = storage_used + ? WHERE id = ?').bind(file.size, user!.sub).run();
        return json({ id: fileId, filename: file.name, size: file.size }, 201);
      }

      if (path.match(/^\/api\/files\/[\w-]+\/download$/) && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const fileId = path.split('/')[3];
        const file = await env.DB.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?').bind(fileId, user!.sub).first() as any;
        if (!file) return errorResp('File not found', 404);
        const obj = await env.R2_BUCKET.get(file.r2_key);
        if (!obj) return errorResp('File not in storage', 404);
        const headers = new Headers();
        headers.set('Content-Type', file.mime_type);
        headers.set('Content-Disposition', `attachment; filename="${file.filename}"`);
        return new Response(obj.body, { headers });
      }

      if (path.match(/^\/api\/files\/[\w-]+$/) && method === 'DELETE') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const fileId = path.split('/').pop()!;
        const file = await env.DB.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?').bind(fileId, user!.sub).first() as any;
        if (!file) return errorResp('File not found', 404);
        await env.R2_BUCKET.delete(file.r2_key);
        await env.DB.prepare('DELETE FROM files WHERE id = ? AND user_id = ?').bind(fileId, user!.sub).run();
        await env.DB.prepare('UPDATE users SET storage_used = MAX(0, storage_used - ?) WHERE id = ?').bind(file.size, user!.sub).run();
        return json({ success: true });
      }

      // ════════════════════════════════════════════════════════════════
      // STORAGE USAGE
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/storage' && method === 'GET') {
        const { user, error: authError } = await authMiddleware(request, env);
        if (authError) return authError;
        const userData = await env.DB.prepare('SELECT storage_quota, storage_used FROM users WHERE id = ?').bind(user!.sub).first() as any;
        return json({ quota: userData?.storage_quota || 0, used: userData?.storage_used || 0 });
      }

      // ════════════════════════════════════════════════════════════════
      // HEALTH CHECK
      // ════════════════════════════════════════════════════════════════

      if (path === '/api/health' && method === 'GET') {
        return json({ status: 'healthy', timestamp: new Date().toISOString() });
      }

      return errorResp('Not found', 404);

    } catch (e: any) {
      console.error('API error:', e);
      return json({ error: 'Internal server error', detail: e.message }, 500);
    }
  },

  // ── Inbound email handler (Cloudflare Email Routing) ────────────────────
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    try {
      const recipientEmail = message.to;
      const user = await env.DB.prepare('SELECT id FROM users WHERE email = ? AND is_active = 1')
        .bind(recipientEmail).first() as any;

      if (!user) {
        console.log(`Rejected email for ${recipientEmail} - User not found or inactive`);
        return;
      }

      const rawEmail = await new Response(message.raw).arrayBuffer();
      const parsed = await parseRawEmail(rawEmail);

      const inboxFolder = await env.DB.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?')
        .bind(user.id, 'inbox').first() as any;

      const threadId = generateThreadId(parsed);
      const snippet = generateSnippet(parsed.text);
      const size = new TextEncoder().encode(parsed.text + (parsed.html || '')).length;

      const emailResult = await env.DB.prepare(
        `INSERT INTO emails (user_id, message_id, thread_id, in_reply_to, ref_header, from_address, from_name, to_address, cc_address, subject, text, html, snippet, folder_id, direction, status, size, has_attachments)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'inbound', 'received', ?, ?)`
      ).bind(
        user.id, parsed.messageId, threadId, parsed.inReplyTo, parsed.references,
        parsed.fromAddress, parsed.fromName, parsed.toAddress, parsed.ccAddress,
        parsed.subject, parsed.text, parsed.html, snippet, inboxFolder?.id,
        size, parsed.attachments.length > 0 ? 1 : 0
      ).run();

      const emailId = emailResult.meta?.last_row_id;

      for (const attachment of parsed.attachments) {
        const attId = crypto.randomUUID();
        const r2Key = `attachments/${user.id}/${emailId}/${attId}/${attachment.filename}`;
        await env.R2_BUCKET.put(r2Key, attachment.content, {
          httpMetadata: { contentType: attachment.mimeType },
        });
        await env.DB.prepare(
          'INSERT INTO attachments (id, email_id, user_id, filename, mime_type, size, r2_key, is_inline, content_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(attId, emailId, user.id, attachment.filename, attachment.mimeType, attachment.size, r2Key, attachment.isInline ? 1 : 0, attachment.contentId || null).run();
      }

      if (inboxFolder) await updateFolderCounts(env, user.id, inboxFolder.id);
      await upsertContact(env, user.id, parsed.fromAddress, parsed.fromName);

      console.log(`Email stored: ${parsed.subject} for ${recipientEmail}`);
    } catch (e) {
      console.error('Email handler error:', e);
    }
  },
};
