// D1 → VPS SQLite sync for inbound emails
// Polls Cloudflare D1 API for new inbound emails and inserts them into local SQLite

import db from './db.js';

const DB_ID = '42e5a563-4077-4cfe-8204-a785fe85b2a7';
const ACCOUNT_ID = '26480d16a0a830f4ca8dec3c314f7f27';
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

let lastSyncedId = 0;

async function d1Query(sql: string): Promise<any[]> {
  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    }
  );
  const data = await resp.json() as any;
  if (!data.success) throw new Error(`D1 query failed: ${JSON.stringify(data.errors)}`);
  return data.result?.[0]?.results || [];
}

export async function syncInboundEmails(env: any): Promise<void> {
  if (!CF_TOKEN) { console.error('[D1 Sync] No CLOUDFLARE_API_TOKEN set'); return; }
  try {
    // Get inbound emails from D1
    const d1Emails = await d1Query(
      `SELECT id, user_id, message_id, thread_id, in_reply_to, ref_header,
              from_address, from_name, to_address, cc_address, bcc_address, reply_to,
              subject, text, html, snippet, folder_id, is_read, is_starred, is_important,
              is_draft, has_attachments, size, direction, status, received_at, sent_at,
              created_at, updated_at, snooze_until
       FROM emails WHERE direction = 'inbound' ORDER BY id ASC`
    );

    if (d1Emails.length === 0) { console.log('[D1 Sync] No emails in D1'); return; }

    // Get local message_ids to avoid duplicates
    const localMsgRows = db.prepare('SELECT message_id FROM emails WHERE message_id IS NOT NULL').all() as any[];
    const localIdSet = new Set(localMsgRows.map((r: any) => r.message_id));

    console.log(`[D1 Sync] D1 has ${d1Emails.length} inbound emails, local has ${localIdSet.size} with message_ids`);

    let inserted = 0;
    let skipped = 0;
    let noUser = 0;
    for (const email of d1Emails) {
      // Skip if already exists by message_id
      if (email.message_id && localIdSet.has(email.message_id)) { skipped++; continue; }

      // Check if user exists locally
      const localUser = db.prepare('SELECT id FROM users WHERE id = ?').get(email.user_id) as any;
      if (!localUser) { noUser++; console.log(`[D1 Sync] No local user for user_id=${email.user_id} (type: ${typeof email.user_id})`); continue; }

      // Map folder_id: find local inbox folder for this user
      let localFolderId = null;
      if (email.folder_id) {
        const d1Folder = await d1Query(`SELECT type, name FROM folders WHERE id = ${email.folder_id}`);
        if (d1Folder.length > 0) {
          const localFolder = db.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').get(email.user_id, d1Folder[0].type) as any;
          if (localFolder) localFolderId = localFolder.id;
        }
      }
      if (!localFolderId) {
        const inbox = db.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').get(email.user_id, 'inbox') as any;
        localFolderId = inbox?.id;
      }

      try {
        db.prepare(
          `INSERT OR IGNORE INTO emails (user_id, message_id, thread_id, in_reply_to, ref_header,
            from_address, from_name, to_address, cc_address, bcc_address, reply_to,
            subject, text, html, snippet, folder_id, is_read, is_starred, is_important,
            is_draft, has_attachments, size, direction, status, received_at, sent_at, snooze_until)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          email.user_id, email.message_id, email.thread_id, email.in_reply_to, email.ref_header,
          email.from_address, email.from_name, email.to_address, email.cc_address, email.bcc_address, email.reply_to,
          email.subject, email.text, email.html, email.snippet, localFolderId,
          email.is_read, email.is_starred, email.is_important, email.is_draft,
          email.has_attachments, email.size, email.direction, email.status,
          email.received_at, email.sent_at, email.snooze_until
        );
        inserted++;
        console.log(`[D1 Sync] Inserted email: ${email.subject} (D1 id: ${email.id}, user: ${email.user_id})`);
      } catch (insertErr: any) {
        console.error(`[D1 Sync] Insert failed for D1 email ${email.id}: ${insertErr.message}`);
      }
    }

    console.log(`[D1 Sync] Done: inserted=${inserted}, skipped=${skipped}, noUser=${noUser}`);

    // Also sync attachments for newly inserted emails
    if (inserted > 0) {
      const d1Attachments = await d1Query(
        `SELECT id, email_id, user_id, filename, mime_type, size, r2_key, is_inline, content_id
         FROM attachments ORDER BY id ASC`
      );
      const localAttIds = db.prepare('SELECT id FROM attachments').all() as any[];
      const localAttSet = new Set(localAttIds.map((r: any) => r.id));
      for (const att of d1Attachments) {
        if (localAttSet.has(att.id)) continue;
        db.prepare(
          `INSERT OR IGNORE INTO attachments (id, email_id, user_id, filename, mime_type, size, r2_key, is_inline, content_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(att.id, att.email_id, att.user_id, att.filename, att.mime_type, att.size, att.r2_key, att.is_inline, att.content_id);
      }
    }

    if (inserted > 0) {
      console.log(`[D1 Sync] Inserted ${inserted} new inbound emails from D1 (skipped ${skipped} duplicates)`);
      // Update folder counts for all users
      const users = db.prepare('SELECT id FROM users').all() as any[];
      for (const u of users) {
        const inbox = db.prepare('SELECT id FROM folders WHERE user_id = ? AND type = ?').get(u.id, 'inbox') as any;
        if (inbox) {
          const unread = db.prepare('SELECT COUNT(*) as count FROM emails WHERE folder_id = ? AND is_read = 0').get(inbox.id) as any;
          db.prepare('UPDATE folders SET unread_count = ? WHERE id = ?').run(unread?.count || 0, inbox.id);
        }
      }
    }
    if (inserted === 0) {
      console.log(`[D1 Sync] No new emails to insert (skipped ${skipped} duplicates)`);
    }
  } catch (e: any) {
    console.error('[D1 Sync] Error:', e.message);
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
