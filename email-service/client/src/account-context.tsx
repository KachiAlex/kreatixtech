import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { LinkedAccount } from './types';
import { linkedAccountsApi } from './api';
import { useAuth } from './auth-context';

interface AccountContextType {
  currentEmail: string;
  currentName: string;
  accounts: LinkedAccount[];
  primaryEmail: string;
  primaryName: string;
  switchAccount: (email: string) => void;
  addAccount: (email: string, display_name?: string) => Promise<void>;
  removeAccount: (id: number) => Promise<void>;
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

  const refreshAccounts = useCallback(async () => {
    if (!user) return;
    try {
      const data = await linkedAccountsApi.list();
      setAccounts(data.accounts);
      setPrimaryEmail(data.primaryEmail || user.email);
      setPrimaryName(data.primaryName || user.display_name);

      const saved = localStorage.getItem('kreatix_current_email');
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

  useEffect(() => {
    if (user) refreshAccounts();
  }, [user, refreshAccounts]);

  const switchAccount = (email: string) => {
    setCurrentEmail(email);
    localStorage.setItem('kreatix_current_email', email);
    const acct = accounts.find(a => a.email === email);
    setCurrentName(acct?.display_name || primaryName);
  };

  const addAccount = async (email: string, display_name?: string) => {
    await linkedAccountsApi.create(email, display_name);
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
      currentEmail, currentName, accounts, primaryEmail, primaryName,
      switchAccount, addAccount, removeAccount, setDefaultAccount, refreshAccounts,
    }}>
      {children}
    </AccountContext.Provider>
  );
};
