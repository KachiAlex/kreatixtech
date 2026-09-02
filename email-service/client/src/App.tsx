import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './auth-context';
import Header from './components/Header';
import Rail, { ViewType } from './components/Rail';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailView from './components/EmailView';
import ComposeModal from './components/ComposeModal';
import SettingsPanel from './components/SettingsPanel';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import CalendarView from './components/CalendarView';
import ContactsView from './components/ContactsView';
import ChatView from './components/ChatView';
import FilesView from './components/FilesView';
import { emailApi, snoozeApi } from './api';
import type { Email, Folder } from './types';

function MailApp() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<ViewType>('mail');
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [showStarred, setShowStarred] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeReplyTo, setComposeReplyTo] = useState<Email | null>(null);
  const [composeForwardFrom, setComposeForwardFrom] = useState<Email | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [listLoading, setListLoading] = useState(true);

  const fetchEmails = useCallback(async () => {
    if (!user) return;
    setListLoading(true);
    try {
      const params: any = {};
      if (showStarred) params.starred = true;
      else if (currentFolder) params.folder_id = currentFolder.id;
      if (searchQuery) params.search = searchQuery;
      const data = await emailApi.list(params);
      setEmails(data.emails);
    } catch (e) { console.error('Failed to fetch emails', e); }
    setListLoading(false);
  }, [user, currentFolder, showStarred, searchQuery]);

  useEffect(() => {
    if (user && view === 'mail') fetchEmails();
  }, [fetchEmails, user, view]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === 'c' && !isComposeOpen) { e.preventDefault(); setIsComposeOpen(true); }
      if (e.key === '/' ) { e.preventDefault(); document.querySelector('.search input')?.focus(); }
      if (e.key === 'Escape') { setSelectedEmail(null); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isComposeOpen]);

  const handleSelectEmail = async (email: Email) => {
    try {
      const full = await emailApi.get(email.id);
      setSelectedEmail(full);
    } catch (e) { console.error('Failed to load email', e); }
  };

  const handleReply = (email: Email) => {
    setComposeReplyTo(email);
    setComposeForwardFrom(null);
    setIsComposeOpen(true);
  };

  const handleForward = (email: Email) => {
    setComposeForwardFrom(email);
    setComposeReplyTo(null);
    setIsComposeOpen(true);
  };

  const handleComposeClose = () => {
    setIsComposeOpen(false);
    setComposeReplyTo(null);
    setComposeForwardFrom(null);
  };

  const handleDelete = async (id: number) => {
    try { await emailApi.delete(id); setSelectedEmail(null); fetchEmails(); } catch (e) { console.error(e); }
  };

  const handleArchive = async (id: number) => {
    try { await emailApi.bulk([id], 'archive'); setSelectedEmail(null); fetchEmails(); } catch (e) { console.error(e); }
  };

  const handleSnooze = async (id: number) => {
    const until = prompt('Snooze until (YYYY-MM-DD HH:MM):');
    if (!until) return;
    try { await snoozeApi.snooze(id, until); fetchEmails(); } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f8fc' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #E8E5E0', borderTopColor: '#F2782E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (view) {
      case 'calendar': return <CalendarView />;
      case 'contacts': return <ContactsView />;
      case 'chat': return <ChatView />;
      case 'files': return <FilesView />;
      default:
        return (
          <>
            <Sidebar
              currentFolderId={currentFolder?.id || null}
              setCurrentFolder={(f) => { setCurrentFolder(f); setShowStarred(false); setSelectedEmail(null); }}
              onCompose={() => { setComposeReplyTo(null); setComposeForwardFrom(null); setIsComposeOpen(true); }}
              onShowStarred={() => { setShowStarred(true); setSelectedEmail(null); setCurrentFolder(null); }}
              showStarred={showStarred}
            />
            {listLoading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 28, height: 28, border: '3px solid #E8E5E0', borderTopColor: '#F2782E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : (
              <>
                <EmailList
                  emails={emails}
                  onSelectEmail={handleSelectEmail}
                  onRefresh={fetchEmails}
                  selectedEmailId={selectedEmail?.id}
                  folderName={showStarred ? 'Starred' : currentFolder?.name || 'Inbox'}
                />
                <EmailView
                  email={selectedEmail}
                  onReply={handleReply}
                  onForward={handleForward}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onSnooze={handleSnooze}
                  onBack={() => setSelectedEmail(null)}
                />
              </>
            )}
          </>
        );
    }
  };

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header
        onSearch={setSearchQuery}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAdmin={() => setShowAdmin(true)}
      />
      <div className="workspace">
        <Rail current={view} onChange={setView} />
        {renderView()}
      </div>

      {isComposeOpen && (
        <ComposeModal
          onClose={handleComposeClose}
          replyTo={composeReplyTo}
          forwardFrom={composeForwardFrom}
        />
      )}

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MailApp />
    </AuthProvider>
  );
}
