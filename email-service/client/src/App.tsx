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
import SplashScreen from './components/SplashScreen';
import { initNotifications, setNotificationUserId, clearNotificationUser } from './notifications';
import CalendarView from './components/CalendarView';
import ContactsView from './components/ContactsView';
import ChatView from './components/ChatView';
import FilesView from './components/FilesView';
import OutboxView from './components/OutboxView';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import { ToastProvider, useToast } from './components/Toast';
import { AccountProvider, useAccount } from './account-context';
import { emailApi, snoozeApi, unreadApi } from './api';
import type { Email, Folder } from './types';
import { Mail, CalendarDays, Users, MessageCircle, File, Send } from 'lucide-react';

function MailApp() {
  const { user, loading } = useAuth();
  const { confirm: confirmDialog, prompt: promptDialog, success: toastSuccess, error: toastError } = useToast();
  const [view, setView] = useState<ViewType>('mail');
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [showStarred, setShowStarred] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeReplyTo, setComposeReplyTo] = useState<Email | null>(null);
  const [composeReplyAll, setComposeReplyAll] = useState(false);
  const [composeForwardFrom, setComposeForwardFrom] = useState<Email | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Initialize OneSignal after splash
  useEffect(() => {
    if (!showSplash) initNotifications();
  }, [showSplash]);

  // Sync notification user on auth change
  useEffect(() => {
    if (user) setNotificationUserId(String(user.id), user.email);
    else clearNotificationUser();
  }, [user]);

  const fetchEmails = useCallback(async () => {
    if (!user) return;
    setListLoading(true);
    try {
      const params: any = {};
      if (showStarred) params.starred = true;
      else if (currentFolder) params.folder_id = currentFolder.id;
      if (debouncedSearch) params.search = debouncedSearch;
      const data = await emailApi.list(params);
      setEmails(data.emails);
    } catch (e) { console.error('Failed to fetch emails', e); }
    setListLoading(false);
  }, [user, currentFolder, showStarred, debouncedSearch]);

  useEffect(() => {
    if (user && view === 'mail') fetchEmails();
  }, [fetchEmails, user, view]);

  // Auto-refresh: poll for new emails every 30 seconds
  const [lastUnreadCount, setLastUnreadCount] = useState(0);
  useEffect(() => {
    if (!user || view !== 'mail') return;
    const poll = async () => {
      try {
        const data = await unreadApi.get();
        if (data.totalUnread > lastUnreadCount && lastUnreadCount > 0) {
          toastSuccess(`You have ${data.totalUnread - lastUnreadCount} new email(s)`);
          fetchEmails();
        }
        setLastUnreadCount(data.totalUnread);
      } catch { /* ignore polling errors */ }
    };
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [user, view, lastUnreadCount, fetchEmails, toastSuccess]);

  // Keyboard shortcuts handler (moved after handler definitions below)

  const handleSelectEmail = async (email: Email) => {
    try {
      const full = await emailApi.get(email.id);
      setSelectedEmail(full);
    } catch (e) { console.error('Failed to load email', e); }
  };

  const handleReply = (email: Email) => {
    setComposeReplyTo(email);
    setComposeReplyAll(false);
    setComposeForwardFrom(null);
    setIsComposeOpen(true);
  };

  const handleReplyAll = (email: Email) => {
    setComposeReplyTo(email);
    setComposeReplyAll(true);
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
    setComposeReplyAll(false);
    setComposeForwardFrom(null);
  };

  const handleDelete = async (id: number) => {
    try { await emailApi.delete(id); setSelectedEmail(null); fetchEmails(); toastSuccess('Email moved to trash'); } catch (e: any) { toastError(e.message || 'Failed to delete email'); }
  };

  const handleArchive = async (id: number) => {
    try { await emailApi.bulk([id], 'archive'); setSelectedEmail(null); fetchEmails(); toastSuccess('Email archived'); } catch (e: any) { toastError(e.message || 'Failed to archive email'); }
  };

  const handleSnooze = async (id: number) => {
    const until = await promptDialog('Snooze this email until (YYYY-MM-DD HH:MM):');
    if (!until) return;
    try { await snoozeApi.snooze(id, until); toastSuccess('Email snoozed successfully'); fetchEmails(); } catch (e: any) { toastError(e.message || 'Failed to snooze email'); }
  };

  // Keyboard shortcuts handler
  const handleShortcut = useCallback((action: string) => {
    switch (action) {
      case 'compose':
        if (!isComposeOpen) { setComposeReplyTo(null); setComposeReplyAll(false); setComposeForwardFrom(null); setIsComposeOpen(true); }
        break;
      case 'search':
        (document.querySelector('.search input') as HTMLInputElement)?.focus();
        break;
      case 'escape':
        setSelectedEmail(null);
        break;
      case 'next':
        if (emails.length > 0) {
          const idx = selectedEmail ? emails.findIndex(e => e.id === selectedEmail.id) : -1;
          if (idx < emails.length - 1) handleSelectEmail(emails[idx + 1]);
        }
        break;
      case 'prev':
        if (emails.length > 0 && selectedEmail) {
          const idx = emails.findIndex(e => e.id === selectedEmail.id);
          if (idx > 0) handleSelectEmail(emails[idx - 1]);
        }
        break;
      case 'archive':
        if (selectedEmail) handleArchive(selectedEmail.id);
        break;
      case 'delete':
        if (selectedEmail) handleDelete(selectedEmail.id);
        break;
      case 'star':
        if (selectedEmail) {
          emailApi.star(selectedEmail.id, selectedEmail.is_starred !== 1);
          setSelectedEmail({ ...selectedEmail, is_starred: selectedEmail.is_starred === 1 ? 0 : 1 });
          fetchEmails();
        }
        break;
      case 'reply':
        if (selectedEmail) handleReply(selectedEmail);
        break;
      case 'replyAll':
        if (selectedEmail) handleReplyAll(selectedEmail);
        break;
      case 'forward':
        if (selectedEmail) handleForward(selectedEmail);
        break;
    }
  }, [isComposeOpen, emails, selectedEmail, handleArchive, handleDelete, handleReply, handleReplyAll, handleForward, fetchEmails]);

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f8fc' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #E8E5E0', borderTopColor: '#F2782E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (view) {
      case 'calendar': return <div className="non-mail-view"><CalendarView /></div>;
      case 'contacts': return <div className="non-mail-view"><ContactsView /></div>;
      case 'chat': return <div className="non-mail-view" style={{ overflow: 'hidden', padding: 0 }}><ChatView /></div>;
      case 'files': return <div className="non-mail-view"><FilesView /></div>;
      case 'outbox': return <div className="non-mail-view"><OutboxView /></div>;
      default:
        return (
          <>
            <Sidebar
              currentFolderId={currentFolder?.id || null}
              setCurrentFolder={(f) => { setCurrentFolder(f); setShowStarred(false); setSelectedEmail(null); setShowMobileSidebar(false); }}
              onCompose={() => { setComposeReplyTo(null); setComposeForwardFrom(null); setIsComposeOpen(true); setShowMobileSidebar(false); }}
              onShowStarred={() => { setShowStarred(true); setSelectedEmail(null); setCurrentFolder(null); setShowMobileSidebar(false); }}
              showStarred={showStarred}
              mobileOpen={showMobileSidebar}
              onCloseMobile={() => setShowMobileSidebar(false)}
            />
            {listLoading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 28, height: 28, border: '3px solid #E8E5E0', borderTopColor: '#F2782E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <>
                <EmailList
                  emails={emails}
                  onSelectEmail={handleSelectEmail}
                  onRefresh={fetchEmails}
                  selectedEmailId={selectedEmail?.id}
                  folderName={showStarred ? 'Starred' : currentFolder?.name || 'Inbox'}
                  mobileHidden={!!selectedEmail}
                  onOpenMobileSidebar={() => setShowMobileSidebar(true)}
                />
                <EmailView
                  email={selectedEmail}
                  onReply={handleReply}
                  onReplyAll={handleReplyAll}
                  onForward={handleForward}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onSnooze={handleSnooze}
                  onBack={() => setSelectedEmail(null)}
                  onSelectEmail={(em) => setSelectedEmail(em)}
                  mobileVisible={!!selectedEmail}
                />
              </>
            )}
          </>
        );
    }
  };

  const mobileNavItems: { type: ViewType; icon: React.ElementType; label: string }[] = [
    { type: 'mail', icon: Mail, label: 'Mail' },
    { type: 'calendar', icon: CalendarDays, label: 'Calendar' },
    { type: 'contacts', icon: Users, label: 'Contacts' },
    { type: 'chat', icon: MessageCircle, label: 'Chat' },
    { type: 'files', icon: File, label: 'Files' },
    { type: 'outbox', icon: Send, label: 'Outbox' },
  ];

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header
        onSearch={setSearchQuery}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAdmin={() => setShowAdmin(true)}
      />
      <KeyboardShortcuts onShortcut={handleShortcut} />
      <div className="workspace">
        <Rail current={view} onChange={setView} />
        {renderView()}
      </div>
      <nav className="mobile-nav">
        {mobileNavItems.map(item => (
          <button
            key={item.type}
            className={view === item.type ? 'active' : ''}
            onClick={() => { setView(item.type); setSelectedEmail(null); }}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>

      {isComposeOpen && (
        <ComposeModal
          onClose={handleComposeClose}
          replyTo={composeReplyTo}
          replyAll={composeReplyAll}
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
      <ToastProvider>
        <AccountProvider>
          <MailApp />
        </AccountProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
