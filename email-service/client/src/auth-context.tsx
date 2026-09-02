import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserSettings } from './types';
import { authApi, setTokens, clearTokens, getAccessToken } from './api';

interface AuthContextType {
  user: User | null;
  settings: UserSettings | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, display_name?: string) => Promise<void>;
  logout: () => Promise<void>;
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

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setTokens(res.accessToken, res.refreshToken);
    localStorage.setItem('kreatix_user', JSON.stringify(res.user));
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
    setUser(null);
    setSettings(null);
  };

  return (
    <AuthContext.Provider value={{ user, settings, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
