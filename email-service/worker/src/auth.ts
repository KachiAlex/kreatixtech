// ── Auth utilities: password hashing, JWT, session management ─────────────

const JWT_SECRET = 'kreatix-mail-jwt-secret-2026-secure-key-f8a3b2c1';
const JWT_EXPIRES_IN = 15 * 60;          // 15 min access token
export const REFRESH_EXPIRES_IN = 30 * 24 * 60 * 60;  // 30 days refresh token

// ── Password hashing using Web Crypto API ────────────────────────────────

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
}

export function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr));
}

export async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password, salt);
  return computed === hash;
}

// ── JWT (HMAC-SHA256) ────────────────────────────────────────────────────

function base64UrlEncode(data: ArrayBuffer): string {
  const bytes = new Uint8Array(data);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

export interface JwtPayload {
  sub: number;       // user id
  email: string;
  role: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
  jti?: string;      // session id for refresh tokens
}

export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresIn: number = JWT_EXPIRES_IN): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = { ...payload, iat: now, exp: now + expiresIn };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payloadB64 = btoa(JSON.stringify(fullPayload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${headerB64}.${payloadB64}`));
  const sigB64 = base64UrlEncode(signature);

  return `${headerB64}.${payloadB64}.${sigB64}`;
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const [headerB64, payloadB64, sigB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !sigB64) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigData = Uint8Array.from(base64UrlDecode(sigB64), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigData, encoder.encode(`${headerB64}.${payloadB64}`));
    if (!valid) return null;

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
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(token));
  return base64UrlEncode(digest);
}

export function getExpiry(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
}

// ── Auth middleware ──────────────────────────────────────────────────────

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
  userRole?: string;
}

export async function authMiddleware(request: Request, env: any): Promise<{ user: JwtPayload | null; error?: Response }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: new Response(JSON.stringify({ error: 'No token provided' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Secret' } }) };
  }

  const token = authHeader.slice(7);
  const payload = await verifyJwt(token);
  if (!payload) {
    return { user: null, error: new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Secret' } }) };
  }

  if (payload.type !== 'access') {
    return { user: null, error: new Response(JSON.stringify({ error: 'Invalid token type' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Secret' } }) };
  }

  return { user: payload };
}

export async function requireAdmin(request: Request, env: any): Promise<{ user: JwtPayload | null; error?: Response }> {
  const { user, error } = await authMiddleware(request, env);
  if (error) return { user: null, error };
  if (user!.role !== 'admin') {
    return { user: null, error: new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Secret' } }) };
  }
  return { user };
}

// ── Audit logging ────────────────────────────────────────────────────────

export async function auditLog(env: any, userId: number | null, action: string, resource?: string, resourceId?: string, request?: Request, details?: any): Promise<void> {
  try {
    await env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address, user_agent, details) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      userId,
      action,
      resource || null,
      resourceId || null,
      request?.headers.get('CF-Connecting-IP') || request?.headers.get('X-Forwarded-For') || null,
      request?.headers.get('User-Agent') || null,
      details ? JSON.stringify(details) : null
    ).run();
  } catch (e) {
    console.error('Audit log error:', e);
  }
}
