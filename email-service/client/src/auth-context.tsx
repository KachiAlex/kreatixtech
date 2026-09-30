import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserSettings } from './types';
import { authApi, setTokens, clearTokens, getAccessToken, getRefreshToken } from './api';
import { saveAccountToken, getAccountToken, removeSavedAccount } from './saved-accounts';

interface AuthContextType {
  user: User | null;
  settings: UserSettings | null;
  loading: boolean;
  login: (email: string, password: string, totp_code?: string, remember?: boolean, recovery_code?: string) => Promise<void>;
  register: (email: string, password: string, display_name?: string) => Promise<void>;
  logout: () => Promise<void>;
  // Atomic account switch: authenticates the new account FIRST and only
  // swaps session state on success. On failure the current session is left
  // untouched — the user is never dumped to the login screen mid-switch.
  switchUser: (email: string, password: string) => Promise<void>;
  // Switch to a remembered account using its saved refresh token — no password.
  switchUserWithToken: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) { setLoading(false); setUser(null); return; }
    try {
      const data = await authApi.me();
      setUser(data.user);
      setSettings(data.settings || null);
    } catch {
      clearTokens();
      setUser(null);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = async (email: string, password: string, totp_code?: string, remember?: boolean, recovery_code?: string) => {
    const res = await authApi.login(email, password, totp_code, remember, recovery_code);
    if ((res as any).requires2FA) throw new Error('2FA_REQUIRED');
    setTokens(res.accessToken, res.refreshToken);
    // "Remember me" persists a refresh token — never the password
    if (remember) saveAccountToken(res.user.email, res.refreshToken);
    else removeSavedAccount(res.user.email);
    localStorage.setItem('kreatix_user', JSON.stringify(res.user));
    localStorage.removeItem('kreatix_skip_autologin');
    setUser(res.user);
    await refreshUser();
  };

  const register = async (email: string, password: string, display_name?: string) => {
    const res = await authApi.register(email, password, display_name);
    setTokens(res.accessToken, res.refreshToken);
    localStorage.setItem('kreatix_user', JSON.stringify(res.user));
    setUser(res.user);
    await refreshUser();
  };

  const logout = async () => {
    const signedOutEmail = user?.email;
    try { await authApi.logout(); } catch {}
    clearTokens();
    if (signedOutEmail) removeSavedAccount(signedOutEmail);
    // Explicit logout must not bounce straight back in via saved-credential
    // auto-login — the login screen shows the account picker instead
    localStorage.setItem('kreatix_skip_autologin', '1');
    setUser(null);
    setSettings(null);
  };

  const switchUser = async (email: string, password: string) => {
    // Authenticate the new account before touching the current session —
    // if this throws, the user simply stays signed in as before.
    const res = await authApi.login(email, password);
    if ((res as any).requires2FA) throw new Error('2FA_REQUIRED');

    // Park the outgoing session's refresh token under its own email so the
    // user can switch back without a password (Gmail-style multi-session).
    const oldRefresh = getRefreshToken();
    if (oldRefresh && user?.email) saveAccountToken(user.email, oldRefresh);

    setTokens(res.accessToken, res.refreshToken);
    saveAccountToken(res.user.email, res.refreshToken);
    localStorage.setItem('kreatix_user', JSON.stringify(res.user));
    localStorage.removeItem('kreatix_skip_autologin');
    setUser(res.user);

    await refreshUser();
  };

  const switchUserWithToken = async (email: string) => {
    const savedRt = getAccountToken(email);
    if (!savedRt) throw new Error('NO_SAVED_SESSION');

    // Exchange the saved refresh token for a fresh session. The server rotates
    // refresh tokens, so the returned token replaces the stored one.
    const res = await authApi.refreshWithToken(savedRt);

    const oldRefresh = getRefreshToken();
    if (oldRefresh && user?.email) saveAccountToken(user.email, oldRefresh);

    setTokens(res.accessToken, res.refreshToken);
    saveAccountToken(email, res.refreshToken);

    // Verify we actually landed on the requested account before committing
    const me = await authApi.me();
    if (me.user.email.toLowerCase() !== email.toLowerCase()) {
      clearTokens();
      if (oldRefresh) setTokens('', oldRefresh);
      throw new Error('ACCOUNT_MISMATCH');
    }
    localStorage.setItem('kreatix_user', JSON.stringify(me.user));
    localStorage.removeItem('kreatix_skip_autologin');
    setUser(me.user);
    setSettings(me.settings || null);
    await refreshUser();
  };

  return (
    <AuthContext.Provider value={{ user, settings, loading, login, register, logout, switchUser, switchUserWithToken, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
