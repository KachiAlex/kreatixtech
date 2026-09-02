-- ============================================================
-- Kreatix Mail — D1 Schema (v2)
-- ============================================================

-- ── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user',        -- user | admin
  is_active     INTEGER NOT NULL DEFAULT 1,
  avatar_url    TEXT,
  storage_quota INTEGER NOT NULL DEFAULT 5368709120,  -- 5 GB default
  storage_used  INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── Sessions (JWT refresh tokens) ───────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,                       -- uuid
  user_id     INTEGER NOT NULL,
  token_hash  TEXT NOT NULL,
  device_info TEXT,
  ip_address  TEXT,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ── Folders ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS folders (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'custom',          -- inbox | sent | drafts | trash | spam | archive | custom
  icon        TEXT,
  color       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  unread_count INTEGER NOT NULL DEFAULT 0,
  total_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_folders_user ON folders(user_id);

-- ── Emails ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emails (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  message_id    TEXT,                                   -- RFC Message-ID header
  thread_id     TEXT,                                   -- for conversation grouping
  in_reply_to   TEXT,                                   -- RFC In-Reply-To header
  ref_header    TEXT,                                   -- RFC References header chain
  from_address  TEXT NOT NULL,
  from_name     TEXT,
  to_address    TEXT NOT NULL,                          -- comma-separated
  cc_address    TEXT,
  bcc_address   TEXT,
  reply_to      TEXT,
  subject       TEXT,
  text          TEXT,
  html          TEXT,
  snippet       TEXT,                                   -- first ~200 chars of text
  folder_id     INTEGER,
  is_read       INTEGER NOT NULL DEFAULT 0,
  is_starred    INTEGER NOT NULL DEFAULT 0,
  is_important  INTEGER NOT NULL DEFAULT 0,
  is_draft      INTEGER NOT NULL DEFAULT 0,
  has_attachments INTEGER NOT NULL DEFAULT 0,
  size          INTEGER NOT NULL DEFAULT 0,             -- total bytes
  direction     TEXT NOT NULL DEFAULT 'inbound',        -- inbound | outbound
  status        TEXT NOT NULL DEFAULT 'received',       -- received | sent | sending | failed | bounced
  received_at   TEXT NOT NULL DEFAULT (datetime('now')),
  sent_at       TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  snooze_until  TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_emails_user_folder ON emails(user_id, folder_id);
CREATE INDEX IF NOT EXISTS idx_emails_user_starred ON emails(user_id, is_starred);
CREATE INDEX IF NOT EXISTS idx_emails_thread ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_received ON emails(user_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_search ON emails(user_id, subject, from_address, to_address, text);

-- ── Email Labels (many-to-many) ─────────────────────────────
CREATE TABLE IF NOT EXISTS labels (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#6B7280',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_labels_user ON labels(user_id);

CREATE TABLE IF NOT EXISTS email_labels (
  email_id    INTEGER NOT NULL,
  label_id    INTEGER NOT NULL,
  PRIMARY KEY (email_id, label_id),
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_email_labels_email ON email_labels(email_id);
CREATE INDEX IF NOT EXISTS idx_email_labels_label ON email_labels(label_id);

-- ── Attachments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attachments (
  id           TEXT PRIMARY KEY,                        -- uuid
  email_id     INTEGER,
  user_id      INTEGER NOT NULL,
  filename     TEXT NOT NULL,
  mime_type    TEXT NOT NULL,
  size         INTEGER NOT NULL,
  r2_key       TEXT NOT NULL,                           -- R2 object key
  is_inline    INTEGER NOT NULL DEFAULT 0,
  content_id   TEXT,                                    -- for inline images (CID)
  download_url TEXT,                                    -- signed URL or public URL
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_attachments_email ON attachments(email_id);
CREATE INDEX IF NOT EXISTS idx_attachments_user ON attachments(user_id);

-- ── Drafts ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drafts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL,
  to_address   TEXT,
  cc_address   TEXT,
  bcc_address  TEXT,
  subject      TEXT,
  text         TEXT,
  html         TEXT,
  in_reply_to  INTEGER,                                  -- email_id being replied to
  has_attachments INTEGER NOT NULL DEFAULT 0,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (in_reply_to) REFERENCES emails(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_drafts_user ON drafts(user_id);

-- ── Signatures ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS signatures (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  name        TEXT NOT NULL DEFAULT 'Default',
  html        TEXT,
  is_default  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_signatures_user ON signatures(user_id);

-- ── User Settings ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_id             INTEGER PRIMARY KEY,
  theme               TEXT NOT NULL DEFAULT 'light',     -- light | dark
  density             TEXT NOT NULL DEFAULT 'comfortable', -- comfortable | compact
  language            TEXT NOT NULL DEFAULT 'en',
  signature_html      TEXT,
  auto_save_drafts    INTEGER NOT NULL DEFAULT 1,
  show_snippets       INTEGER NOT NULL DEFAULT 1,
  items_per_page      INTEGER NOT NULL DEFAULT 50,
  reply_to_address    TEXT,
  forward_to_address  TEXT,
  notify_on_new_email INTEGER NOT NULL DEFAULT 0,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Aliases (forwarding addresses) ──────────────────────────
CREATE TABLE IF NOT EXISTS aliases (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  alias_email TEXT NOT NULL UNIQUE,
  forward_to  TEXT NOT NULL,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_aliases_email ON aliases(alias_email);

-- ── Audit Log ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER,
  action      TEXT NOT NULL,                             -- login | logout | send | delete | create_user | etc.
  resource    TEXT,
  resource_id TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  details     TEXT,                                      -- JSON
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- ── Contacts (auto-collected) ───────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL,
  email        TEXT NOT NULL,
  display_name TEXT,
  avatar_url   TEXT,
  last_seen    TEXT NOT NULL DEFAULT (datetime('now')),
  contact_count INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, email)
);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(user_id, email);

-- ── Snooze (added column on emails) ─────────────────────────
-- ALTER TABLE emails ADD COLUMN snooze_until TEXT;

-- ── Calendar Events ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_events (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id          INTEGER NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  location         TEXT,
  start_time       TEXT NOT NULL,
  end_time         TEXT NOT NULL,
  all_day          INTEGER NOT NULL DEFAULT 0,
  color            TEXT DEFAULT '#F2782E',
  reminder_minutes INTEGER DEFAULT 15,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_calendar_user ON calendar_events(user_id, start_time);

-- ── Chat Conversations ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_conversations (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id           INTEGER NOT NULL,
  participant_email TEXT NOT NULL,
  participant_name  TEXT,
  last_message      TEXT,
  last_message_at   TEXT,
  unread_count      INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_chat_conv_user ON chat_conversations(user_id);

-- ── Chat Messages ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  user_id         INTEGER NOT NULL,
  sender_email    TEXT NOT NULL,
  sender_name     TEXT,
  body            TEXT NOT NULL,
  direction       TEXT NOT NULL DEFAULT 'outbound',
  is_read         INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_chat_msg_conv ON chat_messages(conversation_id, created_at);

-- ── Files (user-uploaded files in R2) ───────────────────────
CREATE TABLE IF NOT EXISTS files (
  id          TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  filename    TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  size        INTEGER NOT NULL,
  r2_key      TEXT NOT NULL,
  folder      TEXT DEFAULT 'root',
  is_starred  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id);
