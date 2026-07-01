import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, Users, FileText, Clock, CheckCircle, AlertCircle,
  ChevronRight, LogOut, Bell, Search, Filter, Building2,
  RefreshCw, TrendingUp, Plus, Edit2, Trash2, ExternalLink,
  Image, Globe, X, Save, Mail, Star
} from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';
import { useRef } from 'react';

const STATUS_COLORS = {
  SUBMITTED:    'bg-yellow-100 text-yellow-800',
  REVIEWED:  'bg-blue-100 text-blue-800',
  SCOPED:   'bg-emerald-100 text-emerald-800',
  IN_PROGRESS:'bg-purple-100 text-purple-800',
  REVIEW:  'bg-orange-100 text-orange-800',
  DELIVERED:   'bg-green-100 text-green-800',
  CLOSED:   'bg-gray-100 text-gray-800',
  ON_HOLD:    'bg-gray-100 text-gray-800',
};

const STATUS_LABELS = {
  SUBMITTED:    'Pending',
  REVIEWED:  'In Review',
  SCOPED:   'Approved',
  IN_PROGRESS:'In Progress',
  REVIEW:  'Review',
  DELIVERED:   'Delivered',
  CLOSED:   'Closed',
  ON_HOLD:    'On Hold',
};

const FILTER_OPTIONS = [
  { value: 'all',         label: 'All Status' },
  { value: 'SUBMITTED',   label: 'Submitted' },
  { value: 'REVIEWED',    label: 'In Review' },
  { value: 'SCOPED',      label: 'Scoped' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REVIEW',      label: 'Ready for Review' },
  { value: 'DELIVERED',   label: 'Delivered' },
  { value: 'CLOSED',      label: 'Closed' },
  { value: 'ON_HOLD',     label: 'On Hold' },
];

const TYPE_OPTIONS = [
  { value: 'all',           label: 'All Services' },
  { value: 'SOFTWARE_DEV',  label: 'Software Dev' },
  { value: 'CYBERSECURITY', label: 'Cybersecurity' },
  { value: 'CLOUD',         label: 'Cloud' },
  { value: 'CONSULTING',    label: 'Consulting' },
];

const SERVICE_COLORS = {
  SOFTWARE_DEV: 'bg-blue-100 text-blue-700',
  CYBERSECURITY: 'bg-orange-100 text-[#F2782E]',
  CLOUD: 'bg-purple-100 text-purple-700',
  CONSULTING: 'bg-green-100 text-green-700',
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection]   = useState('requests'); // 'requests' | 'projects' | 'companies'
  const [requests, setRequests]   = useState([]);
  const [stats, setStats]               = useState(null);
  const [analysts, setAnalysts]         = useState([]);
  const [projects, setProjects]         = useState([]);
  const [companies, setCompanies]       = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState(null);
  const [filter, setFilter]             = useState('all');
  const [typeFilter, setTypeFilter]     = useState('all');
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject]   = useState(null);

  const { user, logout, apiCall, isAdmin, unreadCount } = usePortal();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/portal/dashboard'); return; }
    fetchStats();
    fetchAnalysts();
    fetchProjects();
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && activeSection === 'companies') fetchCompanies();
  }, [isAdmin, activeSection]);

  useEffect(() => {
    if (isAdmin) fetchRequests();
  }, [filter, typeFilter, page, isAdmin]);

  const fetchStats = useCallback(async () => {
    try {
      const r = await apiCall('/api/requests/stats/summary');
      if (r.ok) {
        setStats(await r.json());
        setError(null);
      } else {
        const data = await r.json().catch(() => ({}));
        setError(data.error || `Stats failed: ${r.status}`);
      }
    } catch (e) { console.error(e); setError('Network error loading stats'); }
  }, [apiCall]);

  const fetchAnalysts = useCallback(async () => {
    try {
      const r = await apiCall('/api/invitations/org/members');
      if (r.ok) {
        const data = await r.json();
        setAnalysts((data.members || data).filter(m => m.role === 'ADMIN' || m.role === 'ANALYST'));
      }
    } catch (e) { console.error(e); }
  }, [apiCall]);

  const fetchProjects = useCallback(async () => {
    try {
      const r = await fetch('/api/projects');
      if (r.ok) setProjects(await r.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    try {
      const r = await apiCall('/api/requests/companies');
      if (r.ok) setCompanies(await r.json());
    } catch (e) { console.error(e); }
    finally { setCompaniesLoading(false); }
  }, [apiCall]);

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      const r = await apiCall(`/api/projects/${id}`, { method: 'DELETE' });
      if (r.ok) fetchProjects();
    } catch (e) { console.error(e); }
  };

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const typeParam = typeFilter !== 'all' ? `&serviceType=${typeFilter}` : '';
      const r = await apiCall(`/api/requests?page=${page}&limit=15${statusParam}${typeParam}`);
      if (r.ok) {
        const data = await r.json();
        setRequests(data.requests);
        setTotalPages(data.pagination.totalPages || 1);
        setError(null);
      } else {
        const data = await r.json().catch(() => ({}));
        setError(data.error || `Requests failed: ${r.status}`);
      }
    } catch (e) { console.error(e); setError('Network error loading requests'); }
    finally { setIsLoading(false); }
  }, [apiCall, filter, typeFilter, page]);

  const handleAssign = async (requestId, adminId) => {
    try {
      const r = await apiCall(`/api/requests/${requestId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ adminId }),
      });
      if (r.ok) { fetchRequests(); fetchStats(); }
      else { const data = await r.json().catch(() => ({})); setError(data.error || 'Assignment failed'); }
    } catch (e) { console.error(e); setError('Network error during assignment'); }
  };

  const handleStatusChange = async (requestId, status) => {
    try {
      const r = await apiCall(`/api/requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (r.ok) { fetchRequests(); fetchStats(); }
      else { const data = await r.json().catch(() => ({})); setError(data.error || 'Status update failed'); }
    } catch (e) { console.error(e); setError('Network error during status update'); }
  };

  const filtered = requests.filter(a => {
    const q = search.toLowerCase();
    return !q || a.title.toLowerCase().includes(q) || a.organization?.name.toLowerCase().includes(q);
  });

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* ── Nav ── */}
      <nav className="bg-[#0E0E0F] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F2782E] flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">Kreatix VAPT Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2 pl-4 border-l border-white/10">
              <span className="text-sm text-gray-400">{user?.name}</span>
              <span className="px-2 py-0.5 bg-[#F2782E] text-white text-xs font-bold rounded-full">{user?.role}</span>
              <button onClick={() => { logout(); navigate('/portal/login'); }} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 font-bold">×</button>
          </div>
        )}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0E0E0F]">Admin Dashboard</h1>
          <p className="mt-1 text-[#6B6F76]">Manage service requests across all disciplines</p>
        </div>

        {/* ── Stats ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total',       value: stats.total,                                       icon: FileText,    bg: 'bg-blue-50',   ic: 'text-blue-600' },
              { label: 'New',         value: stats.statuses?.SUBMITTED || 0,                    icon: Clock,       bg: 'bg-yellow-50', ic: 'text-yellow-600' },
              { label: 'In Progress', value: (stats.statuses?.IN_PROGRESS||0)+(stats.statuses?.SCOPED||0)+(stats.statuses?.REVIEWED||0), icon: TrendingUp, bg: 'bg-purple-50', ic: 'text-purple-600' },
              { label: 'Delivered',   value: (stats.statuses?.DELIVERED||0)+(stats.statuses?.CLOSED||0), icon: CheckCircle, bg: 'bg-green-50', ic: 'text-green-600' },
              { label: 'Clients',     value: stats.clients,                                     icon: Users,       bg: 'bg-orange-50', ic: 'text-[#F2782E]' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-[#E8E5E0] p-5">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <s.icon className={`h-5 w-5 ${s.ic}`} />
                </div>
                <p className="text-2xl font-bold text-[#0E0E0F]">{s.value ?? 0}</p>
                <p className="text-sm text-[#6B6F76] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Section tabs ── */}
        <div className="flex gap-1 mb-6 border-b border-[#E8E5E0]">
          {[['requests','Service Requests'],['companies','Companies'],['projects','Portfolio Projects']].map(([key,label]) => (
            <button key={key} onClick={() => setActiveSection(key)}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeSection === key ? 'border-[#F2782E] text-[#F2782E]' : 'border-transparent text-[#6B6F76] hover:text-[#0E0E0F]'}`}>
              {label}
              {key === 'projects' && <span className="ml-1.5 text-xs bg-[#F7F5F2] text-[#6B6F76] rounded-full px-2 py-0.5">{projects.length}</span>}
            {key === 'companies' && <span className="ml-1.5 text-xs bg-[#F7F5F2] text-[#6B6F76] rounded-full px-2 py-0.5">{companies.length}</span>}
            </button>
          ))}
        </div>
        <div className={activeSection === 'requests' ? 'block' : 'hidden'}>
        <div className="bg-white rounded-xl border border-[#E8E5E0] overflow-hidden">
          <div className="p-5 border-b border-[#E8E5E0] flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-lg font-bold text-[#0E0E0F] flex-1">All Requests</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6F76]" />
                <input
                  type="text" placeholder="Search…" value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent w-full sm:w-52"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6F76]" />
                <select
                  value={filter}
                  onChange={e => { setFilter(e.target.value); setPage(1); }}
                  className="pl-9 pr-4 py-2 border border-[#E8E5E0] rounded-xl text-sm bg-white appearance-none focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                >
                  {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-[#E8E5E0] rounded-xl text-sm bg-white appearance-none focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                >
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <button onClick={() => { fetchRequests(); fetchStats(); }} className="p-2 border border-[#E8E5E0] rounded-xl text-[#6B6F76] hover:text-[#0E0E0F] hover:border-[#0E0E0F] transition-colors" title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#F2782E] border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <AlertCircle className="h-10 w-10 text-[#6B6F76] mx-auto mb-3" />
              <p className="text-[#6B6F76]">{search ? 'No results for that search' : 'No requests match this filter'}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8E5E0]">
              {filtered.map(a => (
                <RequestRow
                  key={a.id} request={a}
                  analysts={analysts}
                  onAssign={handleAssign}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#E8E5E0]">
              <span className="text-sm text-[#6B6F76]">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-sm border border-[#E8E5E0] rounded-lg disabled:opacity-40 hover:border-[#0E0E0F] transition-colors">
                  Previous
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-sm border border-[#E8E5E0] rounded-lg disabled:opacity-40 hover:border-[#0E0E0F] transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        </div>{/* end requests section */}

        {/* ── Companies section ── */}
        {activeSection === 'companies' && (
          <CompaniesPanel companies={companies} loading={companiesLoading} onRefresh={fetchCompanies} />
        )}

        {/* ── Projects section ── */}
        {activeSection === 'projects' && (
          <ProjectsPanel
            projects={projects}
            apiCall={apiCall}
            onRefresh={fetchProjects}
          />
        )}

      </main>
    </div>
  );
}

// ── Request row with inline assign + status controls ─────────────────────
function RequestRow({ request: a, analysts, onAssign, onStatusChange }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="p-5 hover:bg-[#F7F5F2] transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Left: info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SERVICE_COLORS[a.serviceType] || 'bg-gray-100 text-gray-700'}`}>
              {a.serviceType?.replace('_',' ')}
            </span>
            <Link to={`/portal/request/${a.id}`} className="text-base font-semibold text-[#0E0E0F] hover:text-[#F2782E] transition-colors">
              {a.title}
            </Link>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status]}`}>
              {STATUS_LABELS[a.status]}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[#6B6F76] mb-2">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{a.organization?.name}</span>
            <span className="text-[#E8E5E0]">·</span>
            <span className="text-xs">{new Date(a.createdAt).toLocaleDateString()}</span>
            <span className="text-[#E8E5E0]">·</span>
            <span className="text-xs">{a._count?.messages ?? 0} msgs</span>
          </div>
          {/* Assign analyst */}
          <div className="flex items-center gap-2 flex-wrap">
            {a.assignedAdmin ? (
              <span className="text-xs text-[#6B6F76] flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-[#F2782E]" />
                Assigned: <strong className="text-[#0E0E0F]">{a.assignedAdmin.name}</strong>
              </span>
            ) : (
              <span className="text-xs text-amber-600 font-medium">Unassigned</span>
            )}
            {analysts.length > 0 && (
              <select
                defaultValue=""
                onChange={e => { if (e.target.value) onAssign(a.id, e.target.value); e.target.value = ''; }}
                className="text-xs border border-[#E8E5E0] rounded-lg px-2 py-1 bg-white text-[#6B6F76] hover:border-[#F2782E] transition-colors"
              >
                <option value="">Assign to…</option>
                {analysts.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to={`/portal/request/${a.id}`}
            className="px-3 py-1.5 text-xs font-semibold bg-[#0E0E0F] text-white rounded-lg hover:bg-[#F2782E] transition-colors">
            Open
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowActions(v => !v)}
              className="px-3 py-1.5 text-xs font-semibold border border-[#E8E5E0] rounded-lg hover:border-[#0E0E0F] text-[#6B6F76] hover:text-[#0E0E0F] transition-colors"
            >
              Status ▾
            </button>
            {showActions && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E8E5E0] rounded-xl shadow-lg z-10 py-1">
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <button key={val} onClick={() => { onStatusChange(a.id, val); setShowActions(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F7F5F2] transition-colors ${a.status === val ? 'font-bold text-[#F2782E]' : 'text-[#0E0E0F]'}`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, refreshNotifications } = usePortal();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { if (open) refreshNotifications(); }, [open]);

  const TYPE_ICON = { NEW_MESSAGE: '💬', STATUS_CHANGE: '🔄', ASSESSMENT_ASSIGNED: '📋', ASSESSMENT_CREATED: '📥', FILE_UPLOAD: '📎' };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#F2782E] rounded-full text-[10px] font-bold flex items-center justify-center text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#E8E5E0] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E5E0]">
            <p className="font-bold text-sm text-[#0E0E0F]">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllNotificationsRead}
                className="text-xs text-[#F2782E] hover:underline font-semibold">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-[#F7F5F2]">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#6B6F76]">No notifications</div>
            ) : notifications.slice(0, 20).map(n => (
              <div key={n.id}
                onClick={() => { if (!n.read) markNotificationRead(n.id); }}
                className={`px-4 py-3 flex gap-3 cursor-pointer transition-colors hover:bg-[#F7F5F2] ${n.read ? 'opacity-60' : 'bg-white'}`}>
                <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${n.read ? 'text-[#6B6F76]' : 'font-semibold text-[#0E0E0F]'}`}>{n.title}</p>
                  <p className="text-xs text-[#6B6F76] mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-[#F2782E] flex-shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Companies panel ──────────────────────────────────────────────────────────
function CompaniesPanel({ companies, loading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = companies.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#6B6F76]">{companies.length} registered companies</p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6F76]" />
            <input
              type="text" placeholder="Search companies…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent w-52"
            />
          </div>
          <button onClick={onRefresh} className="p-2 border border-[#E8E5E0] rounded-xl text-[#6B6F76] hover:text-[#0E0E0F] hover:border-[#0E0E0F] transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#F2782E] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E5E0] p-16 text-center">
          <Building2 className="h-10 w-10 text-[#6B6F76] mx-auto mb-3 opacity-40" />
          <p className="text-[#6B6F76]">{search ? 'No companies match your search' : 'No companies registered yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const reqCount = c._count?.serviceRequests ?? 0;
            const activeReqs = c.serviceRequests?.filter(r => !['CLOSED','DELIVERED'].includes(r.status)).length ?? 0;
            const avgRating = null;
            const isOpen = expanded === c.id;
            return (
              <div key={c.id} className="bg-white rounded-xl border border-[#E8E5E0] overflow-hidden">
                <div
                  className="p-5 flex items-center gap-4 cursor-pointer hover:bg-[#F7F5F2] transition-colors"
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                >
                  <div className="w-10 h-10 bg-[#F2782E]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-[#F2782E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0E0E0F] truncate">{c.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-[#6B6F76]">
                        <Mail className="h-3 w-3" />{c.contactEmail}
                      </span>
                      <span className="text-[#E8E5E0]">·</span>
                      <span className="text-xs text-[#6B6F76]">Joined {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 text-right">
                    <div>
                      <p className="text-lg font-bold text-[#0E0E0F]">{reqCount}</p>
                      <p className="text-xs text-[#6B6F76]">Requests</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">{activeReqs}</p>
                      <p className="text-xs text-[#6B6F76]">Active</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#0E0E0F]">{c.users?.length ?? 0}</p>
                      <p className="text-xs text-[#6B6F76]">Users</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-[#6B6F76] transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-[#E8E5E0] px-5 py-4 bg-[#F7F5F2]">
                    <p className="text-xs font-bold text-[#6B6F76] uppercase tracking-wide mb-3">Team Members</p>
                    {c.users?.length === 0 ? (
                      <p className="text-sm text-[#6B6F76]">No users</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {c.users.map(u => (
                          <div key={u.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-[#E8E5E0]">
                            <div className="w-7 h-7 rounded-full bg-[#F2782E]/10 flex items-center justify-center text-xs font-bold text-[#F2782E]">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#0E0E0F] truncate">{u.name}</p>
                              <p className="text-xs text-[#6B6F76] truncate">{u.email}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-[#F2782E] text-white' : 'bg-[#F7F5F2] text-[#6B6F76]'}`}>
                              {u.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Project form modal ───────────────────────────────────────────────────────
const EMPTY_PROJECT = {
  title: '', description: '', tags: '', category: '',
  liveUrl: '', previewUrl: '', featured: false, published: true, year: new Date().getFullYear()
};

function ProjectForm({ initial, apiCall, onSaved, onClose }) {
  const [form, setForm] = useState(initial
    ? { ...initial, tags: (initial.tags || []).join(', ') }
    : EMPTY_PROJECT);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const isEdit = !!initial?.id;

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setErr('');
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      year: parseInt(form.year) || new Date().getFullYear(),
    };
    try {
      const r = await apiCall(
        isEdit ? `/api/projects/${initial.id}` : '/api/projects',
        { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(payload) }
      );
      if (r.ok) { onSaved(); onClose(); }
      else { const d = await r.json(); setErr(d.error || 'Failed to save'); }
    } catch { setErr('Network error'); }
    finally { setSaving(false); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E8E5E0]">
          <h3 className="text-lg font-bold">{isEdit ? 'Edit Project' : 'Add Project'}</h3>
          <button onClick={onClose} className="p-2 text-[#6B6F76] hover:text-[#0E0E0F]"><X className="h-5 w-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{err}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Title *</label>
              <input required value={form.title} onChange={e=>f('title',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="e.g. Caremaster"/>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Description *</label>
              <textarea required rows={3} value={form.description} onChange={e=>f('description',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="Short description shown on homepage and portfolio…"/>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Category</label>
              <input value={form.category} onChange={e=>f('category',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="e.g. SaaS Platform"/>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Year</label>
              <input type="number" min="2010" max="2100" value={form.year} onChange={e=>f('year',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"/>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Tags <span className="text-[#6B6F76] font-normal">(comma-separated)</span></label>
              <input value={form.tags} onChange={e=>f('tags',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="React, Node.js, SaaS"/>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1 flex items-center gap-1"><Globe className="h-3.5 w-3.5"/> Live URL</label>
              <input type="url" value={form.liveUrl} onChange={e=>f('liveUrl',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="https://…"/>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1 flex items-center gap-1"><Image className="h-3.5 w-3.5"/> Preview Image URL</label>
              <input type="url" value={form.previewUrl} onChange={e=>f('previewUrl',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="https://… (screenshot or cover image)"/>
              <p className="text-xs text-[#6B6F76] mt-1">Paste a direct image URL — this will show as the project preview on the homepage.</p>
              {form.previewUrl && (
                <img src={form.previewUrl} alt="preview" className="mt-2 h-24 w-full object-cover object-top rounded-lg border border-[#E8E5E0]" onError={e=>e.target.style.display='none'}/>
              )}
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input type="checkbox" checked={form.featured} onChange={e=>f('featured',e.target.checked)} className="accent-[#F2782E] w-4 h-4"/>
                Featured
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input type="checkbox" checked={form.published} onChange={e=>f('published',e.target.checked)} className="accent-[#F2782E] w-4 h-4"/>
                Published
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#6B6F76] hover:text-[#0E0E0F]">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#F2782E] text-white text-sm font-bold rounded-xl hover:bg-[#D9601A] disabled:opacity-50 transition-colors flex items-center gap-1.5">
              <Save className="h-4 w-4"/>{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Projects panel ───────────────────────────────────────────────────────────
function ProjectsPanel({ projects, apiCall, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);

  const handleDelete = async id => {
    if (!window.confirm('Delete this project? This will remove it from the homepage and portfolio.')) return;
    try {
      const r = await apiCall(`/api/projects/${id}`, { method: 'DELETE' });
      if (r.ok) onRefresh();
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      {(showForm || editing) && (
        <ProjectForm
          initial={editing}
          apiCall={apiCall}
          onSaved={onRefresh}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#6B6F76]">These projects appear on the homepage and portfolio page.</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#F2782E] text-white text-sm font-bold rounded-xl hover:bg-[#D9601A] transition-colors">
          <Plus className="h-4 w-4"/> Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E5E0] p-16 text-center">
          <FileText className="h-10 w-10 text-[#6B6F76] mx-auto mb-3 opacity-40"/>
          <p className="text-[#6B6F76] mb-4">No projects yet. Add your first one.</p>
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#F2782E] text-white text-sm font-bold rounded-xl hover:bg-[#D9601A] transition-colors">
            Add Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-[#E8E5E0] overflow-hidden group">
              <div className="h-36 bg-[#F7F5F2] relative overflow-hidden">
                {p.previewUrl
                  ? <img src={p.previewUrl} alt={p.title} className="w-full h-full object-cover object-top"/>
                  : <div className="w-full h-full flex items-center justify-center text-[#6B6F76] text-xs">No preview</div>
                }
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 bg-white rounded-lg shadow text-[#6B6F76] hover:text-[#F2782E]">
                      <ExternalLink className="h-3.5 w-3.5"/>
                    </a>
                  )}
                  <button onClick={() => setEditing(p)}
                    className="p-1.5 bg-white rounded-lg shadow text-[#6B6F76] hover:text-[#F2782E]">
                    <Edit2 className="h-3.5 w-3.5"/>
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    className="p-1.5 bg-white rounded-lg shadow text-[#6B6F76] hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5"/>
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {p.featured && <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F2782E] text-white rounded-full">Featured</span>}
                  {!p.published && <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-700 text-white rounded-full">Draft</span>}
                </div>
              </div>
              <div className="p-4">
                <p className="font-bold text-sm text-[#0E0E0F] truncate">{p.title}</p>
                <p className="text-xs text-[#6B6F76] mt-1 line-clamp-2">{p.description}</p>
                <div className="flex gap-1 flex-wrap mt-2">
                  {(p.tags || []).slice(0,3).map(t => (
                    <span key={t} className="text-[10px] font-bold text-[#F2782E] bg-[#FDF1E8] rounded-full px-2 py-0.5">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
