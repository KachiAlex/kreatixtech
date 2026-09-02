import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Send, Inbox, Trash2, Search, RefreshCw, X,
  ArrowLeft, CheckCircle, AlertCircle, Clock, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';

export default function EmailFlowPanel({ apiCall }) {
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [compose, setCompose] = useState({ to: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (folder !== 'all') params.set('folder', folder);
      if (search) params.set('search', search);
      const r = await apiCall(`/api/emails?${params.toString()}`);
      if (r.ok) {
        const data = await r.json();
        setEmails(data.emails || []);
      } else {
        setError('Failed to load emails');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [apiCall, folder, search]);

  const fetchStats = useCallback(async () => {
    try {
      const r = await apiCall('/api/emails/stats');
      if (r.ok) setStats(await r.json());
    } catch (e) {}
  }, [apiCall]);

  useEffect(() => {
    fetchEmails();
    fetchStats();
  }, [fetchEmails, fetchStats]);

  const handleSelectEmail = async (email) => {
    try {
      const r = await apiCall(`/api/emails/${email.id}`);
      if (r.ok) {
        const data = await r.json();
        setSelectedEmail(data);
        fetchEmails();
        fetchStats();
      }
    } catch (e) {
      setSelectedEmail(email);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this email?')) return;
    try {
      const r = await apiCall(`/api/emails/${id}`, { method: 'DELETE' });
      if (r.ok) {
        if (selectedEmail?.id === id) setSelectedEmail(null);
        fetchEmails();
        fetchStats();
      }
    } catch (e) {
      setError('Failed to delete email');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!compose.to || !compose.subject || !compose.body) return;
    setSending(true);
    setError(null);
    try {
      const r = await apiCall('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compose),
      });
      if (r.ok) {
        setSuccess('Email sent successfully');
        setShowCompose(false);
        setCompose({ to: '', subject: '', body: '' });
        fetchEmails();
        fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await r.json().catch(() => ({}));
        setError(data.error || 'Failed to send email');
      }
    } catch (e) {
      setError('Network error sending email');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  };

  const FOLDERS = [
    { key: 'all', label: 'All Mail', icon: Mail },
    { key: 'inbox', label: 'Inbox', icon: Inbox },
    { key: 'sent', label: 'Sent', icon: Send },
  ];

  if (selectedEmail) {
    return (
      <div className="bg-white rounded-xl border border-[#E8E5E0] overflow-hidden">
        <div className="p-5 border-b border-[#E8E5E0] flex items-center justify-between">
          <button
            onClick={() => setSelectedEmail(null)}
            className="flex items-center gap-2 text-sm font-bold text-[#6B6F76] hover:text-[#0E0E0F] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {folder === 'all' ? 'mail' : folder}
          </button>
          <button
            onClick={() => handleDelete(selectedEmail.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#0E0E0F] mb-4">{selectedEmail.subject}</h2>
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#E8E5E0]">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${selectedEmail.direction === 'OUTBOUND' ? 'bg-blue-50' : 'bg-orange-50'}`}>
              {selectedEmail.direction === 'OUTBOUND' ? <ArrowUpRight className="h-4 w-4 text-blue-600" /> : <ArrowDownLeft className="h-4 w-4 text-[#F2782E]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#0E0E0F]">{selectedEmail.fromName || selectedEmail.fromAddress}</span>
                <span className="text-xs text-[#6B6F76]">&lt;{selectedEmail.fromAddress}&gt;</span>
              </div>
              <div className="text-xs text-[#6B6F76]">to: {selectedEmail.toAddress}</div>
            </div>
            <span className="text-xs text-[#6B6F76] flex-shrink-0">{formatDate(selectedEmail.createdAt)}</span>
          </div>
          {selectedEmail.html ? (
            <div className="prose prose-sm max-w-none text-[#0E0E0F]" dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
          ) : (
            <div className="text-sm text-[#0E0E0F] whitespace-pre-wrap">{selectedEmail.text}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span className="font-medium">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 font-bold"><X className="h-4 w-4" /></button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: Mail, bg: 'bg-blue-50', ic: 'text-blue-600' },
            { label: 'Inbox', value: stats.inbox, icon: Inbox, bg: 'bg-orange-50', ic: 'text-[#F2782E]' },
            { label: 'Sent', value: stats.sent, icon: Send, bg: 'bg-purple-50', ic: 'text-purple-600' },
            { label: 'Unread', value: stats.unread, icon: Clock, bg: 'bg-yellow-50', ic: 'text-yellow-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E8E5E0] p-4">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
                <s.icon className={`h-4 w-4 ${s.ic}`} />
              </div>
              <p className="text-xl font-bold text-[#0E0E0F]">{s.value ?? 0}</p>
              <p className="text-xs text-[#6B6F76]">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E8E5E0] overflow-hidden">
        <div className="p-5 border-b border-[#E8E5E0] flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            {FOLDERS.map(f => (
              <button
                key={f.key}
                onClick={() => { setFolder(f.key); setSelectedEmail(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  folder === f.key ? 'bg-[#FDF1E8] text-[#F2782E]' : 'text-[#6B6F76] hover:bg-[#F7F5F2]'
                }`}
              >
                <f.icon className="h-3.5 w-3.5" />
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6F76]" />
              <input
                type="text" placeholder="Search emails..." value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchEmails()}
                className="pl-9 pr-4 py-2 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent w-full sm:w-48"
              />
            </div>
            <button onClick={() => { fetchEmails(); fetchStats(); }} className="p-2 border border-[#E8E5E0] rounded-xl text-[#6B6F76] hover:text-[#0E0E0F] hover:border-[#0E0E0F] transition-colors" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#F2782E] text-white rounded-xl text-sm font-bold hover:bg-[#D9601A] transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              Compose
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#F2782E] border-t-transparent" />
          </div>
        ) : emails.length === 0 ? (
          <div className="py-16 text-center">
            <Mail className="h-10 w-10 text-[#6B6F76] mx-auto mb-3" />
            <p className="text-[#6B6F76]">{search ? 'No emails match your search' : 'No emails in this folder'}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E5E0]">
            {emails.map(email => (
              <div
                key={email.id}
                onClick={() => handleSelectEmail(email)}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FDF1E8] cursor-pointer transition-colors group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${email.direction === 'OUTBOUND' ? 'bg-blue-50' : 'bg-orange-50'}`}>
                  {email.direction === 'OUTBOUND' ? <ArrowUpRight className="h-3.5 w-3.5 text-blue-600" /> : <ArrowDownLeft className="h-3.5 w-3.5 text-[#F2782E]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!email.isRead && email.folder === 'inbox' && (
                      <span className="w-2 h-2 rounded-full bg-[#F2782E] flex-shrink-0" />
                    )}
                    <span className={`text-sm truncate ${!email.isRead && email.folder === 'inbox' ? 'font-bold text-[#0E0E0F]' : 'font-medium text-[#6B6F76]'}`}>
                      {email.direction === 'OUTBOUND' ? `To: ${email.toAddress}` : email.fromName || email.fromAddress}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${!email.isRead && email.folder === 'inbox' ? 'font-semibold text-[#0E0E0F]' : 'text-[#6B6F76]'}`}>
                    {email.subject}
                  </p>
                </div>
                <span className="text-xs text-[#6B6F76] flex-shrink-0 hidden sm:block">{formatDate(email.createdAt)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(email.id); }}
                  className="p-1.5 text-[#6B6F76] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCompose && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowCompose(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[#E8E5E0] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0E0E0F] flex items-center gap-2">
                <Send className="h-5 w-5 text-[#F2782E]" />
                Compose Email
              </h2>
              <button onClick={() => setShowCompose(false)} className="p-1.5 text-[#6B6F76] hover:text-[#0E0E0F] rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSend} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6B6F76] uppercase tracking-widest mb-1.5">To</label>
                <input
                  type="email" required value={compose.to}
                  onChange={e => setCompose({ ...compose, to: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6B6F76] uppercase tracking-widest mb-1.5">Subject</label>
                <input
                  type="text" required value={compose.subject}
                  onChange={e => setCompose({ ...compose, subject: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6B6F76] uppercase tracking-widest mb-1.5">Message</label>
                <textarea
                  required rows={8} value={compose.body}
                  onChange={e => setCompose({ ...compose, body: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent resize-y"
                  placeholder="Write your message..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCompose(false)} className="px-4 py-2.5 text-sm font-bold text-[#6B6F76] hover:text-[#0E0E0F] transition-colors">
                  Cancel
                </button>
                <button
                  type="submit" disabled={sending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#F2782E] text-white rounded-xl text-sm font-bold hover:bg-[#D9601A] transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send Email</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
