export interface User {
  id: number;
  email: string;
  display_name: string;
  role: 'user' | 'admin';
  is_active: number;
  avatar_url?: string;
  storage_quota: number;
  storage_used: number;
  created_at: string;
  last_login_at?: string;
}

export interface UserSettings {
  user_id: number;
  theme: 'light' | 'dark';
  density: 'comfortable' | 'compact';
  language: string;
  signature_html?: string;
  auto_save_drafts: number;
  show_snippets: number;
  items_per_page: number;
  reply_to_address?: string;
  forward_to_address?: string;
  notify_on_new_email: number;
}

export interface Folder {
  id: number;
  user_id: number;
  name: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive' | 'starred' | 'custom';
  icon?: string;
  color?: string;
  sort_order: number;
  unread_count: number;
  total_count: number;
}

export interface Label {
  id: number;
  user_id: number;
  name: string;
  color: string;
}

export interface Attachment {
  id: string;
  email_id?: number;
  filename: string;
  mime_type: string;
  size: number;
  is_inline: number;
  content_id?: string;
  download_url?: string;
}

export interface Email {
  id: number;
  user_id: number;
  message_id?: string;
  thread_id?: string;
  in_reply_to?: string;
  from_address: string;
  from_name?: string;
  to_address: string;
  cc_address?: string;
  bcc_address?: string;
  reply_to?: string;
  subject: string;
  text: string;
  html?: string;
  snippet?: string;
  folder_id?: number;
  is_read: number;
  is_starred: number;
  is_important: number;
  is_draft: number;
  has_attachments: number;
  size: number;
  direction: 'inbound' | 'outbound';
  status: string;
  received_at: string;
  sent_at?: string;
  snooze_until?: string | null;
  attachments?: Attachment[];
  labels?: Label[];
  thread?: Email[];
}

export interface Draft {
  id: number;
  user_id: number;
  to_address?: string;
  cc_address?: string;
  bcc_address?: string;
  subject?: string;
  text?: string;
  html?: string;
  in_reply_to?: number;
  has_attachments: number;
  updated_at: string;
  created_at: string;
}

export interface Signature {
  id: number;
  user_id: number;
  name: string;
  html: string;
  is_default: number;
}

export interface Alias {
  id: number;
  user_id: number;
  alias_email: string;
  forward_to: string;
  is_active: number;
}

export interface Contact {
  id: number;
  user_id: number;
  email: string;
  display_name?: string;
  avatar_url?: string;
  last_seen: string;
  contact_count: number;
}

export interface Session {
  id: string;
  device_info?: string;
  ip_address?: string;
  created_at: string;
  expires_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  resource?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  inboxFolderId?: number;
}

export interface EmailListResponse {
  emails: Email[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalEmails: number;
  totalStorageUsed: number;
}

export interface CalendarEvent {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  all_day: number;
  color: string;
  reminder_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface ChatConversation {
  id: number;
  user_id: number;
  participant_email: string;
  participant_name?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  user_id: number;
  sender_email: string;
  sender_name?: string;
  body: string;
  direction: 'inbound' | 'outbound';
  is_read: number;
  created_at: string;
}

export interface FileItem {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  folder: string;
  is_starred: number;
  created_at: string;
}

export interface StorageInfo {
  quota: number;
  used: number;
}
