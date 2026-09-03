// TOTP (RFC 6238) implementation for Cloudflare Workers (Web Crypto API)

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateTotpSecret(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  let secret = '';
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_CHARS[(bytes[i] >> 3) & 0x1f];
    secret += BASE32_CHARS[((bytes[i] << 2) & 0x1c) | ((bytes[i + 1] >> 6) & 0x03)];
    if (i + 1 < bytes.length) {
      secret += BASE32_CHARS[(bytes[++i] >> 1) & 0x1f];
      secret += BASE32_CHARS[((bytes[i] << 4) & 0x10) | ((bytes[i + 1] >> 4) & 0x0f)];
      if (i + 1 < bytes.length) {
        secret += BASE32_CHARS[((bytes[++i] >> 6) & 0x03) | ((bytes[i] & 0x3f))];
        secret += BASE32_CHARS[(bytes[i] >> 1) & 0x1f];
      }
    }
  }
  return secret.substring(0, 32);
}

function base32Decode(secret: string): Uint8Array {
  const cleaned = secret.replace(/=+$/, '').replace(/\s/g, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bitsLeft = 0;
  for (const char of cleaned.toUpperCase()) {
    const val = BASE32_CHARS.indexOf(char);
    if (val === -1) continue;
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bytes.push((buffer >> (bitsLeft - 8)) & 0xff);
      bitsLeft -= 8;
    }
  }
  return new Uint8Array(bytes);
}

export async function generateTotp(secret: string, timestamp: number = Date.now()): Promise<string> {
  const key = base32Decode(secret);
  const counter = Math.floor(timestamp / 1000 / 30);
  const counterBuf = new ArrayBuffer(8);
  const view = new DataView(counterBuf);
  view.setBigUint64(0, BigInt(counter));
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const hmac = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, counterBuf));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24 | hmac[offset + 1] << 16 | hmac[offset + 2] << 8 | hmac[offset + 3]) % 1000000;
  return code.toString().padStart(6, '0');
}

export async function verifyTotp(secret: string, token: string): Promise<boolean> {
  const now = Date.now();
  for (let offset = -1; offset <= 1; offset++) {
    const expected = await generateTotp(secret, now + offset * 30000);
    if (timingSafeEqual(token, expected)) return true;
  }
  return false;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export function generateOtpAuthUrl(secret: string, email: string, issuer: string = 'Kreatix Mail'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
