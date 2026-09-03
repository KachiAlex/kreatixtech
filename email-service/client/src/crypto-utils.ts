// Simple PGP-like encryption using Web Crypto API
// Uses AES-GCM for symmetric encryption with passphrase-derived key

const enc = new TextEncoder();
const dec = new TextDecoder();

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw', enc.encode(passphrase) as BufferSource, 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );
  // Combine salt + iv + ciphertext into a single base64 payload
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptMessage(ciphertext: string, passphrase: string): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);
  const key = await deriveKey(passphrase, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return dec.decode(decrypted);
}

export function isEncrypted(text: string): boolean {
  return text.startsWith('-----BEGIN ENCRYPTED MESSAGE-----');
}

export function wrapEncrypted(base64Payload: string): string {
  return `-----BEGIN ENCRYPTED MESSAGE-----\n${base64Payload}\n-----END ENCRYPTED MESSAGE-----`;
}

export function unwrapEncrypted(wrapped: string): string {
  const match = wrapped.match(/-----BEGIN ENCRYPTED MESSAGE-----\n([\s\S]+?)\n-----END ENCRYPTED MESSAGE-----/);
  return match ? match[1] : wrapped;
}
