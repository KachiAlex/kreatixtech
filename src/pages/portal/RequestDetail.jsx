import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Send, Paperclip, FileText, Download, X, Loader2,
  Wifi, WifiOff, Shield, Code2, Cloud, MessageSquare, Plus,
  CheckCircle, Clock, ChevronDown, ChevronUp, Lock, ExternalLink,
  AlertTriangle, AlertCircle, Info, Eye, Star
} from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';
import Logo from '../../components/Logo';

const API_URL = import.meta.env.VITE_API_URL || 'https://kreatixtech.fly.dev';

function FeedbackPanel({ request, onUpdated }) {
  const { apiCall } = usePortal();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  if (request.feedbackAt) {
    return (
      <div className="bg-white rounded-xl border border-[#E8E5E0] p-5">
        <h3 className="text-sm font-bold text-[#0E0E0F] mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> Your Feedback
        </h3>
        <div className="flex gap-0.5 mb-2">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={`h-5 w-5 ${s <= request.clientRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
          ))}
        </div>
        <p className="text-sm text-[#6B6F76] whitespace-pre-wrap">{request.clientFeedback}</p>
        <p className="text-xs text-[#6B6F76] mt-2">Submitted {new Date(request.feedbackAt).toLocaleDateString()}</p>
      </div>
    );
  }

  const handleSubmit = async e => {
    e.preventDefault();
    if (!rating) { setErr('Please select a star rating'); return; }
    setSaving(true); setErr('');
    try {
      const r = await apiCall(`/api/requests/${request.id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ rating, feedback }),
      });
      if (r.ok) { onUpdated(); }
      else { const d = await r.json(); setErr(d.error || d.errors?.[0]?.msg || 'Failed to submit'); }
    } catch { setErr('Network error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-[#F2782E]/30 p-5">
      <h3 className="text-sm font-bold text-[#0E0E0F] mb-1 flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" /> Project Delivered!
      </h3>
      <p className="text-xs text-[#6B6F76] mb-4">How was your experience with this project?</p>
      {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-1">
          {[1,2,3,4,5].map(s => (
            <button key={s} type="button"
              onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
              className="focus:outline-none">
              <Star className={`h-7 w-7 transition-colors ${s <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          placeholder="Share your experience (optional)…"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
        />
        <button type="submit" disabled={saving || !rating}
          className="w-full py-2.5 bg-[#F2782E] text-white text-sm font-bold rounded-xl hover:bg-[#D9601A] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
          {saving ? 'Submitting…' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}

const SERVICE_ICONS = { SOFTWARE_DEV: Code2, CYBERSECURITY: Shield, CLOUD: Cloud, CONSULTING: MessageSquare };
const SERVICE_LABELS = { SOFTWARE_DEV: 'Software Development', CYBERSECURITY: 'Cybersecurity', CLOUD: 'Cloud Services', CONSULTING: 'Consulting' };
const SERVICE_COLORS = { SOFTWARE_DEV: 'bg-blue-100 text-blue-800', CYBERSECURITY: 'bg-orange-100 text-[#F2782E]', CLOUD: 'bg-purple-100 text-purple-800', CONSULTING: 'bg-green-100 text-green-800' };

const STATUS_COLORS = {
  SUBMITTED:'bg-yellow-100 text-yellow-800', REVIEWED:'bg-blue-100 text-blue-800',
  SCOPED:'bg-indigo-100 text-indigo-800', IN_PROGRESS:'bg-purple-100 text-purple-800',
  REVIEW:'bg-orange-100 text-orange-800', DELIVERED:'bg-green-100 text-green-800',
  CLOSED:'bg-gray-100 text-gray-700', ON_HOLD:'bg-gray-100 text-gray-700',
};
const STATUS_LABELS = {
  SUBMITTED:'Submitted', REVIEWED:'Under Review', SCOPED:'Scoped',
  IN_PROGRESS:'In Progress', REVIEW:'Ready for Review', DELIVERED:'Delivered',
  CLOSED:'Closed', ON_HOLD:'On Hold',
};
const SEV_CONFIG = {
  CRITICAL:{ bar:'bg-red-600', badge:'bg-red-50 text-red-700 border-red-200', icon:AlertTriangle },
  HIGH:    { bar:'bg-orange-500', badge:'bg-orange-50 text-orange-700 border-orange-200', icon:AlertTriangle },
  MEDIUM:  { bar:'bg-yellow-500', badge:'bg-yellow-50 text-yellow-700 border-yellow-200', icon:AlertCircle },
  LOW:     { bar:'bg-blue-400', badge:'bg-blue-50 text-blue-700 border-blue-200', icon:Info },
  INFO:    { bar:'bg-gray-400', badge:'bg-gray-50 text-gray-600 border-gray-200', icon:Info },
};

// ── Finding form ──────────────────────────────────────────────────────────────
function FindingForm({ requestId, onCreated, onClose }) {
  const [form, setForm] = useState({ title:'', description:'', severity:'HIGH', cvssScore:'', category:'', affectedUrl:'', remediation:'', evidence:'' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const { apiCall } = usePortal();
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const r = await apiCall(`/api/requests/${requestId}/findings`, { method:'POST', body:JSON.stringify({...form,cvssScore:form.cvssScore||undefined}) });
      if (r.ok) { onCreated(); onClose(); }
      else { const d=await r.json(); setErr(d.error||'Failed'); }
    } catch { setErr('Network error'); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E8E5E0]">
          <h3 className="text-lg font-bold">Add Finding</h3>
          <button onClick={onClose} className="p-2 text-[#6B6F76] hover:text-[#0E0E0F]"><X className="h-5 w-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{err}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-semibold mb-1">Title *</label><input required value={form.title} onChange={e=>f('title',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"/></div>
            <div><label className="block text-sm font-semibold mb-1">Severity *</label><select required value={form.severity} onChange={e=>f('severity',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#F2782E] focus:border-transparent">{['CRITICAL','HIGH','MEDIUM','LOW','INFO'].map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-semibold mb-1">CVSS Score</label><input type="number" min="0" max="10" step="0.1" value={form.cvssScore} onChange={e=>f('cvssScore',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="0.0–10.0"/></div>
            <div><label className="block text-sm font-semibold mb-1">Category *</label><input required value={form.category} onChange={e=>f('category',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="e.g. Injection"/></div>
            <div><label className="block text-sm font-semibold mb-1">Affected URL</label><input value={form.affectedUrl} onChange={e=>f('affectedUrl',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="https://…"/></div>
            <div className="col-span-2"><label className="block text-sm font-semibold mb-1">Description *</label><textarea required rows={3} value={form.description} onChange={e=>f('description',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"/></div>
            <div className="col-span-2"><label className="block text-sm font-semibold mb-1">Remediation *</label><textarea required rows={3} value={form.remediation} onChange={e=>f('remediation',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"/></div>
            <div className="col-span-2"><label className="block text-sm font-semibold mb-1">Evidence</label><textarea rows={2} value={form.evidence} onChange={e=>f('evidence',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm resize-none font-mono focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"/></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#6B6F76]">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#F2782E] text-white text-sm font-bold rounded-xl hover:bg-[#D9601A] disabled:opacity-50">{saving?'Saving…':'Add Finding'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Report panel ──────────────────────────────────────────────────────────────
function ReportPanel({ requestId, current, onUpdated, onClose }) {
  const [url, setUrl] = useState(current?.reportUrl||'');
  const [summary, setSummary] = useState(current?.reportSummary||'');
  const [saving, setSaving] = useState(false);
  const { apiCall } = usePortal();
  const handleSave = async e => {
    e.preventDefault(); setSaving(true);
    const r = await apiCall(`/api/requests/${requestId}/report`, { method:'PUT', body:JSON.stringify({ reportUrl:url||undefined, reportSummary:summary||undefined }) });
    if (r.ok) { onUpdated(); onClose(); }
    setSaving(false);
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-[#E8E5E0]">
          <h3 className="text-lg font-bold">Deliver Report / Deliverable</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-[#6B6F76]"/></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div><label className="block text-sm font-semibold mb-1">Deliverable URL</label><input type="url" value={url} onChange={e=>setUrl(e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="https://…"/></div>
          <div><label className="block text-sm font-semibold mb-1">Summary / notes for client</label><textarea rows={5} value={summary} onChange={e=>setSummary(e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"/></div>
          <p className="text-xs text-[#6B6F76]">Saving sets status to <strong>Ready for Review</strong> and notifies the client.</p>
          <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#6B6F76]">Cancel</button><button type="submit" disabled={saving} className="px-5 py-2 bg-[#F2782E] text-white text-sm font-bold rounded-xl hover:bg-[#D9601A] disabled:opacity-50">{saving?'Saving…':'Save & Notify'}</button></div>
        </form>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiCall, socket, user, isAdmin } = usePortal();

  const [request, setRequest]           = useState(null);
  const [messages, setMessages]         = useState([]);
  const [findings, setFindings]         = useState([]);
  const [milestones, setMilestones]     = useState([]);
  const [activeTab, setActiveTab]       = useState('messages');
  const [newMessage, setNewMessage]     = useState('');
  const [isInternal, setIsInternal]     = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [isSending, setIsSending]       = useState(false);
  const [isUploading, setIsUploading]   = useState(false);
  const [pendingAtts, setPendingAtts]   = useState([]);
  const [typingUsers, setTypingUsers]   = useState([]);
  const [connStatus, setConnStatus]     = useState('connecting');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [showReportPanel, setShowReportPanel] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState({});
  const [expandedMilestone, setExpandedMilestone] = useState(null);
  const [timeline, setTimeline]         = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);
  const typingTimer    = useRef(null);

  const fetchTimeline = useCallback(async () => {
    setTimelineLoading(true);
    try {
      const r = await apiCall(`/api/requests/${id}/timeline`);
      if (r.ok) setTimeline(await r.json());
    } catch (e) { console.error(e); }
    finally { setTimelineLoading(false); }
  }, [apiCall, id]);

  const fetchRequest = useCallback(async () => {
    try {
      const r = await apiCall(`/api/requests/${id}`);
      if (r.ok) {
        const data = await r.json();
        setRequest(data);
        setMessages(data.messages || []);
        setFindings(data.findings || []);
        setMilestones(data.milestones || []);
      } else navigate(isAdmin ? '/portal/admin' : '/portal/dashboard');
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [apiCall, id, navigate, isAdmin]);

  useEffect(() => { fetchRequest(); }, [fetchRequest]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join-request', id);
    setConnStatus('connected');
    const handlers = {
      'new-message':      msg  => setMessages(p => p.some(m => m.id === msg.id) ? p : [...p, msg]),
      'request-updated':  data => setRequest(p => ({ ...p, ...data })),
      'files-uploaded':   ()   => fetchRequest(),
      'user-typing':      data => {
        setTypingUsers(p => [...p.filter(u => u.userId !== data.userId), data]);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTypingUsers(p => p.filter(u => u.userId !== data.userId)), 3000);
      },
      'user-stop-typing': data => setTypingUsers(p => p.filter(u => u.userId !== data.userId)),
      'connect':    () => setConnStatus('connected'),
      'disconnect': () => setConnStatus('disconnected'),
    };
    Object.entries(handlers).forEach(([ev, fn]) => socket.on(ev, fn));
    return () => {
      socket.emit('leave-request', id);
      Object.keys(handlers).forEach(ev => socket.off(ev));
      clearTimeout(typingTimer.current);
    };
  }, [socket, id, fetchRequest]);

  useEffect(() => {
    if (socket || !id) return;
    setConnStatus('polling');
    const t = setInterval(fetchRequest, 10000);
    return () => clearInterval(t);
  }, [socket, id, fetchRequest]);

  useEffect(() => {
    if (activeTab === 'messages') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSend = async e => {
    e.preventDefault();
    if (!newMessage.trim() && pendingAtts.length === 0) return;
    setIsSending(true);
    try {
      const r = await apiCall(`/api/requests/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          message: newMessage.trim() || `Sent ${pendingAtts.length} file(s)`,
          messageType: isInternal ? 'INTERNAL_NOTE' : 'TEXT',
          attachmentIds: pendingAtts.map(a => a.id),
        }),
      });
      if (r.ok) {
        const msg = await r.json();
        setMessages(p => [...p, msg]);
        setNewMessage(''); setPendingAtts([]); setIsInternal(false);
      }
    } catch (e) { console.error(e); }
    finally { setIsSending(false); }
  };

  const handleTyping = () => {
    if (!socket) return;
    socket.emit('typing', { requestId: id, name: user.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('stop-typing', { requestId: id }), 2000);
  };

  const handleFileUpload = async e => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    const fd = new FormData();
    for (const f of e.target.files) fd.append('files', f);
    try {
      const r = await fetch(`${API_URL}/api/service-uploads/request/${id}?skipMessage=true`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('portalToken')}` },
        body: fd,
      });
      if (r.ok) { const d = await r.json(); setPendingAtts(p => [...p, ...d.attachments]); }
    } catch (e) { console.error(e); }
    finally { setIsUploading(false); e.target.value = ''; }
  };

  const handleStatusChange = async status => {
    setShowStatusMenu(false);
    const r = await apiCall(`/api/requests/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    if (r.ok) setRequest(p => ({ ...p, status }));
  };

  const updateFindingStatus = async (fid, status) => {
    const r = await apiCall(`/api/requests/${id}/findings/${fid}`, { method: 'PUT', body: JSON.stringify({ status }) });
    if (r.ok) fetchRequest();
  };

  const updateMilestone = async (mid, data) => {
    const r = await apiCall(`/api/requests/${id}/milestones/${mid}`, { method: 'PUT', body: JSON.stringify(data) });
    if (r.ok) fetchRequest();
  };

  if (isLoading || !request) {
    return <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F2782E] border-t-transparent"/></div>;
  }

  const ServiceIcon = SERVICE_ICONS[request.serviceType] || Shield;
  const sev = findings.reduce((a, f) => ({ ...a, [f.severity]: (a[f.severity]||0)+1 }), {});
  const connIcon = connStatus === 'connected' ? <Wifi className="h-3.5 w-3.5 text-green-500"/> : connStatus === 'polling' ? <Wifi className="h-3.5 w-3.5 text-yellow-500"/> : <WifiOff className="h-3.5 w-3.5 text-red-500"/>;

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {showFindingForm && <FindingForm requestId={id} onCreated={fetchRequest} onClose={()=>setShowFindingForm(false)}/>}
      {showReportPanel && <ReportPanel requestId={id} current={request} onUpdated={fetchRequest} onClose={()=>setShowReportPanel(false)}/>}

      {/* Header */}
      <div className="bg-[#0E0E0F] text-white sticky top-0 z-40 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center gap-3">
            <button onClick={()=>navigate(isAdmin?'/portal/admin':'/portal/dashboard')} className="p-2 text-white/60 hover:text-white flex-shrink-0"><ArrowLeft className="h-4 w-4"/></button>
            <Logo size="sm" linkTo={null} className="text-white flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-white truncate">{request.title}</h1>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <span className="truncate max-w-[120px]">{request.organization?.name}</span>
                <span>·</span><span>{connIcon}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`hidden sm:inline text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[request.status]}`}>{STATUS_LABELS[request.status]}</span>
              {isAdmin && (
                <>
                  <div className="relative">
                    <button onClick={()=>setShowStatusMenu(v=>!v)} className="px-2.5 py-1.5 text-xs font-semibold border border-white/20 rounded-xl hover:border-white/60 text-white/70 transition-colors">Status ▾</button>
                    {showStatusMenu && (
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E8E5E0] rounded-xl shadow-lg z-20 py-1">
                        {Object.entries(STATUS_LABELS).map(([v,l])=>(
                          <button key={v} onClick={()=>handleStatusChange(v)} className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F7F5F2] ${request.status===v?'font-bold text-[#F2782E]':'text-[#0E0E0F]'}`}>{l}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={()=>setShowReportPanel(true)} className="px-2.5 py-1.5 text-xs font-semibold bg-[#F2782E] text-white rounded-xl hover:bg-[#D9601A] transition-colors">Deliver</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: tabs */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex border-b border-[#E8E5E0] bg-white rounded-t-xl px-2 overflow-x-auto scrollbar-none">
              {[['messages','Messages'],['milestones','Milestones'],
                ...(request.serviceType==='CYBERSECURITY'?[['findings','Findings']]:[]),
                ['timeline','Timeline']]
                .map(([k,l])=>(
                  <button key={k} onClick={()=>{ setActiveTab(k); if(k==='timeline') fetchTimeline(); }}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab===k?'border-[#F2782E] text-[#F2782E]':'border-transparent text-[#6B6F76] hover:text-[#0E0E0F]'}`}>
                    {l}
                    {k==='findings'&&findings.length>0&&<span className="text-xs bg-[#F2782E] text-white rounded-full w-5 h-5 flex items-center justify-center">{findings.length}</span>}
                    {k==='milestones'&&milestones.length>0&&<span className="text-xs bg-[#F7F5F2] text-[#6B6F76] rounded-full w-5 h-5 flex items-center justify-center">{milestones.length}</span>}
                  </button>
              ))}
            </div>

            {/* Timeline */}
            {activeTab==='timeline' && (
              <div className="bg-white border border-[#E8E5E0] border-t-0 rounded-b-xl p-5 overflow-y-auto" style={{maxHeight:'calc(100vh - 240px)'}}>
                {timelineLoading ? (
                  <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-4 border-[#F2782E] border-t-transparent"/></div>
                ) : timeline.length === 0 ? (
                  <div className="text-center py-10 text-[#6B6F76] text-sm">No activity yet.</div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-[#E8E5E0]"/>
                    <div className="space-y-4">
                      {timeline.map(ev => {
                        const icons = { CREATED:'🟠', MESSAGE:'💬', FILE:'📎', MILESTONE:'🏁', MILESTONE_DONE:'✅', FINDING:'🔴', FINDING_RESOLVED:'🟢', REPORT:'📦' };
                        const colors = { CREATED:'bg-[#F2782E]', MESSAGE:'bg-blue-500', FILE:'bg-purple-500', MILESTONE:'bg-amber-500', MILESTONE_DONE:'bg-green-500', FINDING:'bg-red-500', FINDING_RESOLVED:'bg-green-600', REPORT:'bg-[#0E0E0F]' };
                        return (
                          <div key={ev.id} className="flex gap-4 items-start relative">
                            <div className={`w-8 h-8 rounded-full ${colors[ev.type]||'bg-gray-400'} flex items-center justify-center text-white text-xs flex-shrink-0 z-10 shadow`}>
                              <span>{icons[ev.type]||'•'}</span>
                            </div>
                            <div className="flex-1 min-w-0 pb-2">
                              <p className="text-sm font-semibold text-[#0E0E0F]">{ev.title}</p>
                              {ev.description && <p className="text-xs text-[#6B6F76] mt-0.5 line-clamp-2">{ev.description}</p>}
                              <p className="text-[10px] text-[#9CA3AF] mt-1">{new Date(ev.at).toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {activeTab==='messages' && (
              <div className="bg-white border border-[#E8E5E0] border-t-0 rounded-b-xl flex flex-col" style={{height:'min(calc(100vh - 220px), 600px)', minHeight:'320px'}}>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length===0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#6B6F76]"><Shield className="h-10 w-10 mb-3 opacity-30"/><p className="text-sm">No messages yet. Start the conversation.</p></div>
                  ) : messages.map(msg=>{
                    const isOwn=msg.senderId===user.id;
                    const isNote=msg.messageType==='INTERNAL_NOTE';
                    return (
                      <div key={msg.id} className={`flex ${isOwn?'justify-end':'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isNote?'bg-amber-50 border border-amber-200 text-amber-900':isOwn?'bg-[#F2782E] text-white':'bg-[#F7F5F2] text-[#0E0E0F]'}`}>
                          <div className="flex items-center gap-2 mb-1 text-[11px] opacity-70">
                            <span className="font-semibold">{msg.sender?.name}</span>
                            {isNote&&<span className="uppercase tracking-wide font-bold">· Internal Note</span>}
                            <span>· {new Date(msg.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                          </div>
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                          {msg.attachments?.length>0&&<div className="mt-1.5 space-y-1">{msg.attachments.map(att=>(
                            <a key={att.id} href={`${API_URL}${att.fileUrl}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-xs underline ${isOwn&&!isNote?'text-white/80':'text-[#F2782E]'}`}>
                              <FileText className="h-3 w-3"/>{att.fileName}
                            </a>
                          ))}</div>}
                        </div>
                      </div>
                    );
                  })}
                  {typingUsers.length>0&&<div className="flex justify-start"><div className="bg-[#F7F5F2] rounded-2xl px-4 py-2 text-xs text-[#6B6F76]">{typingUsers.map(u=>u.name).join(', ')} typing…</div></div>}
                  <div ref={messagesEndRef}/>
                </div>
                {/* Compose */}
                <div className="p-3 border-t border-[#E8E5E0]">
                  {pendingAtts.length>0&&<div className="flex flex-wrap gap-2 mb-2">{pendingAtts.map(a=>(
                    <div key={a.id} className="flex items-center gap-1.5 bg-[#F7F5F2] border border-[#E8E5E0] rounded-lg px-2 py-1 text-xs">
                      <FileText className="h-3 w-3 text-[#F2782E]"/><span className="max-w-[100px] truncate">{a.fileName}</span>
                      <button onClick={()=>setPendingAtts(p=>p.filter(x=>x.id!==a.id))}><X className="h-3 w-3 text-[#6B6F76] hover:text-red-500"/></button>
                    </div>
                  ))}</div>}
                  {isAdmin&&<div className="flex items-center gap-2 mb-2"><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={isInternal} onChange={e=>setIsInternal(e.target.checked)} className="accent-amber-500 w-3.5 h-3.5"/><span className="text-xs font-medium text-amber-700">Internal note</span></label></div>}
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden"/>
                    <button type="button" onClick={()=>fileInputRef.current?.click()} disabled={isUploading} className="p-2.5 text-[#6B6F76] hover:text-[#F2782E] border border-[#E8E5E0] rounded-xl disabled:opacity-50 flex-shrink-0">
                      {isUploading?<Loader2 className="h-4 w-4 animate-spin"/>:<Paperclip className="h-4 w-4"/>}
                    </button>
                    <input value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyDown={handleTyping}
                      placeholder={isInternal?'Internal note…':'Type a message…'}
                      className={`flex-1 px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent ${isInternal?'border-amber-300 bg-amber-50':'border-[#E8E5E0]'}`}/>
                    <button type="submit" disabled={isSending||(!newMessage.trim()&&pendingAtts.length===0)} className="p-2.5 bg-[#F2782E] text-white rounded-xl hover:bg-[#D9601A] disabled:opacity-50 flex-shrink-0">
                      {isSending?<Loader2 className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Milestones tab */}
            {activeTab==='milestones' && (
              <div className="bg-white border border-[#E8E5E0] border-t-0 rounded-b-xl p-5">
                {milestones.length===0 ? (
                  <div className="py-12 text-center text-[#6B6F76]"><Clock className="h-10 w-10 mx-auto mb-3 opacity-30"/><p className="text-sm">No milestones set yet.</p></div>
                ) : (
                  <div className="space-y-3">
                    {milestones.map((m,i)=>(
                      <div key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${m.status==='COMPLETE'?'bg-green-50 border-green-200':'bg-[#F7F5F2] border-[#E8E5E0]'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${m.status==='COMPLETE'?'bg-green-500 text-white':m.status==='IN_PROGRESS'?'bg-[#F2782E] text-white':'bg-[#E8E5E0] text-[#6B6F76]'}`}>
                          {m.status==='COMPLETE'?'✓':i+1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${m.status==='COMPLETE'?'line-through text-[#6B6F76]':'text-[#0E0E0F]'}`}>{m.title}</p>
                          {m.description&&<p className="text-xs text-[#6B6F76] mt-0.5">{m.description}</p>}
                          {m.dueDate&&<p className="text-xs text-[#6B6F76] mt-0.5">Due: {new Date(m.dueDate).toLocaleDateString()}</p>}
                        </div>
                        {isAdmin && (
                          <div className="flex gap-1.5">
                            {m.status!=='COMPLETE'&&<button onClick={()=>updateMilestone(m.id,{status:'COMPLETE'})} className="px-2.5 py-1 text-xs bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100">Complete</button>}
                            {m.status==='PENDING'&&<button onClick={()=>updateMilestone(m.id,{status:'IN_PROGRESS'})} className="px-2.5 py-1 text-xs bg-orange-50 text-[#F2782E] rounded-lg border border-orange-200 hover:bg-orange-100">Start</button>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Findings tab (CYBERSECURITY only) */}
            {activeTab==='findings' && (
              <div className="bg-white border border-[#E8E5E0] border-t-0 rounded-b-xl">
                {findings.length>0&&(
                  <div className="flex gap-2 flex-wrap p-4 border-b border-[#E8E5E0]">
                    {['CRITICAL','HIGH','MEDIUM','LOW','INFO'].map(s=>sev[s]?(
                      <span key={s} className={`text-xs font-bold px-2.5 py-1 rounded-full border ${SEV_CONFIG[s].badge}`}>{s}: {sev[s]}</span>
                    ):null)}
                    {isAdmin&&<button onClick={()=>setShowFindingForm(true)} className="ml-auto flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#F2782E] text-white rounded-full hover:bg-[#D9601A]"><Plus className="h-3 w-3"/>Add Finding</button>}
                  </div>
                )}
                {findings.length===0 ? (
                  <div className="py-14 text-center text-[#6B6F76]"><CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-30"/><p className="text-sm mb-3">No findings yet.</p>{isAdmin&&<button onClick={()=>setShowFindingForm(true)} className="px-4 py-2 bg-[#F2782E] text-white text-sm font-bold rounded-xl hover:bg-[#D9601A]"><Plus className="h-4 w-4 inline mr-1"/>Add finding</button>}</div>
                ) : findings.map(f=>{
                  const cfg=SEV_CONFIG[f.severity]; const open=expandedFindings[f.id];
                  return (
                    <div key={f.id}>
                      <button onClick={()=>setExpandedFindings(p=>({...p,[f.id]:!p[f.id]}))} className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#F7F5F2] transition-colors">
                        <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${cfg.bar}`}/>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${cfg.badge}`}>{f.severity}</span>
                            <span className="text-xs text-[#6B6F76]">{f.category}</span>
                            {f.cvssScore&&<span className="text-xs font-mono font-bold">{f.cvssScore}</span>}
                          </div>
                          <p className="text-sm font-semibold text-[#0E0E0F] truncate">{f.title}</p>
                        </div>
                        {open?<ChevronUp className="h-4 w-4 text-[#6B6F76]"/>:<ChevronDown className="h-4 w-4 text-[#6B6F76]"/>}
                      </button>
                      {open&&(
                        <div className="px-5 pb-5 border-t border-[#E8E5E0]">
                          <div className="grid md:grid-cols-2 gap-5 mt-4">
                            <div><h4 className="text-xs font-bold uppercase text-[#6B6F76] mb-2">Description</h4><p className="text-sm text-[#0E0E0F] whitespace-pre-wrap leading-relaxed">{f.description}</p></div>
                            <div><h4 className="text-xs font-bold uppercase text-[#6B6F76] mb-2 flex items-center gap-1"><Lock className="h-3 w-3"/>Remediation</h4><p className="text-sm text-[#0E0E0F] whitespace-pre-wrap leading-relaxed">{f.remediation}</p></div>
                          </div>
                          {f.evidence&&<div className="mt-4"><h4 className="text-xs font-bold uppercase text-[#6B6F76] mb-2">Evidence</h4><pre className="bg-gray-50 rounded-lg p-3 text-xs font-mono overflow-x-auto">{f.evidence}</pre></div>}
                          <div className="flex flex-wrap gap-2 mt-4">
                            {isAdmin?(<>
                              {f.status!=='OPEN'&&<button onClick={()=>updateFindingStatus(f.id,'OPEN')} className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100">Mark Open</button>}
                              {f.status!=='RESOLVED'&&<button onClick={()=>updateFindingStatus(f.id,'RESOLVED')} className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg border border-green-100 hover:bg-green-100">Resolved</button>}
                            </>):(<>
                              {f.status==='OPEN'&&<button onClick={()=>updateFindingStatus(f.id,'IN_PROGRESS')} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100">Start Remediation</button>}
                              {f.status==='IN_PROGRESS'&&<button onClick={()=>updateFindingStatus(f.id,'RESOLVED')} className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg border border-green-100 hover:bg-green-100">Mark Resolved</button>}
                            </>)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E8E5E0] p-5">
              <h3 className="text-sm font-bold text-[#0E0E0F] mb-3">Request Details</h3>
              {request.reportUrl&&<a href={request.reportUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full mb-3 p-3 bg-[#F2782E]/5 border border-[#F2782E]/20 rounded-xl text-sm font-semibold text-[#F2782E] hover:bg-[#F2782E]/10"><FileText className="h-4 w-4"/>Download Deliverable</a>}
              {request.reportSummary&&<div className="mb-3 p-3 bg-[#F7F5F2] rounded-xl text-sm text-[#6B6F76]"><p className="text-xs font-bold text-[#0E0E0F] mb-1">Summary</p><p className="whitespace-pre-wrap">{request.reportSummary}</p></div>}
              <div className="space-y-2.5 text-sm">
                {[['Service',SERVICE_LABELS[request.serviceType]],['Status',STATUS_LABELS[request.status]],['Created',new Date(request.createdAt).toLocaleDateString()],['Assigned',request.assignedAdmin?.name||'—'],['Budget',request.budget||'—'],['Deadline',request.deadline?new Date(request.deadline).toLocaleDateString():'—']].map(([l,v])=>(
                  <div key={l} className="flex justify-between"><span className="text-[#6B6F76]">{l}</span><span className="font-semibold text-[#0E0E0F] text-right max-w-[60%]">{v}</span></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#E8E5E0] p-5">
              <h3 className="text-sm font-bold text-[#0E0E0F] mb-2">Description</h3>
              <p className="text-sm text-[#6B6F76] whitespace-pre-wrap leading-relaxed">{request.description}</p>
            </div>
            {request.attachments?.length>0&&(
              <div className="bg-white rounded-xl border border-[#E8E5E0] p-5">
                <h3 className="text-sm font-bold text-[#0E0E0F] mb-3">Files</h3>
                <ul className="space-y-1.5">
                  {request.attachments.map(att=>(
                    <li key={att.id}><a href={`${API_URL}${att.fileUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#F2782E] hover:underline">
                      <Download className="h-3.5 w-3.5 flex-shrink-0"/><span className="truncate">{att.fileName}</span><span className="text-[#6B6F76] text-xs">({(att.fileSize/1024).toFixed(1)}KB)</span>
                    </a></li>
                  ))}
                </ul>
              </div>
            )}
            {/* Feedback panel — visible to client on DELIVERED or already submitted */}
            {user?.role === 'CLIENT' && (request.status === 'DELIVERED' || request.status === 'CLOSED') && (
              <FeedbackPanel request={request} onUpdated={fetchRequest} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
