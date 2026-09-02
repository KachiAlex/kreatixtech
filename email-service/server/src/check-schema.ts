import { createRequire } from 'node:module';
import path from 'path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database(path.join(__dirname, '..', 'data', 'mail.db'));

const outboxTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='outbox'").get();
console.log('outbox table exists:', !!outboxTable);

const cols = db.prepare("PRAGMA table_info(user_settings)").all().map(c => c.name);
console.log('signature_image_url column exists:', cols.includes('signature_image_url'));

db.close();
