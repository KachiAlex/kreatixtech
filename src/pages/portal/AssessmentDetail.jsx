import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Send, Paperclip, FileText, Download,
  Clock, User, Building2, Shield, CheckCircle,
  AlertCircle, X, Loader2, ExternalLink,
  Wifi, WifiOff, Lock, AlertTriangle, Info,
  ChevronDown, ChevronUp, Plus, Eye
} from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';

const API_URL = import.meta.env.VITE_API_URL || '';

const STATUS_COLORS = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  IN_REVIEW:  'bg-blue-100 text-blue-800',
  APPROVED:   'bg-emerald-100 text-emerald-800',
  IN_PROGRESS:'bg-purple-100 text-purple-800',
  REPORTING:  'bg-orange-100 text-orange-800',
  COMPLETE:   'bg-green-100 text-green-800',
  ON_HOLD:    'bg-gray-100 text-gray-800',
};
const STATUS_LABELS = {
  PENDING:'Pending Review', IN_REVIEW:'In Review', APPROVED:'Scope Approved',
  IN_PROGRESS:'Testing In Progress', REPORTING:'Report Generation',
  COMPLETE:'Complete', ON_HOLD:'On Hold',
};
const SEV_CONFIG = {
  CRITICAL:{ bar:'bg-red-600',  badge:'bg-red-50 text-red-700 border-red-200',   icon: AlertTriangle },
  HIGH:    { bar:'bg-orange-500',badge:'bg-orange-50 text-orange-700 border-orange-200', icon: AlertTriangle },
  MEDIUM:  { bar:'bg-yellow-500',badge:'bg-yellow-50 text-yellow-700 border-yellow-200',icon: AlertCircle },
  LOW:     { bar:'bg-blue-400', badge:'bg-blue-50 text-blue-700 border-blue-200',  icon: Info },
  INFO:    { bar:'bg-gray-400', badge:'bg-gray-50 text-gray-600 border-gray-200',  icon: Info },
};
const FINDING_STATUS_COLORS = {
  OPEN:'bg-red-100 text-red-700', IN_PROGRESS:'bg-blue-100 text-blue-700',
  RESOLVED:'bg-green-100 text-green-700', ACCEPTED_RISK:'bg-gray-100 text-gray-700',
  FALSE_POSITIVE:'bg-gray-100 text-gray-500',
};

// ── Finding form (admin only) ────────────────────────────────────────────────
const EMPTY_FINDING = {
  title:'', description:'', severity:'HIGH', cvssScore:'',
  category:'', affectedUrl:'', remediation:'', evidence:''
};

