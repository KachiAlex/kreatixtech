import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, CircleHelp, Settings, Bell, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../auth-context';

interface HeaderProps {
  onSearch: (query: string) => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onOpenSettings, onOpenAdmin }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button className="avatar" aria-label="Account menu" onClick={() => setMenuOpen(!menuOpen)}>
            {(user?.display_name || user?.email || 'K')[0].toUpperCase()}
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
