// ── Email utilities: parsing, threading, snippets, contacts ──────────────

import PostalMime from 'postal-mime';

// ── Parse incoming email ─────────────────────────────────────────────────

export interface ParsedEmail {
  messageId: string | null;
  fromAddress: string;
  fromName: string;
  toAddress: string;
  ccAddress: string | null;
  subject: string;
  text: string;
  html: string | null;
  inReplyTo: string | null;
  references: string | null;
  attachments: ParsedAttachment[];
}

export interface ParsedAttachment {
  filename: string;
  mimeType: string;
  size: number;
  content: ArrayBuffer;
  contentId?: string;
  isInline: boolean;
}

export async function parseRawEmail(rawEmail: ArrayBuffer): Promise<ParsedEmail> {
  const parser = new PostalMime();
  const parsed = await parser.parse(rawEmail);

  const toAddresses = (parsed.to || []).map(a => a.address).join(',');
  const ccAddresses = (parsed.cc || []).map(a => a.address).join(',') || null;

  const attachments: ParsedAttachment[] = (parsed.attachments || []).map(att => ({
    filename: att.filename || 'unnamed',
    mimeType: att.mimeType || 'application/octet-stream',
    size: att.content?.byteLength || 0,
    content: att.content,
    contentId: att.contentId,
    isInline: !!(att.contentId && att.inline),
  }));

  return {
    messageId: parsed.messageId || null,
    fromAddress: parsed.from?.address || 'unknown@unknown',
    fromName: parsed.from?.name || '',
    toAddress: toAddresses || '',
    ccAddress: ccAddresses,
    subject: parsed.subject || '(No Subject)',
    text: parsed.text || '',
    html: parsed.html || null,
    inReplyTo: parsed.inReplyTo || null,
    references: parsed.references || null,
    attachments,
  };
}

// ── Threading ────────────────────────────────────────────────────────────

export function generateThreadId(parsed: ParsedEmail, existingThreadIds?: Map<string, string>): string {
  // Try to use References header for threading
  if (parsed.references) {
    const refs = parsed.references.split(/\s+/).filter(Boolean);
    if (refs.length > 0) {
      // Use the first reference as thread root
      return refs[0].replace(/[<>]/g, '');
    }
  }

  // Try In-Reply-To
  if (parsed.inReplyTo) {
    return parsed.inReplyTo.replace(/[<>]/g, '');
  }

  // Fall back to subject-based threading (strip Re:/Fwd:)
  const normalizedSubject = parsed.subject
    .replace(/^(re|fwd|aw|wg):\s*/i, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');

  return `thread-${normalizedSubject}-${parsed.fromAddress}`;
}

// ── Snippet generation ───────────────────────────────────────────────────

export function generateSnippet(text: string, maxLength: number = 200): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength).trim() + '...';
}

// ── Contact auto-collection ──────────────────────────────────────────────

export async function upsertContact(env: any, userId: number, email: string, displayName?: string): Promise<void> {
  try {
    const existing = await env.DB.prepare(
      'SELECT id, contact_count FROM contacts WHERE user_id = ? AND email = ?'
    ).bind(userId, email).first() as any;

    if (existing) {
      await env.DB.prepare(
        'UPDATE contacts SET contact_count = contact_count + 1, last_seen = datetime(\'now\'), display_name = COALESCE(?, display_name) WHERE id = ?'
      ).bind(displayName || null, existing.id).run();
    } else {
      await env.DB.prepare(
        'INSERT INTO contacts (user_id, email, display_name) VALUES (?, ?, ?)'
      ).bind(userId, email, displayName || null).run();
    }
  } catch (e) {
    console.error('Upsert contact error:', e);
  }
}

// ── Default folders for new users ────────────────────────────────────────

export const DEFAULT_FOLDERS = [
  { name: 'Inbox',   type: 'inbox',   icon: 'inbox',   color: '#1a73e8', sort_order: 0 },
  { name: 'Starred', type: 'starred', icon: 'star',    color: '#fbbc04', sort_order: 1 },
  { name: 'Sent',    type: 'sent',    icon: 'send',    color: '#1a73e8', sort_order: 2 },
  { name: 'Drafts',  type: 'drafts',  icon: 'draft',   color: '#5f6368', sort_order: 3 },
  { name: 'Archive', type: 'archive', icon: 'archive', color: '#5f6368', sort_order: 4 },
  { name: 'Spam',    type: 'spam',    icon: 'spam',    color: '#d93025', sort_order: 5 },
  { name: 'Trash',   type: 'trash',   icon: 'trash',   color: '#5f6368', sort_order: 6 },
];

export async function createDefaultFolders(env: any, userId: number): Promise<void> {
  for (const folder of DEFAULT_FOLDERS) {
    await env.DB.prepare(
      'INSERT INTO folders (user_id, name, type, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(userId, folder.name, folder.type, folder.icon, folder.color, folder.sort_order).run();
  }
}

// ── Folder count maintenance ─────────────────────────────────────────────

export async function updateFolderCounts(env: any, userId: number, folderId: number): Promise<void> {
  try {
    const total = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM emails WHERE user_id = ? AND folder_id = ?'
    ).bind(userId, folderId).first() as any;

    const unread = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM emails WHERE user_id = ? AND folder_id = ? AND is_read = 0'
    ).bind(userId, folderId).first() as any;

    await env.DB.prepare(
      'UPDATE folders SET total_count = ?, unread_count = ? WHERE id = ?'
    ).bind(total?.count || 0, unread?.count || 0, folderId).run();
  } catch (e) {
    console.error('Update folder counts error:', e);
  }
}

// ── HTML email template ──────────────────────────────────────────────────

export function buildEmailHtml(body: string, signatureHtml?: string): string {
  return `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #111213; line-height: 1.6;">
      <div style="background-color: #F2782E; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <span style="color: white; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">KREATIX TECHNOLOGIES</span>
      </div>
      <div style="padding: 30px; background-color: #FAF9F7; border: 1px solid #EAE8E4; border-top: none; border-radius: 0 0 8px 8px;">
        <div style="font-size: 15px; color: #333;">
          ${body.replace(/\n/g, '<br>')}
        </div>
        ${signatureHtml ? `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #EAE8E4; font-size: 13px; color: #666;">${signatureHtml}</div>` : ''}
      </div>
      <div style="text-align: center; margin-top: 16px; font-size: 11px; color: #9CA0A6;">
        &copy; 2026 Kreatix Technologies. All rights reserved.
      </div>
    </div>
  `;
}
