import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { LinkedAccount } from './types';
import { linkedAccountsApi } from './api';
import { useAuth } from './auth-context';

export interface DeviceAccount {
  email: string;
  display_name: string;
}

interface AccountContextType {
  currentEmail: string;
  currentName: string;
  accounts: LinkedAccount[];
  deviceAccounts: DeviceAccount[];
  primaryEmail: string;
  primaryName: string;
  switchAccount: (email: string) => void;
  addAccount: (email: string, display_name?: string) => Promise<void>;
  removeAccount: (id: number) => Promise<void>;
  forgetDeviceAccount: (email: string) => void;
  setDefaultAccount: (id: number) => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | null>(null);

export const useAccount = () => {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used within AccountProvider');
  return ctx;
};

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [primaryName, setPrimaryName] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [deviceAccounts, setDeviceAccounts] = useState<DeviceAccount[]>([]);

  // The "current account" selection is scoped per signed-in user so a
  // previous user's choice can never leak into a different session.
  const currentEmailKey = (uid: number) => `kreatix_current_email:${uid}`;

  // Device-level account list: every account signed in on this browser,
  // independent of the per-user server-side linked_accounts. Powers the
  // Gmail-style "all signed-in accounts" switcher.
  const DEVICE_KEY = 'kreatix_device_accounts';
  const loadDeviceAccounts = (): DeviceAccount[] => {
    try {
      const raw = localStorage.getItem(DEVICE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter(a => a && a.email) : [];
    } catch { return []; }
  };

  const upsertDeviceAccount = useCallback((email: string, display_name?: string) => {
    const norm = email.toLowerCase();
    const list = loadDeviceAccounts().filter(a => a.email !== norm);
    const existing = loadDeviceAccounts().find(a => a.email === norm);
    list.push({ email: norm, display_name: display_name || existing?.display_name || norm });
    localStorage.setItem(DEVICE_KEY, JSON.stringify(list));
    setDeviceAccounts(list);
  }, []);

  const forgetDeviceAccount = useCallback((email: string) => {
    const list = loadDeviceAccounts().filter(a => a.email !== email.toLowerCase());
    localStorage.setItem(DEVICE_KEY, JSON.stringify(list));
    setDeviceAccounts(list);
  }, []);

  const refreshAccounts = useCallback(async () => {
    if (!user) return;
    try {
      const data = await linkedAccountsApi.list();
      setAccounts(data.accounts);
      setPrimaryEmail(data.primaryEmail || user.email);
      setPrimaryName(data.primaryName || user.display_name);

      // Drop the legacy unscoped key — selection is tracked per user now
      localStorage.removeItem('kreatix_current_email');

      const saved = localStorage.getItem(currentEmailKey(user.id));
      if (saved && (saved === data.primaryEmail || data.accounts.some(a => a.email === saved))) {
        setCurrentEmail(saved);
        const acct = data.accounts.find(a => a.email === saved);
        setCurrentName(acct?.display_name || data.primaryName || user.display_name);
      } else {
        setCurrentEmail(data.primaryEmail || user.email);
        setCurrentName(data.primaryName || user.display_name);
      }
    } catch (e) {
      setCurrentEmail(user.email);
      setCurrentName(user.display_name);
    }
  }, [user]);

  // When the signed-in user changes, stop displaying the previous account
  // immediately — before the async refresh resolves.
  const prevUserId = useRef<number | null>(null);
  useEffect(() => {
    if (!user) {
      prevUserId.current = null;
      setAccounts([]);
      setCurrentEmail('');
      setCurrentName('');
      return;
    }
    if (prevUserId.current !== null && prevUserId.current !== user.id) {
      setAccounts([]);
      setCurrentEmail(user.email);
      setCurrentName(user.display_name);
    }
    prevUserId.current = user.id;
    setDeviceAccounts(loadDeviceAccounts());
    upsertDeviceAccount(user.email, user.display_name);
    refreshAccounts();
  }, [user, refreshAccounts, upsertDeviceAccount]);

  const switchAccount = (email: string) => {
    setCurrentEmail(email);
    if (user) localStorage.setItem(currentEmailKey(user.id), email);
    const acct = accounts.find(a => a.email === email);
    setCurrentName(acct?.display_name || primaryName);
  };

  const addAccount = async (email: string, display_name?: string) => {
    await linkedAccountsApi.create(email, display_name);
    upsertDeviceAccount(email, display_name);
    await refreshAccounts();
  };

  const removeAccount = async (id: number) => {
    await linkedAccountsApi.delete(id);
    await refreshAccounts();
  };

  const setDefaultAccount = async (id: number) => {
    await linkedAccountsApi.setDefault(id);
    await refreshAccounts();
  };

  return (
    <AccountContext.Provider value={{
      currentEmail, currentName, accounts, deviceAccounts, primaryEmail, primaryName,
      switchAccount, addAccount, removeAccount, forgetDeviceAccount, setDefaultAccount, refreshAccounts,
    }}>
      {children}
    </AccountContext.Provider>
  );
};
