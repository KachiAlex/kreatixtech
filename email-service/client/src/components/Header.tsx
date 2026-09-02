import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, CircleHelp, Settings, Bell, LogOut, Shield, Plus, Check, ChevronDown, Trash2 } from 'lucide-react';
import { useAuth } from '../auth-context';
import { useAccount } from '../account-context';
import { useToast } from './Toast';

interface HeaderProps {
  onSearch: (query: string) => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onOpenSettings, onOpenAdmin }) => {
  const { user, logout } = useAuth();
  const { currentEmail, currentName, accounts, primaryEmail, switchAccount, addAccount, removeAccount } = useAccount();
  const { success: toastSuccess, error: toastError, info: toastInfo, prompt: promptDialog, confirm: confirmDialog } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [acctMenuOpen, setAcctMenuOpen] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const acctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) { setAcctMenuOpen(false); setShowAddAccount(false); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAddAccount = async () => {
    const email = await promptDialog('Enter the email address to link:');
    if (!email) return;
    const name = await promptDialog('Enter a display name (optional):');
    try {
      await addAccount(email, name || undefined);
      toastSuccess('Account linked successfully');
    } catch (e: any) { toastError(e.message || 'Failed to link account'); }
    setShowAddAccount(false);
  };

  const handleRemoveAccount = async (id: number, email: string) => {
    const ok = await confirmDialog(`Remove ${email} from your linked accounts?`);
    if (!ok) return;
    try { await removeAccount(id); toastSuccess('Account removed'); } catch (e: any) { toastError('Failed to remove account'); }
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
                    onClick={() => { switchAccount(acct.email); setAcctMenuOpen(false); toastSuccess(`Switched to ${acct.email}`); }}
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
                  onClick={handleAddAccount}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    border: 0, borderTop: '1px solid var(--line)', background: 'transparent',
                    padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#F2782E', cursor: 'pointer',
                  }}
                >
                  <Plus style={{ width: 18, height: 18 }} /> Add another account
                </button>
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
    </header>
  );
};

export default Header;
