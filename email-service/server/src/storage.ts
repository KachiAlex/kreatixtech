import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'data', 'storage');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

// Keys may embed user-controlled filenames — a ".." segment would otherwise let
// a crafted filename escape STORAGE_DIR and read/write arbitrary paths.
function safePath(key: string): string | null {
  if (key.includes('\0')) return null;
  const filePath = path.resolve(STORAGE_DIR, key);
  return filePath.startsWith(STORAGE_DIR + path.sep) || filePath === STORAGE_DIR ? filePath : null;
}

// ── R2-compatible wrapper ─────────────────────────────────────────────────
// R2 API: env.R2_BUCKET.put(key, data, { httpMetadata }) / .get(key) / .delete(key)

export const storage = {
  async put(key: string, data: Buffer | ArrayBuffer, opts?: { httpMetadata?: { contentType?: string } }) {
    const filePath = safePath(key);
    if (!filePath) throw new Error('Invalid storage key');
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const buf = data instanceof ArrayBuffer ? Buffer.from(data) : data;
    fs.writeFileSync(filePath, buf);
  },

  async get(key: string): Promise<{ body: Buffer; mimeType?: string } | null> {
    const filePath = safePath(key);
    if (!filePath) return null;
    if (!fs.existsSync(filePath)) return null;
    const body = fs.readFileSync(filePath);
    return { body };
  },

  async delete(key: string) {
    const filePath = safePath(key);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  },
};
