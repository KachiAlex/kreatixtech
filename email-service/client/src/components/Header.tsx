import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, CircleHelp, Settings, Bell, LogOut, Shield, Plus, Check, ChevronDown, Trash2, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '../auth-context';
import { useAccount } from '../account-context';
import { useToast } from './Toast';
import { authApi } from '../api';

interface HeaderProps {
  onSearch: (query: string) => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onOpenSettings, onOpenAdmin }) => {
  const { user, logout, login } = useAuth();
  const { currentEmail, currentName, accounts, primaryEmail, switchAccount, addAccount, removeAccount } = useAccount();
  const { success: toastSuccess, error: toastError, info: toastInfo, prompt: promptDialog, confirm: confirmDialog } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [acctMenuOpen, setAcctMenuOpen] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showSwitchLogin, setShowSwitchLogin] = useState(false);
  const [switchTargetEmail, setSwitchTargetEmail] = useState('');
  const [switchPassword, setSwitchPassword] = useState('');
  const [switchLoading, setSwitchLoading] = useState(false);
  const [switchError, setSwitchError] = useState('');
  const [rememberAccount, setRememberAccount] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const acctRef = useRef<HTMLDivElement>(null);

  // ── Saved credentials helpers ────────────────────────────────────────────
  const SAVED_CRED_KEY = 'kreatix_saved_accounts';

  const getSavedAccounts = (): Record<string, string> => {
    try {
      const raw = localStorage.getItem(SAVED_CRED_KEY);
      if (!raw) return {};
      const decoded = atob(raw);
      return JSON.parse(decoded);
    } catch { return {}; }
  };

  const saveAccountCred = (email: string, password: string) => {
    const saved = getSavedAccounts();
    saved[email.toLowerCase()] = btoa(password);
    localStorage.setItem(SAVED_CRED_KEY, btoa(JSON.stringify(saved)));
  };

  const removeSavedAccount = (email: string) => {
    const saved = getSavedAccounts();
    delete saved[email.toLowerCase()];
    localStorage.setItem(SAVED_CRED_KEY, btoa(JSON.stringify(saved)));
  };

  const getSavedPassword = (email: string): string | null => {
    const saved = getSavedAccounts();
    const encoded = saved[email.toLowerCase()];
    if (!encoded) return null;
    try { return atob(encoded); } catch { return null; }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) { setAcctMenuOpen(false); setShowAddAccount(false); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [addAcctEmail, setAddAcctEmail] = useState('');
  const [addAcctPassword, setAddAcctPassword] = useState('');
  const [addAcctLoading, setAddAcctLoading] = useState(false);
  const [addAcctError, setAddAcctError] = useState('');

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAcctLoading(true);
    setAddAcctError('');
    try {
      // Verify credentials by attempting login
      const res = await authApi.login(addAcctEmail, addAcctPassword);
      if ((res as any).requires2FA) {
        setAddAcctError('This account requires 2FA. Please sign in from the login page.');
        return;
      }
      // Login succeeded — account exists and credentials are valid
      const displayName = res.user?.display_name || addAcctEmail;
      await addAccount(addAcctEmail, displayName);
      // Save credentials for quick switching
      saveAccountCred(addAcctEmail, addAcctPassword);
      toastSuccess(`Account ${addAcctEmail} added`);
      setAddAcctEmail('');
      setAddAcctPassword('');
      setShowAddAccount(false);
    } catch (err: any) {
      setAddAcctError(err.message === '2FA_REQUIRED' ? 'This account requires 2FA. Please sign in from the login page.' : (err.message || 'Invalid email or password'));
    } finally {
      setAddAcctLoading(false);
    }
  };

  const handleRemoveAccount = async (id: number, email: string) => {
    const ok = await confirmDialog(`Remove ${email} from your linked accounts?`);
    if (!ok) return;
    try { await removeAccount(id); toastSuccess('Account removed'); } catch (e: any) { toastError('Failed to remove account'); }
  };

  const handleSwitchLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSwitchLoading(true);
    setSwitchError('');
    try {
      await logout();
      await login(switchTargetEmail, switchPassword);
      if (rememberAccount) saveAccountCred(switchTargetEmail, switchPassword);
      toastSuccess(`Switched to ${switchTargetEmail}`);
      setShowSwitchLogin(false);
      setSwitchPassword('');
      setSwitchError('');
    } catch (err: any) {
      setSwitchError(err.message || 'Failed to sign in');
    } finally {
      setSwitchLoading(false);
    }
  };

  const openSwitchLogin = async (email: string) => {
    setAcctMenuOpen(false);
    const savedPassword = getSavedPassword(email);
    if (savedPassword) {
      setSwitchLoading(true);
      try {
        await logout();
        await login(email, savedPassword);
        toastSuccess(`Switched to ${email}`);
      } catch (err: any) {
        removeSavedAccount(email);
        setSwitchTargetEmail(email);
        setSwitchPassword('');
        setSwitchError(err.message === '2FA_REQUIRED' ? 'This account requires 2FA. Please sign in from the login page.' : 'Saved credentials expired. Please re-enter.');
        setRememberAccount(true);
        setShowSwitchLogin(true);
      } finally {
        setSwitchLoading(false);
      }
    } else {
      setSwitchTargetEmail(email);
      setSwitchPassword('');
      setSwitchError('');
      setRememberAccount(true);
      setShowSwitchLogin(true);
    }
  };

  const allAccounts = [
    { id: 0, email: primaryEmail, display_name: user?.display_name, is_primary: true },
    ...accounts.map(a => ({ ...a, is_primary: false })),
  ];

  return (
    <header className="topbar">
      <div className="brand">
        <svg viewBox="0 0 245 70" role="img" aria-label="Kreatix Technologies" style={{ width: 155, height: 45 }}>
          <rect x="0" y="5" width="58" height="58" rx="12" fill="#F2782E" />
          <path d="M15 18h19v9l13-9v16L35 42l12 10H31L15 39z" fill="#fff" />
          <text x="75" y="43" fontFamily="Arial,sans-serif" fontSize="34" fontWeight="800" fill="#0E0E0F">kreatix</text>
          <text x="76" y="59" fontFamily="Arial,sans-serif" fontSize="10" letterSpacing="1.6" fill="#858990">TECHNOLOGIES</text>
        </svg>
        <span className="product">Mail</span>
      </div>

      <label className="search">
        <Search />
        <input
          type="text"
          placeholder="Search mail"
          onChange={(e) => onSearch(e.target.value)}
        />
        <button className="icon-btn filter" type="button" aria-label="Search filters">
          <SlidersHorizontal />
        </button>
        <kbd>/</kbd>
      </label>

      <div className="top-actions">
        <button className="icon-btn" aria-label="Help"><CircleHelp /></button>
        <button className="icon-btn" aria-label="Settings" onClick={onOpenSettings}><Settings /></button>
        <button className="icon-btn" aria-label="Notifications"><Bell /></button>

        {/* Account Switcher (Gmail-style) */}
        <div ref={acctRef} style={{ position: 'relative' }}>
          <button
            className="avatar"
            aria-label="Account switcher"
            onClick={() => setAcctMenuOpen(!acctMenuOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {(currentName || currentEmail || 'K')[0].toUpperCase()}
            <ChevronDown style={{ width: 14, height: 14, opacity: 0.6 }} />
          </button>
          {acctMenuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '110%', background: '#fff',
              border: '1px solid var(--line)', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,.13)',
              padding: 0, minWidth: 280, zIndex: 100, overflow: 'hidden',
            }}>
              {/* Current account header */}
              <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar" style={{ width: 40, height: 40, fontSize: 18, flexShrink: 0 }}>
                  {(currentName || currentEmail || 'K')[0].toUpperCase()}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentName || 'User'}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentEmail}</div>
                </div>
              </div>

              {/* Account list */}
              <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                {allAccounts.map(acct => (
                  <div
                    key={acct.id}
                    onClick={() => { if (acct.email !== currentEmail) openSwitchLogin(acct.email); setAcctMenuOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                      cursor: 'pointer', borderBottom: '1px solid #f5f4f2',
                      background: acct.email === currentEmail ? '#fff5ed' : 'transparent',
                    }}
                  >
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 13, flexShrink: 0 }}>
                      {(acct.display_name || acct.email || 'K')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {acct.display_name || acct.email}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {acct.email}
                      </div>
                    </div>
                    {acct.email === currentEmail && <Check style={{ width: 16, height: 16, color: '#F2782E', flexShrink: 0 }} />}
                    {!acct.is_primary && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveAccount(acct.id, acct.email); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#999', flexShrink: 0 }}
                        title="Remove account"
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add account button */}
              {showAddAccount ? null : (
                <button
                  onClick={() => { setShowAddAccount(true); setAddAcctError(''); setAddAcctEmail(''); setAddAcctPassword(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    border: 0, borderTop: '1px solid var(--line)', background: 'transparent',
                    padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#F2782E', cursor: 'pointer',
                  }}
                >
                  <Plus style={{ width: 18, height: 18 }} /> Add another account
                </button>
              )}
              {showAddAccount && (
                <form onSubmit={handleAddAccount} style={{ padding: '12px 16px', borderTop: '1px solid var(--line)' }}>
                  {addAcctError && <div style={{ padding: '8px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{addAcctError}</div>}
                  <input
                    type="email"
                    placeholder="Email address"
                    value={addAcctEmail}
                    onChange={(e) => setAddAcctEmail(e.target.value)}
                    required
                    autoFocus
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e4e2', borderRadius: 8, fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={addAcctPassword}
                    onChange={(e) => setAddAcctPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e4e2', borderRadius: 8, fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => { setShowAddAccount(false); setAddAcctEmail(''); setAddAcctPassword(''); setAddAcctError(''); }} style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e4e2', background: 'transparent', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" disabled={addAcctLoading} style={{ flex: 1, padding: '8px 12px', border: 'none', background: '#F2782E', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: addAcctLoading ? 0.6 : 1 }}>{addAcctLoading ? 'Verifying...' : 'Sign in'}</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Settings/Logout menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button className="icon-btn" aria-label="More options" onClick={() => setMenuOpen(!menuOpen)} style={{ fontSize: 18 }}>
            ⋮
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '110%', background: '#fff',
              border: '1px solid var(--line)', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,.13)',
              padding: 6, minWidth: 220, zIndex: 100,
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.display_name || 'User'}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{user?.email}</div>
              </div>
              {user?.role === 'admin' && (
                <button onClick={() => { setMenuOpen(false); onOpenAdmin(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', border: 0, background: 'transparent', padding: '8px 14px', borderRadius: 6, fontSize: 13, color: '#45474b', textAlign: 'left' }}>
                  <Shield style={{ width: 16, height: 16 }} /> Admin Panel
                </button>
              )}
              <button onClick={() => { setMenuOpen(false); onOpenSettings(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', border: 0, background: 'transparent', padding: '8px 14px', borderRadius: 6, fontSize: 13, color: '#45474b', textAlign: 'left' }}>
                <Settings style={{ width: 16, height: 16 }} /> Settings
              </button>
              <button onClick={() => { setMenuOpen(false); logout(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', border: 0, background: 'transparent', padding: '8px 14px', borderRadius: 6, fontSize: 13, color: 'var(--danger)', textAlign: 'left' }}>
                <LogOut style={{ width: 16, height: 16 }} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Switch Account Login Modal */}
      {showSwitchLogin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSwitchLogin(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.2)', padding: 32, maxWidth: 400, width: '90%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F2782E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail style={{ width: 24, height: 24, color: '#fff' }} />
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Switch Account</h2>
                <p style={{ fontSize: 13, color: '#858990', margin: '2px 0 0' }}>Sign in to {switchTargetEmail}</p>
              </div>
            </div>

            <form onSubmit={handleSwitchLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {switchError && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 12, fontWeight: 600 }}>
                  {switchError}
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#858990', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Email</label>
                <input
                  type="email"
                  value={switchTargetEmail}
                  onChange={(e) => setSwitchTargetEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: '#f5f4f2', border: '1px solid #e5e4e2', borderRadius: 12, outline: 'none', fontSize: 14, fontWeight: 500, boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#858990', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Password</label>
                <input
                  type="password"
                  value={switchPassword}
                  onChange={(e) => setSwitchPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '12px 16px', background: '#f5f4f2', border: '1px solid #e5e4e2', borderRadius: 12, outline: 'none', fontSize: 14, fontWeight: 500, boxSizing: 'border-box' }}
                  required
                  autoFocus
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#45474b', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={rememberAccount}
                  onChange={(e) => setRememberAccount(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#F2782E', cursor: 'pointer' }}
                />
                Remember this account (skip password next time)
              </label>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => { setShowSwitchLogin(false); setSwitchPassword(''); setSwitchError(''); }}
                  style={{ flex: 1, padding: '12px 20px', background: '#f5f4f2', border: '1px solid #e5e4e2', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#45474b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={switchLoading}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: '#F2782E', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', opacity: switchLoading ? 0.6 : 1 }}
                >
                  {switchLoading ? (
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <>Sign In <ArrowRight style={{ width: 16, height: 16 }} /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
