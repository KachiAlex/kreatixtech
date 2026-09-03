import { createRequire } from 'node:module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = path.join(process.cwd(), 'data', 'mail.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Load schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

// ── D1-compatible wrapper ─────────────────────────────────────────────────
// D1 API: env.DB.prepare(sql).bind(...params).first() / .all() / .run()

export function prepare(sql: string) {
  const stmt = db.prepare(sql);

  function bind(...params: any[]) {
    return {
      first(): any {
        return stmt.get(...params) || null;
      },
      all(): { results: any[] } {
        const results = stmt.all(...params);
        return { results };
      },
      run(): { meta: { last_row_id?: number; changes: number } } {
        const info = stmt.run(...params);
        return {
          meta: {
            last_row_id: info.lastInsertRowid ? Number(info.lastInsertRowid) : undefined,
            changes: info.changes,
          },
        };
      },
    };
  }

  // Return an object that allows both .bind(...params).all() and .all() / .first() / .run() directly
  return {
    bind,
    first(): any {
      return stmt.get() || null;
    },
    all(): { results: any[] } {
      const results = stmt.all();
      return { results };
    },
    run(): { meta: { last_row_id?: number; changes: number } } {
      const info = stmt.run();
      return {
        meta: {
          last_row_id: info.lastInsertRowid ? Number(info.lastInsertRowid) : undefined,
          changes: info.changes,
        },
      };
    },
  };
}

export default db;
