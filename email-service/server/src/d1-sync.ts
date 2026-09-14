// D1 → VPS SQLite sync for inbound emails
// Polls Cloudflare D1 API for new inbound emails and inserts them into local SQLite

import db from './db.js';

const DB_ID = '42e5a563-4077-4cfe-8204-a785fe85b2a7';
const ACCOUNT_ID = '26480d16a0a830f4ca8dec3c314f7f27';
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

const SYNC_BATCH_SIZE = 100;

let isSyncing = false;

async function d1Query(sql: string, params?: any[]): Promise<any[]> {
  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    }
  );
  const data = await resp.json() as any;
  if (!data.success) throw new Error(`D1 query failed: ${JSON.stringify(data.errors)}`);
  return data.result?.[0]?.results || [];
}

function getLastSyncedD1Id(): number {
  try {
    const row = db.prepare('SELECT COALESCE(MAX(d1_id), 0) as max_id FROM emails').get() as any;
    return row?.max_id || 0;
  } catch {
    return 0;
  }
}

export async function syncInboundEmails(env: any): Promise<void> {
  if (isSyncing) {
    console.log('[D1 Sync] Already running, skipping');
    return;
  }
  if (!CF_TOKEN) { console.error('[D1 Sync] No CLOUDFLARE_API_TOKEN set'); return; }

  isSyncing = true;
  try {
    // Prefetch D1 folder types so we can map folder_id without a query per email
    const d1Folders = await d1Query('SELECT id, type, user_id FROM folders');
    const d1FolderTypeById = new Map<number, string>();
    const d1FolderUserById = new Map<number, number>();
    for (const f of d1Folders) {
      d1FolderTypeById.set(f.id, f.type);
      d1FolderUserById.set(f.id, f.user_id);
    }

    // Cache local users and folder mappings to avoid repeated DB hits per email
    const localUserIds = new Set<number>();
    const localFolderByUserType = new Map<string, number>();

    function ensureLocalUser(userId: number): boolean {
      if (localUserIds.has(userId)) return true;
      const row = db.prepare('SELECT id FROM users WHERE id = ?').get(userId) as any;
      if (row) { localUserIds.add(userId); return true; }
      return false;
    }

    function getLocalFolderId(userId: number, d1FolderId: number | null): number | null {
      const type = d1FolderId != null ? d1FolderTypeById.get(d1FolderId) : null;
      const key = `${userId}:${type || 'inbox'}`;
      if (localFolderByUserType.has(key)) return localFolderByUserType.get(key)!;

      // If a D1 folder type exists, use it; otherwise fall back to inbox
      const targetType = type || 'inbox';
      const row = db.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').get(userId, targetType) as any;
      const folderId = row?.id || null;
      localFolderByUserType.set(key, folderId);
      return folderId;
    }

    while (true) {
      const lastD1Id = getLastSyncedD1Id();

      const d1Emails = await d1Query(
        `SELECT id, user_id, message_id, thread_id, in_reply_to, ref_header,
                from_address, from_name, to_address, cc_address, bcc_address, reply_to,
                subject, text, html, snippet, folder_id, is_read, is_starred, is_important,
                is_draft, has_attachments, size, direction, status, received_at, sent_at,
                created_at, updated_at, snooze_until
         FROM emails WHERE direction = 'inbound' AND id > ?
         ORDER BY id ASC
         LIMIT ?`,
        [lastD1Id, SYNC_BATCH_SIZE]
      );

      if (d1Emails.length === 0) {
        console.log('[D1 Sync] No new inbound emails');
        break;
      }

      // Existing message_ids for a cheap duplicate guard (e.g. if a row is re-imported)
      const localMsgRows = db.prepare('SELECT message_id FROM emails WHERE message_id IS NOT NULL AND d1_id > 0').all() as any[];
      const localMessageIdSet = new Set(localMsgRows.map((r: any) => r.message_id));

      let inserted = 0;
      let skipped = 0;
      let noUser = 0;
      const affectedUserIds = new Set<number>();
      const newEmailD1Ids: number[] = [];

      for (const email of d1Emails) {
        if (email.message_id && localMessageIdSet.has(email.message_id)) { skipped++; continue; }

        if (!ensureLocalUser(email.user_id)) {
          noUser++;
          console.log(`[D1 Sync] No local user for user_id=${email.user_id}`);
          continue;
        }

        const localFolderId = getLocalFolderId(email.user_id, email.folder_id);

        try {
          db.prepare(
            `INSERT OR IGNORE INTO emails (user_id, message_id, thread_id, in_reply_to, ref_header,
              from_address, from_name, to_address, cc_address, bcc_address, reply_to,
              subject, text, html, snippet, folder_id, is_read, is_starred, is_important,
              is_draft, has_attachments, size, direction, status, received_at, sent_at, snooze_until, d1_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).run(
            email.user_id, email.message_id, email.thread_id, email.in_reply_to, email.ref_header,
            email.from_address, email.from_name, email.to_address, email.cc_address, email.bcc_address, email.reply_to,
            email.subject, email.text, email.html, email.snippet, localFolderId,
            email.is_read, email.is_starred, email.is_important, email.is_draft,
            email.has_attachments, email.size, email.direction, email.status,
            email.received_at, email.sent_at, email.snooze_until, email.id
          );
          inserted++;
          affectedUserIds.add(email.user_id);
          newEmailD1Ids.push(email.id);
          console.log(`[D1 Sync] Inserted email: ${email.subject} (D1 id: ${email.id}, user: ${email.user_id})`);
        } catch (insertErr: any) {
          console.error(`[D1 Sync] Insert failed for D1 email ${email.id}: ${insertErr.message}`);
        }
      }

      console.log(`[D1 Sync] Batch done: inserted=${inserted}, skipped=${skipped}, noUser=${noUser}`);

      // Sync attachments for newly inserted emails
      if (newEmailD1Ids.length > 0) {
        const placeholders = newEmailD1Ids.map(() => '?').join(',');
        const d1Attachments = await d1Query(
          `SELECT id, email_id, user_id, filename, mime_type, size, r2_key, is_inline, content_id
           FROM attachments WHERE email_id IN (${placeholders})`,
          newEmailD1Ids
        );

        const localAttIds = db.prepare('SELECT id FROM attachments').all() as any[];
        const localAttSet = new Set(localAttIds.map((r: any) => r.id));

        for (const att of d1Attachments) {
          if (localAttSet.has(att.id)) continue;
          try {
            db.prepare(
              `INSERT OR IGNORE INTO attachments (id, email_id, user_id, filename, mime_type, size, r2_key, is_inline, content_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).run(att.id, att.email_id, att.user_id, att.filename, att.mime_type, att.size, att.r2_key, att.is_inline, att.content_id);
          } catch (attErr: any) {
            console.error(`[D1 Sync] Attachment insert failed for id ${att.id}: ${attErr.message}`);
          }
        }
      }

      // Update folder counts for affected users
      if (affectedUserIds.size > 0) {
        for (const userId of affectedUserIds) {
          const folders = db.prepare('SELECT id, type FROM folders WHERE user_id = ?').all(userId) as any[];
          for (const f of folders) {
            if (f.type === 'inbox') {
              const unread = db.prepare('SELECT COUNT(*) as count FROM emails WHERE folder_id = ? AND is_read = 0').get(f.id) as any;
              const total = db.prepare('SELECT COUNT(*) as count FROM emails WHERE folder_id = ?').get(f.id) as any;
              db.prepare('UPDATE folders SET unread_count = ?, total_count = ? WHERE id = ?').run(unread?.count || 0, total?.count || 0, f.id);
            } else if (f.type === 'sent') {
              const total = db.prepare('SELECT COUNT(*) as count FROM emails WHERE folder_id = ? AND direction = ?').get(f.id, 'outbound') as any;
              db.prepare('UPDATE folders SET total_count = ? WHERE id = ?').run(total?.count || 0, f.id);
            }
          }
        }
      }

      if (d1Emails.length < SYNC_BATCH_SIZE) break;

      // Brief pause between batches to avoid rate-limiting
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (e: any) {
    console.error('[D1 Sync] Error:', e.message);
  } finally {
    isSyncing = false;
  }
}

export function startSyncInterval(env: any): void {
  // Sync every 30 seconds
  setInterval(() => {
    syncInboundEmails(env).catch(console.error);
  }, 30000);

  // Initial sync after 5 seconds
  setTimeout(() => {
    syncInboundEmails(env).catch(console.error);
  }, 5000);

  console.log('[D1 Sync] Started — polling D1 every 30 seconds for new inbound emails');
}
