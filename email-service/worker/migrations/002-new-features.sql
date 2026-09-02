-- Migration: New features schema (calendar, chat, files)

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

CREATE TABLE IF NOT EXISTS chat_conversations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL,
  participant_email TEXT NOT NULL,
  participant_name  TEXT,
  last_message    TEXT,
  last_message_at TEXT,
  unread_count    INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_chat_conv_user ON chat_conversations(user_id);

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
