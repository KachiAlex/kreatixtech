import crypto from 'node:crypto';

const JWT_SECRET = 'kreatix-mail-jwt-secret-2026-secure-key-f8a3b2c1';
const JWT_EXPIRES_IN = 15 * 60;
export const REFRESH_EXPIRES_IN = 30 * 24 * 60 * 60;

// ── Password hashing using Node crypto ────────────────────────────────────

export async function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, derived) => {
      if (err) reject(err);
      else resolve(derived.toString('base64'));
    });
  });
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('base64');
}

export async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password, salt);
  return computed === hash;
}

// ── JWT (HMAC-SHA256) ────────────────────────────────────────────────────

function base64UrlEncode(data: Buffer): string {
  return data.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('binary');
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
  jti?: string;
}

export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresIn: number = JWT_EXPIRES_IN): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = { ...payload, iat: now, exp: now + expiresIn };

  const headerB64 = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(fullPayload)));

  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${headerB64}.${payloadB64}`).digest();
  const sigB64 = base64UrlEncode(sig);

  return `${headerB64}.${payloadB64}.${sigB64}`;
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const [headerB64, payloadB64, sigB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !sigB64) return null;

    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${headerB64}.${payloadB64}`).digest();
    const sigData = Buffer.from(base64UrlDecode(sigB64), 'binary');
    if (!crypto.timingSafeEqual(expectedSig, sigData)) return null;

    const payload: JwtPayload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

// ── Session management ───────────────────────────────────────────────────

export function generateSessionId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function hashToken(token: string): Promise<string> {
  return crypto.createHash('sha256').update(token).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function getExpiry(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
}

// ── Auth middleware ──────────────────────────────────────────────────────

export async function authMiddleware(req: any): Promise<{ user: JwtPayload | null; error?: any }> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: { status: 401, body: { error: 'No token provided' } } };
  }

  const token = authHeader.slice(7);
  const payload = await verifyJwt(token);
  if (!payload) {
    return { user: null, error: { status: 401, body: { error: 'Invalid or expired token' } } };
  }

  if (payload.type !== 'access') {
    return { user: null, error: { status: 401, body: { error: 'Invalid token type' } } };
  }

  return { user: payload };
}

export async function requireAdmin(req: any): Promise<{ user: JwtPayload | null; error?: any }> {
  const { user, error } = await authMiddleware(req);
  if (error) return { user: null, error };
  if (user!.role !== 'admin') {
    return { user: null, error: { status: 403, body: { error: 'Admin access required' } } };
  }
  return { user };
}

// ── Audit logging ────────────────────────────────────────────────────────

export async function auditLog(env: any, userId: number | null, action: string, resource?: string, resourceId?: string, req?: any, details?: any): Promise<void> {
  try {
    env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address, user_agent, details) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      userId,
      action,
      resource || null,
      resourceId || null,
      req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || null,
      req?.headers['user-agent'] || null,
      details ? JSON.stringify(details) : null
    ).run();
  } catch (e) {
    console.error('Audit log error:', e);
  }
}
