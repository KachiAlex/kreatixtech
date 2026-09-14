import db from './db.js';

const outboxTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='outbox'").get();
console.log('outbox table exists:', !!outboxTable);

const cols = db.prepare("PRAGMA table_info(user_settings)").all();
console.log('signature_image_url column exists:', cols.map((c: any) => c.name).includes('signature_image_url'));

db.close();
