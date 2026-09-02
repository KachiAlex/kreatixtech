import { createRequire } from 'node:module';
import path from 'path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database(path.join(__dirname, '..', 'data', 'mail.db'));

try {
  db.exec('ALTER TABLE user_settings ADD COLUMN signature_image_url TEXT');
  console.log('signature_image_url column added');
} catch (e: any) {
  console.log('Column already exists:', e.message);
}

db.close();
