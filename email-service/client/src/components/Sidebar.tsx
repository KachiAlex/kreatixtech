import React, { useState, useEffect } from 'react';
import { PenLine, Inbox, Star, Clock3, Send, FileText, Archive, ShieldCheck, Trash2, Plus } from 'lucide-react';
import { folderApi, labelApi, storageApi } from '../api';
import type { Folder, Label, StorageInfo } from '../types';

interface SidebarProps {
  currentFolderId: number | null;
  setCurrentFolder: (folder: Folder | null) => void;
  onCompose: () => void;
  onShowStarred: () => void;
  showStarred: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  inbox: Inbox, starred: Star, sent: Send, drafts: FileText, archive: Archive, spam: ShieldCheck, trash: Trash2,
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

const Sidebar: React.FC<SidebarProps> = ({ currentFolderId, setCurrentFolder, onCompose, onShowStarred, showStarred, mobileOpen, onCloseMobile }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [showSnoozed, setShowSnoozed] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [f, l, s] = await Promise.all([folderApi.list(), labelApi.list(), storageApi.get()]);
      setFolders(f.folders);
      setLabels(l.labels);
      setStorage(s);
    } catch (e) { console.error('Failed to load sidebar', e); }
  };

  const storagePercent = storage ? Math.min(100, (storage.used / storage.quota) * 100) : 0;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={onCloseMobile} />}
    <aside className={`sidebar${mobileOpen ? ' sidebar-mobile-open' : ''}`}>
      <button className="compose-main" onClick={onCompose}>
        <PenLine /> Compose <kbd>C</kbd>
      </button>

      <nav className="nav">
        {folders.map(folder => {
          const Icon = iconMap[folder.type] || FileText;
          const isActive = !showStarred && !showSnoozed && currentFolderId === folder.id;
          return (
            <button
              key={folder.id}
              className={isActive ? 'active' : ''}
              onClick={() => { setCurrentFolder(folder); setShowSnoozed(false); }}
            >
              <Icon />
              <span>{folder.name}</span>
              {folder.unread_count > 0 && folder.type !== 'sent' && folder.type !== 'drafts' && <b>{folder.unread_count}</b>}
              {folder.type === 'drafts' && folder.total_count > 0 && <b>{folder.total_count}</b>}
            </button>
          );
        })}
        <button className={showStarred ? 'active' : ''} onClick={onShowStarred}>
          <Star /><span>Starred</span>
        </button>
        <button className={showSnoozed ? 'active' : ''} onClick={() => { setShowSnoozed(true); setCurrentFolder(null); onShowStarred(); }}>
          <Clock3 /><span>Snoozed</span>
        </button>
      </nav>

      <div className="label-title">
        <span>Labels</span>
        <span style={{ cursor: 'pointer' }}>+</span>
      </div>
      <nav className="labels">
        {labels.map(label => (
          <button key={label.id}>
            <i className="dot" style={{ background: label.color }} />
            {label.name}
          </button>
        ))}
        {labels.length === 0 && (
          <span style={{ padding: '0 10px', fontSize: 12, color: '#999' }}>No labels yet</span>
        )}
      </nav>

      {storage && (
        <div className="storage">
          <div className="storage-head">
            <b>Storage</b>
            <span>{formatBytes(storage.used)} of {formatBytes(storage.quota)}</span>
          </div>
          <div className="bar">
            <i style={{ width: `${storagePercent}%` }} />
          </div>
          <span>Manage storage</span>
        </div>
      )}
    </aside>
    </>
  );
};

export default Sidebar;