function FindingForm({ assessmentId, onCreated, onClose }) {
  const [form, setForm] = useState(EMPTY_FINDING);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const { apiCall } = usePortal();

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const r = await apiCall('/api/findings', {
        method: 'POST',
        body: JSON.stringify({ ...form, assessmentId, cvssScore: form.cvssScore || undefined }),
      });
      if (r.ok) { onCreated(); onClose(); }
      else { const d = await r.json(); setErr(d.error || 'Failed'); }
    } catch { setErr('Network error'); }
    finally { setSaving(false); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E8E5E0]">
          <h3 className="text-lg font-bold text-[#0E0E0F]">Add Finding</h3>
          <button onClick={onClose} className="p-2 text-[#6B6F76] hover:text-[#0E0E0F]"><X className="h-5 w-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{err}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-[#0E0E0F] mb-1">Title *</label>
              <input required value={form.title} onChange={e=>f('title',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="e.g. SQL Injection in login endpoint"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0E0E0F] mb-1">Severity *</label>
              <select required value={form.severity} onChange={e=>f('severity',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#F2782E] focus:border-transparent">
                {['CRITICAL','HIGH','MEDIUM','LOW','INFO'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0E0E0F] mb-1">CVSS Score</label>
              <input type="number" min="0" max="10" step="0.1" value={form.cvssScore} onChange={e=>f('cvssScore',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="0.0 – 10.0"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0E0E0F] mb-1">Category *</label>
              <input required value={form.category} onChange={e=>f('category',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="e.g. Injection, OWASP A01"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0E0E0F] mb-1">Affected URL</label>
              <input value={form.affectedUrl} onChange={e=>f('affectedUrl',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="https://…"/>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-[#0E0E0F] mb-1">Description *</label>
              <textarea required rows={3} value={form.description} onChange={e=>f('description',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="Describe the vulnerability…"/>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-[#0E0E0F] mb-1">Remediation *</label>
              <textarea required rows={3} value={form.remediation} onChange={e=>f('remediation',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="Steps to fix…"/>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-[#0E0E0F] mb-1">Evidence</label>
              <textarea rows={2} value={form.evidence} onChange={e=>f('evidence',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm resize-none font-mono focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="PoC, screenshot URL, payload…"/>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#6B6F76] hover:text-[#0E0E0F]">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#F2782E] text-white text-sm font-bold rounded-xl hover:bg-[#D9601A] disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : 'Add Finding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Report upload panel (admin) ──────────────────────────────────────────────
function ReportPanel({ assessmentId, current, onUpdated, onClose }) {
  const [url, setUrl] = useState(current?.reportPdfUrl || '');
  const [summary, setSummary] = useState(current?.reportSummary || '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const { apiCall } = usePortal();

  const handleSave = async e => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const r = await apiCall(`/api/assessments/${assessmentId}/report`, {
        method: 'PUT',
        body: JSON.stringify({ reportPdfUrl: url || undefined, reportSummary: summary || undefined }),
      });
      if (r.ok) { onUpdated(); onClose(); }
      else { const d = await r.json(); setErr(d.error || 'Failed'); }
    } catch { setErr('Network error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-[#E8E5E0]">
          <h3 className="text-lg font-bold text-[#0E0E0F]">Deliver Report</h3>
          <button onClick={onClose} className="p-2 text-[#6B6F76] hover:text-[#0E0E0F]"><X className="h-5 w-5"/></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{err}</div>}
          <div>
            <label className="block text-sm font-semibold text-[#0E0E0F] mb-1">Report PDF URL</label>
            <input value={url} onChange={e=>setUrl(e.target.value)} type="url" className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="https://drive.google.com/…"/>
            <p className="text-xs text-[#6B6F76] mt-1">Link to the PDF report (Google Drive, S3, etc.)</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0E0E0F] mb-1">Executive Summary</label>
            <textarea rows={5} value={summary} onChange={e=>setSummary(e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="High-level summary for the client…"/>
          </div>
          <p className="text-xs text-[#6B6F76]">Saving will set the status to <strong>Reporting</strong> and notify the client.</p>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#6B6F76] hover:text-[#0E0E0F]">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#F2782E] text-white text-sm font-bold rounded-xl hover:bg-[#D9601A] disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : 'Save & Notify Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AssessmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiCall, socket, user, isAdmin } = usePortal();

  const [assessment, setAssessment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [findings, setFindings] = useState([]);
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'findings'
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connStatus, setConnStatus] = useState('connecting');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [showReportPanel, setShowReportPanel] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchAssessment = useCallback(async () => {
    try {
      const r = await apiCall(`/api/assessments/${id}`);
      if (r.ok) {
        const data = await r.json();
        setAssessment(data);
        setMessages(data.messages || []);
      } else navigate(isAdmin ? '/portal/admin' : '/portal/dashboard');
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [apiCall, id, navigate, isAdmin]);

  const fetchFindings = useCallback(async () => {
    try {
      const r = await apiCall(`/api/findings/assessment/${id}`);
      if (r.ok) setFindings(await r.json());
    } catch (e) { console.error(e); }
  }, [apiCall, id]);

  useEffect(() => { fetchAssessment(); fetchFindings(); }, [fetchAssessment, fetchFindings]);

  // ── Socket ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join-assessment', id);
    setConnStatus('connected');

    const handlers = {
      'new-message':       msg  => setMessages(p => [...p, msg]),
      'assessment-updated':data => setAssessment(p => ({ ...p, ...data })),
      'files-uploaded':    ()   => fetchAssessment(),
      'user-typing':       data => {
        setTypingUsers(p => [...p.filter(u => u.userId !== data.userId), { ...data }]);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() =>
          setTypingUsers(p => p.filter(u => u.userId !== data.userId)), 3000);
      },
      'user-stop-typing':  data => setTypingUsers(p => p.filter(u => u.userId !== data.userId)),
      'connect':           ()   => setConnStatus('connected'),
      'disconnect':        ()   => setConnStatus('disconnected'),
    };
    Object.entries(handlers).forEach(([ev, fn]) => socket.on(ev, fn));
    return () => {
      socket.emit('leave-assessment', id);
      Object.keys(handlers).forEach(ev => socket.off(ev));
      clearTimeout(typingTimerRef.current);
    };
  }, [socket, id, fetchAssessment]);

  // Polling fallback
  useEffect(() => {
    if (socket || !id) return;
    setConnStatus('polling');
    const t = setInterval(fetchAssessment, 10000);
    return () => clearInterval(t);
  }, [socket, id, fetchAssessment]);

  useEffect(() => {
    if (activeTab === 'messages') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleSend = async e => {
    e.preventDefault();
    if (!newMessage.trim() && pendingAttachments.length === 0) return;
    setIsSending(true);
    try {
      const r = await apiCall('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          assessmentId: id,
          message: newMessage.trim() || `Sent ${pendingAttachments.length} file(s)`,
          messageType: isInternal ? 'INTERNAL_NOTE' : 'TEXT',
          attachmentIds: pendingAttachments.map(a => a.id),
        }),
      });
      if (r.ok) {
        const msg = await r.json();
        setMessages(p => [...p, msg]);
        setNewMessage(''); setPendingAttachments([]); setIsInternal(false);
      }
    } catch (e) { console.error(e); }
    finally { setIsSending(false); }
  };

  const handleTyping = () => {
    if (!socket) return;
    socket.emit('typing', { assessmentId: id, name: user.name });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() =>
      socket.emit('stop-typing', { assessmentId: id }), 2000);
  };

  const handleFileUpload = async e => {
    const files = e.target.files;
    if (!files.length) return;
    setIsUploading(true);
    const fd = new FormData();
    for (const f of files) fd.append('files', f);
    try {
      const r = await fetch(`${API_URL}/api/uploads/assessment/${id}?skipMessage=true`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('portalToken')}` },
        body: fd,
      });
      if (r.ok) {
        const data = await r.json();
        setPendingAttachments(p => [...p, ...data.attachments]);
      }
    } catch (e) { console.error(e); }
    finally { setIsUploading(false); e.target.value = ''; }
  };

  const handleStatusChange = async status => {
    setShowStatusMenu(false);
    try {
      const r = await apiCall(`/api/assessments/${id}`, {
        method: 'PUT', body: JSON.stringify({ status }),
      });
      if (r.ok) setAssessment(p => ({ ...p, status }));
    } catch (e) { console.error(e); }
  };

  const updateFindingStatus = async (fid, status) => {
    try {
      const r = await apiCall(`/api/findings/${fid}`, {
        method: 'PUT', body: JSON.stringify({ status }),
      });
      if (r.ok) fetchFindings();
    } catch (e) { console.error(e); }
  };

  if (isLoading || !assessment) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F2782E] border-t-transparent" />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const connIcon = connStatus === 'connected'
    ? <Wifi className="h-3.5 w-3.5 text-green-500" />
    : connStatus === 'polling'
    ? <Wifi className="h-3.5 w-3.5 text-yellow-500" />
    : <WifiOff className="h-3.5 w-3.5 text-red-500" />;

  const sev = findings.reduce((a, f) => ({ ...a, [f.severity]: (a[f.severity] || 0) + 1 }), {});

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* Modals */}
      {showFindingForm && (
        <FindingForm assessmentId={id} onCreated={fetchFindings} onClose={() => setShowFindingForm(false)} />
      )}
      {showReportPanel && (
        <ReportPanel assessmentId={id} current={assessment} onUpdated={fetchAssessment} onClose={() => setShowReportPanel(false)} />
      )}

      {/* ── Header ── */}
      <div className="bg-white border-b border-[#E8E5E0] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => navigate(isAdmin ? '/portal/admin' : '/portal/dashboard')}
                className="p-2 text-[#6B6F76] hover:text-[#0E0E0F] flex-shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-[#0E0E0F] truncate">{assessment.title}</h1>
                <div className="flex items-center gap-2 text-xs text-[#6B6F76]">
                  <Building2 className="h-3 w-3" />
                  <span>{assessment.organization?.name}</span>
                  <span className="flex items-center gap-1">{connIcon}
                    <span className="hidden sm:inline">{connStatus}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[assessment.status]}`}>
                {STATUS_LABELS[assessment.status]}
              </span>
              {isAdmin && (
                <>
                  <div className="relative">
                    <button onClick={() => setShowStatusMenu(v => !v)}
                      className="px-3 py-1.5 text-xs font-semibold border border-[#E8E5E0] rounded-xl hover:border-[#0E0E0F] text-[#6B6F76] hover:text-[#0E0E0F] transition-colors">
                      Change status ▾
                    </button>
                    {showStatusMenu && (
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E8E5E0] rounded-xl shadow-lg z-20 py-1">
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                          <button key={v} onClick={() => handleStatusChange(v)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F7F5F2] ${assessment.status === v ? 'font-bold text-[#F2782E]' : 'text-[#0E0E0F]'}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowReportPanel(true)}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#0E0E0F] text-white rounded-xl hover:bg-[#F2782E] transition-colors">
                    Deliver Report
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: tabs + content ── */}
          <div className="lg:col-span-2 flex flex-col gap-0">
            {/* Tab bar */}
            <div className="flex border-b border-[#E8E5E0] bg-white rounded-t-xl px-4">
              <button onClick={() => setActiveTab('messages')}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'messages' ? 'border-[#F2782E] text-[#F2782E]' : 'border-transparent text-[#6B6F76] hover:text-[#0E0E0F]'}`}>
                Messages
              </button>
              <button onClick={() => setActiveTab('findings')}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'findings' ? 'border-[#F2782E] text-[#F2782E]' : 'border-transparent text-[#6B6F76] hover:text-[#0E0E0F]'}`}>
                Findings
                {findings.length > 0 && (
                  <span className="text-xs bg-[#F2782E] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {findings.length}
                  </span>
                )}
              </button>
            </div>

            {/* Messages tab */}
            {activeTab === 'messages' && (
              <div className="bg-white border border-[#E8E5E0] border-t-0 rounded-b-xl flex flex-col" style={{ height: 'calc(100vh - 260px)' }}>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#6B6F76]">
                      <Shield className="h-10 w-10 mb-3 opacity-30" />
                      <p className="text-sm">No messages yet. Start the conversation.</p>
                    </div>
                  ) : messages.map(msg => {
                    const isOwn = msg.senderId === user.id;
                    const isNote = msg.messageType === 'INTERNAL_NOTE';
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isNote ? 'bg-amber-50 border border-amber-200 text-amber-900'
                          : isOwn ? 'bg-[#F2782E] text-white'
                          : 'bg-[#F7F5F2] text-[#0E0E0F]'}`}>
                          <div className="flex items-center gap-2 mb-1 text-[11px] opacity-70">
                            <span className="font-semibold">{msg.sender?.name}</span>
                            {isNote && <span className="uppercase tracking-wide font-bold">· Internal Note</span>}
                            <span>· {new Date(msg.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
                          </div>
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                          {msg.attachments?.length > 0 && (
                            <div className="mt-1.5 space-y-1">
                              {msg.attachments.map(att => (
                                <a key={att.id} href={`${API_URL}${att.fileUrl}`} target="_blank" rel="noopener noreferrer"
                                  className={`flex items-center gap-1 text-xs underline ${isOwn && !isNote ? 'text-white/80' : 'text-[#F2782E]'}`}>
                                  <FileText className="h-3 w-3" />{att.fileName}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-[#F7F5F2] rounded-2xl px-4 py-2 text-xs text-[#6B6F76]">
                        {typingUsers.map(u => u.name).join(', ')} typing…
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Compose */}
                <div className="p-3 border-t border-[#E8E5E0]">
                  {pendingAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {pendingAttachments.map(att => (
                        <div key={att.id} className="flex items-center gap-1.5 bg-[#F7F5F2] border border-[#E8E5E0] rounded-lg px-2 py-1 text-xs">
                          <FileText className="h-3 w-3 text-[#F2782E]" />
                          <span className="max-w-[100px] truncate">{att.fileName}</span>
                          <button onClick={() => setPendingAttachments(p => p.filter(a => a.id !== att.id))}>
                            <X className="h-3 w-3 text-[#6B6F76] hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {isAdmin && (
                    <div className="flex items-center gap-2 mb-2">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)}
                          className="accent-amber-500 w-3.5 h-3.5" />
                        <span className="text-xs font-medium text-amber-700">Internal note (hidden from client)</span>
                      </label>
                    </div>
                  )}
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                      className="p-2.5 text-[#6B6F76] hover:text-[#F2782E] border border-[#E8E5E0] rounded-xl disabled:opacity-50 flex-shrink-0 transition-colors">
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                    </button>
                    <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={handleTyping}
                      placeholder={isInternal ? 'Internal note…' : 'Type a message…'}
                      className={`flex-1 px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent ${isInternal ? 'border-amber-300 bg-amber-50' : 'border-[#E8E5E0]'}`} />
                    <button type="submit" disabled={isSending || (!newMessage.trim() && pendingAttachments.length === 0)}
                      className="p-2.5 bg-[#F2782E] text-white rounded-xl hover:bg-[#D9601A] disabled:opacity-50 flex-shrink-0 transition-colors">
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Findings tab */}
            {activeTab === 'findings' && (
              <div className="bg-white border border-[#E8E5E0] border-t-0 rounded-b-xl">
                {/* Severity summary bar */}
                {findings.length > 0 && (
                  <div className="flex gap-2 flex-wrap p-4 border-b border-[#E8E5E0]">
                    {['CRITICAL','HIGH','MEDIUM','LOW','INFO'].map(s => sev[s] ? (
                      <span key={s} className={`text-xs font-bold px-2.5 py-1 rounded-full border ${SEV_CONFIG[s].badge}`}>
                        {s}: {sev[s]}
                      </span>
                    ) : null)}
                    {isAdmin && (
                      <button onClick={() => setShowFindingForm(true)}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#F2782E] text-white rounded-full hover:bg-[#D9601A] transition-colors">
                        <Plus className="h-3 w-3" /> Add Finding
                      </button>
                    )}
                  </div>
                )}
                {findings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-[#6B6F76]">
                    <CheckCircle className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">No findings yet.</p>
                    {isAdmin && (
                      <button onClick={() => setShowFindingForm(true)}
                        className="mt-4 flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-[#F2782E] text-white rounded-xl hover:bg-[#D9601A] transition-colors">
                        <Plus className="h-4 w-4" /> Add first finding
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-[#E8E5E0]">
                    {findings.map(f => {
                      const cfg = SEV_CONFIG[f.severity];
                      const open = expandedFindings[f.id];
                      return (
                        <div key={f.id}>
                          <button onClick={() => setExpandedFindings(p => ({ ...p, [f.id]: !p[f.id] }))}
                            className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#F7F5F2] transition-colors">
                            <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${cfg.bar}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${cfg.badge}`}>{f.severity}</span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${FINDING_STATUS_COLORS[f.status]}`}>
                                  {f.status.replace(/_/g,' ')}
                                </span>
                                <span className="text-xs text-[#6B6F76]">{f.category}</span>
                                {f.cvssScore && <span className="text-xs font-mono font-bold text-[#0E0E0F]">{f.cvssScore}</span>}
                              </div>
                              <p className="text-sm font-semibold text-[#0E0E0F] truncate">{f.title}</p>
                              {f.affectedUrl && <p className="text-xs text-[#6B6F76] flex items-center gap-1 mt-0.5"><ExternalLink className="h-3 w-3"/>{f.affectedUrl}</p>}
                            </div>
                            {open ? <ChevronUp className="h-4 w-4 text-[#6B6F76] flex-shrink-0"/> : <ChevronDown className="h-4 w-4 text-[#6B6F76] flex-shrink-0"/>}
                          </button>
                          {open && (
                            <div className="px-5 pb-5 border-t border-[#E8E5E0]">
                              <div className="grid md:grid-cols-2 gap-5 mt-4">
                                <div>
                                  <h4 className="text-xs font-bold uppercase text-[#6B6F76] mb-2">Description</h4>
                                  <p className="text-sm text-[#0E0E0F] leading-relaxed whitespace-pre-wrap">{f.description}</p>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold uppercase text-[#6B6F76] mb-2 flex items-center gap-1"><Lock className="h-3 w-3"/>Remediation</h4>
                                  <p className="text-sm text-[#0E0E0F] leading-relaxed whitespace-pre-wrap">{f.remediation}</p>
                                </div>
                              </div>
                              {f.evidence && (
                                <div className="mt-4">
                                  <h4 className="text-xs font-bold uppercase text-[#6B6F76] mb-2">Evidence</h4>
                                  <pre className="bg-gray-50 rounded-lg p-3 text-xs font-mono overflow-x-auto">{f.evidence}</pre>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2 mt-4">
                                {isAdmin ? (
                                  <>
                                    {f.status !== 'OPEN' && <button onClick={() => updateFindingStatus(f.id,'OPEN')} className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100">Mark Open</button>}
                                    {f.status !== 'RESOLVED' && <button onClick={() => updateFindingStatus(f.id,'RESOLVED')} className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg border border-green-100 hover:bg-green-100">Mark Resolved</button>}
                                    {f.status !== 'FALSE_POSITIVE' && <button onClick={() => updateFindingStatus(f.id,'FALSE_POSITIVE')} className="px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100">False Positive</button>}
                                  </>
                                ) : (
                                  <>
                                    {f.status === 'OPEN' && <button onClick={() => updateFindingStatus(f.id,'IN_PROGRESS')} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100">Start Remediation</button>}
                                    {f.status === 'IN_PROGRESS' && <button onClick={() => updateFindingStatus(f.id,'RESOLVED')} className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg border border-green-100 hover:bg-green-100">Mark Resolved</button>}
                                    {f.status === 'OPEN' && <button onClick={() => updateFindingStatus(f.id,'ACCEPTED_RISK')} className="px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100">Accept Risk</button>}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4">
            {/* Status + report link */}
            <div className="bg-white rounded-xl border border-[#E8E5E0] p-5">
              <h3 className="text-sm font-bold text-[#0E0E0F] mb-3">Assessment</h3>
              {assessment.reportPdfUrl && (
                <a href={assessment.reportPdfUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full mb-4 p-3 bg-[#F2782E]/5 border border-[#F2782E]/20 rounded-xl text-sm font-semibold text-[#F2782E] hover:bg-[#F2782E]/10 transition-colors">
                  <FileText className="h-4 w-4" /> Download PDF Report
                </a>
              )}
              <Link to={`/portal/report/${id}`}
                className="flex items-center gap-2 w-full mb-4 p-3 bg-[#F7F5F2] border border-[#E8E5E0] rounded-xl text-sm font-semibold text-[#0E0E0F] hover:border-[#F2782E] transition-colors">
                <Eye className="h-4 w-4 text-[#F2782E]" /> View Online Report
              </Link>
              {assessment.reportSummary && (
                <div className="mb-4 p-3 bg-[#F7F5F2] rounded-xl text-sm text-[#6B6F76] leading-relaxed">
                  <p className="text-xs font-bold text-[#0E0E0F] mb-1">Executive Summary</p>
                  <p className="whitespace-pre-wrap">{assessment.reportSummary}</p>
                </div>
              )}
              <div className="space-y-3 text-sm">
                {[
                  ['Status',       STATUS_LABELS[assessment.status]],
                  ['Testing Type', assessment.testingType?.replace(/_/g,' ')],
                  ['Created',      new Date(assessment.createdAt).toLocaleDateString()],
                  ['Assigned To',  assessment.assignedAdmin?.name || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[#6B6F76]">{label}</span>
                    <span className="font-semibold text-[#0E0E0F]">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scope */}
            <div className="bg-white rounded-xl border border-[#E8E5E0] p-5">
              <h3 className="text-sm font-bold text-[#0E0E0F] mb-2">Scope</h3>
              <p className="text-sm text-[#6B6F76] whitespace-pre-wrap leading-relaxed">{assessment.scopeDescription}</p>
            </div>

            {/* Target URLs */}
            {assessment.targetUrls?.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E8E5E0] p-5">
                <h3 className="text-sm font-bold text-[#0E0E0F] mb-3">Target URLs</h3>
                <ul className="space-y-1.5">
                  {assessment.targetUrls.map((url, i) => (
                    <li key={i}>
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-[#F2782E] hover:underline">
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />{url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Attachments */}
            {assessment.attachments?.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E8E5E0] p-5">
                <h3 className="text-sm font-bold text-[#0E0E0F] mb-3">Files</h3>
                <ul className="space-y-1.5">
                  {assessment.attachments.map(att => (
                    <li key={att.id}>
                      <a href={`${API_URL}${att.fileUrl}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-[#F2782E] hover:underline">
                        <Download className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{att.fileName}</span>
                        <span className="text-[#6B6F76] flex-shrink-0 text-xs">({(att.fileSize/1024).toFixed(1)}KB)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Special requirements */}
            {assessment.specialReqs && (
              <div className="bg-white rounded-xl border border-[#E8E5E0] p-5">
                <h3 className="text-sm font-bold text-[#0E0E0F] mb-2">Special Requirements</h3>
                <p className="text-sm text-[#6B6F76] whitespace-pre-wrap">{assessment.specialReqs}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
