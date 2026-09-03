import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsProps {
  onShortcut?: (action: string) => void;
}

const SHORTCUTS = [
  { key: 'j', label: 'Navigate down', action: 'next' },
  { key: 'k', label: 'Navigate up', action: 'prev' },
  { key: 'e', label: 'Archive', action: 'archive' },
  { key: '#', label: 'Delete', action: 'delete' },
  { key: 's', label: 'Star / unstar', action: 'star' },
  { key: 'r', label: 'Reply', action: 'reply' },
  { key: 'a', label: 'Reply All', action: 'replyAll' },
  { key: 'f', label: 'Forward', action: 'forward' },
  { key: 'c', label: 'Compose new', action: 'compose' },
  { key: 'g i', label: 'Go to Inbox', action: 'inbox' },
  { key: 'g s', label: 'Go to Sent', action: 'sent' },
  { key: 'g d', label: 'Go to Drafts', action: 'drafts' },
  { key: 'g a', label: 'Go to Archive', action: 'archive_folder' },
  { key: '/', label: 'Search', action: 'search' },
  { key: '?', label: 'Show shortcuts', action: 'help' },
  { key: 'Esc', label: 'Close / go back', action: 'escape' },
];

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onShortcut }) => {
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if (e.key === 'Escape') {
          (target as HTMLElement).blur();
        }
        return;
      }

      // Show/hide panel
      if (e.key === '?') {
        e.preventDefault();
        setShowPanel(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setShowPanel(false);
        onShortcut?.('escape');
        return;
      }

      // g + key combos
      if (e.key === 'g') {
        const gHandler = (e2: KeyboardEvent) => {
          window.removeEventListener('keydown', gHandler);
          const combo = SHORTCUTS.find(s => s.key === `g ${e2.key}`);
          if (combo) {
            e2.preventDefault();
            onShortcut?.(combo.action);
          }
        };
        window.addEventListener('keydown', gHandler);
        setTimeout(() => window.removeEventListener('keydown', gHandler), 1000);
        return;
      }

      const shortcut = SHORTCUTS.find(s => s.key === e.key);
      if (shortcut) {
        e.preventDefault();
        onShortcut?.(shortcut.action);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onShortcut]);

  return (
    <>
      <button
        className="icon-btn"
        title="Keyboard shortcuts (?)"
        onClick={() => setShowPanel(!showPanel)}
        style={{ opacity: 0.6 }}
      >
        <Keyboard style={{ width: 18, height: 18 }} />
      </button>

      {showPanel && (
        <div
          onClick={() => setShowPanel(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 14, maxWidth: 480, width: '90%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Keyboard style={{ width: 20, height: 20, color: '#F2782E' }} />
                <strong style={{ fontSize: 16 }}>Keyboard Shortcuts</strong>
              </div>
              <button onClick={() => setShowPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div style={{ padding: '12px 20px' }}>
              {SHORTCUTS.map(s => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ fontSize: 13, color: '#333' }}>{s.label}</span>
                  <kbd style={{ background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>{s.key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;
