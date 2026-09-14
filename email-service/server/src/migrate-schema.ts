import db from './db.js';

try {
  db.exec('ALTER TABLE user_settings ADD COLUMN signature_image_url TEXT');
  console.log('signature_image_url column added');
} catch (e: any) {
  console.log('Column already exists:', e.message);
}

db.close();
