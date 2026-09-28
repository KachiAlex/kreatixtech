import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserSettings } from './types';
import { authApi, setTokens, clearTokens, getAccessToken, getRefreshToken } from './api';

interface AuthContextType {
  user: User | null;
  settings: UserSettings | null;
  loading: boolean;
  login: (email: string, password: string, totp_code?: string, remember?: boolean) => Promise<void>;
  register: (email: string, password: string, display_name?: string) => Promise<void>;
  logout: () => Promise<void>;
  // Atomic account switch: authenticates the new account FIRST and only
  // swaps session state on success. On failure the current session is left
  // untouched — the user is never dumped to the login screen mid-switch.
  switchUser: (email: string, password: string) => Promise<void>;
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

  const login = async (email: string, password: string, totp_code?: string, remember?: boolean) => {
    const res = await authApi.login(email, password, totp_code, remember);
    if ((res as any).requires2FA) throw new Error('2FA_REQUIRED');
    setTokens(res.accessToken, res.refreshToken);
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
    try { await authApi.logout(); } catch {}
    clearTokens();
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

    const oldRefresh = getRefreshToken();
    setTokens(res.accessToken, res.refreshToken);
    localStorage.setItem('kreatix_user', JSON.stringify(res.user));
    localStorage.removeItem('kreatix_skip_autologin');
    setUser(res.user);

    // Retire the previous session server-side (best effort)
    if (oldRefresh) authApi.logout(oldRefresh).catch(() => {});

    await refreshUser();
  };

  return (
    <AuthContext.Provider value={{ user, settings, loading, login, register, logout, switchUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
