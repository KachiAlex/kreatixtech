import type {
  AuthResponse, User, UserSettings, Email, EmailListResponse,
  Folder, Label, Draft, Signature, Alias, Contact, Session,
  AuditLog, AdminStats, CalendarEvent, ChatConversation, ChatMessage,
  FileItem, StorageInfo,
} from './types';

const API_URL = '/api';

// ── Token management ──────────────────────────────────────────────────────

let accessToken: string | null = localStorage.getItem('kreatix_access_token');
let refreshToken: string | null = localStorage.getItem('kreatix_refresh_token');
let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken() { return accessToken; }
export function getRefreshToken() { return refreshToken; }

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('kreatix_access_token', access);
  localStorage.setItem('kreatix_refresh_token', refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('kreatix_access_token');
  localStorage.removeItem('kreatix_refresh_token');
  localStorage.removeItem('kreatix_user');
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  if (!refreshToken) return null;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) { clearTokens(); return null; }
      const data = await res.json();
      accessToken = data.accessToken;
      localStorage.setItem('kreatix_access_token', data.accessToken);
      return data.accessToken;
    } catch {
      clearTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ── Core fetch wrapper with auto-refresh ──────────────────────────────────

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    }
  }

  return res;
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Request failed'); }
  return res.json();
}

async function apiPost<T>(path: string, body?: any): Promise<T> {
  const res = await apiFetch(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Request failed'); }
  return res.json();
}

async function apiPut<T>(path: string, body?: any): Promise<T> {
  const res = await apiFetch(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Request failed'); }
  return res.json();
}

async function apiPatch<T>(path: string, body?: any): Promise<T> {
  const res = await apiFetch(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Request failed'); }
  return res.json();
}

async function apiDelete<T>(path: string): Promise<T> {
  const res = await apiFetch(path, { method: 'DELETE' });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Request failed'); }
  return res.json();
}

// ── Auth API ──────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string, display_name?: string) =>
    apiPost<AuthResponse>('/auth/register', { email, password, display_name }),
  login: (email: string, password: string) =>
    apiPost<AuthResponse>('/auth/login', { email, password }),
  logout: () => apiPost('/auth/logout', { refreshToken }),
  me: () => apiGet<{ user: User; settings: UserSettings }>('/auth/me'),
};

// ── Email API ─────────────────────────────────────────────────────────────

export const emailApi = {
  list: (params: { folder_id?: number; search?: string; page?: number; limit?: number; starred?: boolean; unread?: boolean }) => {
    const query = new URLSearchParams();
    if (params.folder_id) query.set('folder_id', String(params.folder_id));
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.starred) query.set('starred', 'true');
    if (params.unread) query.set('unread', 'true');
    return apiGet<EmailListResponse>(`/emails?${query}`);
  },
  get: (id: number) => apiGet<Email>(`/emails/${id}`),
  markRead: (id: number) => apiPost(`/emails/${id}/read`),
  markUnread: (id: number) => apiPost(`/emails/${id}/unread`),
  star: (id: number, starred: boolean) => apiPost(`/emails/${id}/star`, { starred }),
  delete: (id: number) => apiDelete(`/emails/${id}`),
  bulk: (ids: number[], action: string, folder_id?: number) =>
    apiPost('/emails/bulk', { ids, action, folder_id }),
  send: (data: { to: string | string[]; cc?: string; bcc?: string; subject: string; body: string; html?: string; from?: string; fromName?: string; replyToId?: number }) =>
    apiPost('/send', data),
  setLabels: (emailId: number, labelIds: number[]) =>
    apiPost(`/emails/${emailId}/labels`, { label_ids: labelIds }),
};

// ── Folder API ────────────────────────────────────────────────────────────

export const folderApi = {
  list: () => apiGet<{ folders: Folder[] }>('/folders'),
  create: (name: string, icon?: string, color?: string) =>
    apiPost<Folder>('/folders', { name, icon, color }),
  update: (id: number, data: Partial<Folder>) => apiPatch(`/folders/${id}`, data),
  delete: (id: number) => apiDelete(`/folders/${id}`),
};

// ── Label API ─────────────────────────────────────────────────────────────

export const labelApi = {
  list: () => apiGet<{ labels: Label[] }>('/labels'),
  create: (name: string, color?: string) => apiPost<Label>('/labels', { name, color }),
  delete: (id: number) => apiDelete(`/labels/${id}`),
};

// ── Draft API ─────────────────────────────────────────────────────────────

export const draftApi = {
  list: () => apiGet<{ drafts: Draft[] }>('/drafts'),
  create: (data: Partial<Draft>) => apiPost<{ id: number }>('/drafts', data),
  update: (id: number, data: Partial<Draft>) => apiPut(`/drafts/${id}`, data),
  delete: (id: number) => apiDelete(`/drafts/${id}`),
};

// ── Settings API ──────────────────────────────────────────────────────────

export const settingsApi = {
  get: () => apiGet<UserSettings>('/settings'),
  update: (data: Partial<UserSettings>) => apiPut('/settings', data),
};

// ── Contact API ───────────────────────────────────────────────────────────

export const contactApi = {
  list: (search?: string) => apiGet<{ contacts: Contact[] }>(`/contacts${search ? `?search=${search}` : ''}`),
};

// ── Signature API ─────────────────────────────────────────────────────────

export const signatureApi = {
  list: () => apiGet<{ signatures: Signature[] }>('/signatures'),
  create: (name: string, html: string, is_default?: boolean) =>
    apiPost<{ id: number }>('/signatures', { name, html, is_default }),
  delete: (id: number) => apiDelete(`/signatures/${id}`),
};

// ── Alias API ─────────────────────────────────────────────────────────────

export const aliasApi = {
  list: () => apiGet<{ aliases: Alias[] }>('/aliases'),
  create: (alias_email: string, forward_to: string) =>
    apiPost<{ id: number }>('/aliases', { alias_email, forward_to }),
  delete: (id: number) => apiDelete(`/aliases/${id}`),
};

// ── Session API ───────────────────────────────────────────────────────────

export const sessionApi = {
  list: () => apiGet<{ sessions: Session[] }>('/sessions'),
  delete: (id: string) => apiDelete(`/sessions/${id}`),
};

// ── Admin API ─────────────────────────────────────────────────────────────

export const adminApi = {
  users: () => apiGet<{ users: User[] }>('/admin/users'),
  createUser: (email: string, password: string, display_name?: string, role?: string) =>
    apiPost<User>('/admin/users', { email, password, display_name, role }),
  updateUser: (id: number, data: Partial<User> & { password?: string }) =>
    apiPatch(`/admin/users/${id}`, data),
  deleteUser: (id: number) => apiDelete(`/admin/users/${id}`),
  audit: (page?: number) => apiGet<{ logs: AuditLog[]; page: number }>(`/admin/audit${page ? `?page=${page}` : ''}`),
  stats: () => apiGet<AdminStats>('/admin/stats'),
};

// ── Snooze API ────────────────────────────────────────────────────────────

export const snoozeApi = {
  snooze: (emailId: number, snoozeUntil: string) =>
    apiPost(`/emails/${emailId}/snooze`, { snooze_until: snoozeUntil }),
  unsnooze: (emailId: number) =>
    apiPost(`/emails/${emailId}/unsnooze`),
};

// ── Attachment Download API ───────────────────────────────────────────────

export const attachmentApi = {
  downloadUrl: (id: string) => `${API_URL}/attachments/${id}`,
};

// ── Calendar API ──────────────────────────────────────────────────────────

export const calendarApi = {
  list: (start?: string, end?: string) => {
    const query = new URLSearchParams();
    if (start) query.set('start', start);
    if (end) query.set('end', end);
    return apiGet<{ events: CalendarEvent[] }>(`/calendar/events?${query}`);
  },
  create: (data: { title: string; description?: string; location?: string; start_time: string; end_time: string; all_day?: number; color?: string; reminder_minutes?: number }) =>
    apiPost<{ id: number }>('/calendar/events', data),
  update: (id: number, data: Partial<CalendarEvent>) =>
    apiPut(`/calendar/events/${id}`, data),
  delete: (id: number) => apiDelete(`/calendar/events/${id}`),
};

// ── Chat API ──────────────────────────────────────────────────────────────

export const chatApi = {
  conversations: () => apiGet<{ conversations: ChatConversation[] }>('/chat/conversations'),
  createConversation: (participant_email: string, participant_name?: string) =>
    apiPost<{ id: number }>('/chat/conversations', { participant_email, participant_name }),
  messages: (convId: number) => apiGet<{ messages: ChatMessage[] }>(`/chat/conversations/${convId}/messages`),
  sendMessage: (convId: number, body: string, sender_email?: string, sender_name?: string, direction?: string) =>
    apiPost<{ id: number }>(`/chat/conversations/${convId}/messages`, { body, sender_email, sender_name, direction }),
  deleteConversation: (id: number) => apiDelete(`/chat/conversations/${id}`),
};

// ── Files API ─────────────────────────────────────────────────────────────

export const filesApi = {
  list: () => apiGet<{ files: FileItem[] }>('/files'),
  upload: async (file: File): Promise<{ id: string; filename: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const headers: Record<string, string> = {};
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    const res = await fetch(`${API_URL}/files/upload`, { method: 'POST', headers, body: formData });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Upload failed'); }
    return res.json();
  },
  downloadUrl: (id: string) => `${API_URL}/files/${id}/download`,
  delete: (id: string) => apiDelete(`/files/${id}`),
};

// ── Storage API ───────────────────────────────────────────────────────────

export const storageApi = {
  get: () => apiGet<StorageInfo>('/storage'),
};
