import { createRequire } from 'node:module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = path.join(process.cwd(), 'data', 'mail.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = OFF');

// Initialize schema first
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);
console.log('Schema initialized.');

const sqlFile = fs.readFileSync(path.join(process.cwd(), 'd1-data-export.sql'), 'utf-8');

// Split by semicolons, but handle multi-line statements
const statements = [];
let current = '';
let inString = false;
for (let i = 0; i < sqlFile.length; i++) {
  const ch = sqlFile[i];
  if (ch === "'") {
    // Check for escaped quote
    if (sqlFile[i + 1] === "'") {
      current += "''";
      i++;
      continue;
    }
    inString = !inString;
    current += ch;
  } else if (ch === ';' && !inString) {
    const trimmed = current.trim();
    if (trimmed && !trimmed.startsWith('--')) {
      statements.push(trimmed);
    }
    current = '';
  } else {
    current += ch;
  }
}

console.log(`Executing ${statements.length} statements...`);
let count = 0;
for (const stmt of statements) {
  try {
    db.exec(stmt);
    count++;
  } catch (e) {
    console.error(`Error on statement ${count + 1}:`, e.message);
    console.error('Statement:', stmt.substring(0, 200) + '...');
  }
}

db.pragma('foreign_keys = ON');
console.log(`Done! ${count}/${statements.length} statements executed successfully.`);

// Verify counts
const tables = ['users', 'sessions', 'folders', 'emails', 'attachments', 'audit_logs', 'contacts', 'user_settings'];
for (const t of tables) {
  const row = db.prepare(`SELECT COUNT(*) as cnt FROM ${t}`).get();
  console.log(`  ${t}: ${row.cnt} rows`);
}

db.close();
