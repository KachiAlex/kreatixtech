import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailView from './components/EmailView';
import ComposeModal from './components/ComposeModal';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';

const API_URL = '/api'; // Relative to the domain it's hosted on

interface User {
  id: number;
  email: string;
  display_name: string;
  is_active: boolean;
}

interface Email {
  id: number;
  from_address: string;
  from_name: string;
  to_address: string;
  subject: string;
  text: string;
  html?: string;
  received_at: string;
  is_read: boolean;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kreatix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchEmails();
    }
  }, [currentFolder, currentUser]);

  const fetchEmails = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/emails?folder=${currentFolder}&user=${currentUser.email}`);
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('kreatix_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kreatix_user');
    setIsAdmin(false);
  };

  const handleSelectEmail = async (email: Email) => {
    setSelectedEmail(email);
    // Refresh list to show as read
    if (!email.is_read) {
        await fetch(`${API_URL}/emails/${email.id}`);
        fetchEmails();
    }
  };

  const handleDeleteEmail = async (id: number) => {
    try {
      await fetch(`${API_URL}/emails/${id}`, { method: 'DELETE' });
      if (selectedEmail?.id === id) {
        setSelectedEmail(null);
      }
      fetchEmails();
    } catch (error) {
      console.error('Failed to delete email:', error);
    }
  };

  const handleSendEmail = async (to: string, subject: string, body: string) => {
    if (!currentUser) return;
    const response = await fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        to, 
        subject, 
        body,
        from: currentUser.email,
        fromName: currentUser.display_name
      }),
    });
    if (!response.ok) throw new Error('Failed to send');
    if (currentFolder === 'sent') fetchEmails();
  };

  const handleSearch = async (query: string) => {
    if (!currentUser) return;
    if (!query) {
      fetchEmails();
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/emails?folder=${currentFolder}&user=${currentUser.email}&search=${query}`);
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      console.error('Failed to search emails:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Login onLogin={handleLogin} />
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gmail-bg">
      <Header user={currentUser} onLogout={handleLogout} onSearch={handleSearch} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          currentFolder={currentFolder} 
          setCurrentFolder={(folder) => {
            setCurrentFolder(folder);
            setSelectedEmail(null);
          }}
          onCompose={() => setIsComposeOpen(true)}
        />
        <main className="flex-1 flex flex-col min-w-0 py-2">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange"></div>
            </div>
          ) : selectedEmail ? (
            <EmailView 
              email={selectedEmail} 
              onBack={() => setSelectedEmail(null)}
              onDelete={handleDeleteEmail}
            />
          ) : (
            <EmailList 
              emails={emails} 
              onSelectEmail={handleSelectEmail}
              onDeleteEmail={handleDeleteEmail}
            />
          )}
        </main>
      </div>

      {isComposeOpen && (
        <ComposeModal 
          onClose={() => setIsComposeOpen(false)} 
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
}

export default App;
