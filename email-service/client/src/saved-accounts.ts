// Device-level "remembered accounts" store.
//
// SECURITY: stores a per-account refresh TOKEN — never the password. A token
// is revocable server-side (Sessions page / logout / password reset all kill
// it), rotated on every use, and scoped to that account only. The previous
// format stored base64-encoded passwords, which were plaintext-equivalent;
// v1 entries are wiped on first read.

const SAVED_KEY = 'kreatix_saved_accounts';

interface SavedStore {
  v: 2;
  accounts: Record<string, string>; // email -> refresh token
}

function read(): SavedStore {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return { v: 2, accounts: {} };
    const parsed = JSON.parse(atob(raw));
    if (parsed?.v === 2 && parsed.accounts) return parsed as SavedStore;
    // Legacy format held base64 passwords — discard it entirely
    return { v: 2, accounts: {} };
  } catch {
    return { v: 2, accounts: {} };
  }
}

function write(store: SavedStore) {
  try { localStorage.setItem(SAVED_KEY, btoa(JSON.stringify(store))); } catch { /* ignore */ }
}

export function listSavedAccounts(): string[] {
  return Object.keys(read().accounts);
}

export function getAccountToken(email: string): string | null {
  return read().accounts[email.toLowerCase()] || null;
}

export function saveAccountToken(email: string, refreshToken: string) {
  const store = read();
  store.accounts[email.toLowerCase()] = refreshToken;
  write(store);
}

export function removeSavedAccount(email: string) {
  const store = read();
  delete store.accounts[email.toLowerCase()];
  write(store);
}
