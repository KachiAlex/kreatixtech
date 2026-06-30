import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, Users, FileText, Clock, CheckCircle, AlertCircle,
  ChevronRight, LogOut, Bell, Search, Filter, Building2,
  RefreshCw, TrendingUp, XCircle, PauseCircle
} from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';

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
  PENDING:    'Pending',
  IN_REVIEW:  'In Review',
  APPROVED:   'Approved',
  IN_PROGRESS:'In Progress',
  REPORTING:  'Reporting',
  COMPLETE:   'Complete',
  ON_HOLD:    'On Hold',
};

const FILTER_OPTIONS = [
  { value: 'all',        label: 'All Status' },
  { value: 'PENDING',    label: 'Pending' },
  { value: 'IN_REVIEW',  label: 'In Review' },
  { value: 'APPROVED',   label: 'Approved' },
  { value: 'IN_PROGRESS',label: 'In Progress' },
  { value: 'REPORTING',  label: 'Reporting' },
  { value: 'COMPLETE',   label: 'Complete' },
  { value: 'ON_HOLD',    label: 'On Hold' },
];

export default function AdminDashboard() {
  const [assessments, setAssessments]   = useState([]);
  const [stats, setStats]               = useState(null);
  const [analysts, setAnalysts]         = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [filter, setFilter]             = useState('all');
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [notifCount, setNotifCount]     = useState(0);

  const { user, logout, apiCall, isAdmin, unreadCount } = usePortal();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) { navigate('/portal/dashboard'); return; }
    fetchStats();
    fetchAnalysts();
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchAssessments();
  }, [filter, page, isAdmin]);

  const fetchStats = useCallback(async () => {
    try {
      const r = await apiCall('/api/assessments/stats/summary');
      if (r.ok) setStats(await r.json());
    } catch (e) { console.error(e); }
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

  const fetchAssessments = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const r = await apiCall(`/api/assessments?page=${page}&limit=15${statusParam}`);
      if (r.ok) {
        const data = await r.json();
        setAssessments(data.assessments);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [apiCall, filter, page]);

  const handleAssign = async (assessmentId, adminId) => {
    try {
      const r = await apiCall(`/api/assessments/${assessmentId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ adminId }),
      });
      if (r.ok) { fetchAssessments(); fetchStats(); }
    } catch (e) { console.error(e); }
  };

  const handleStatusChange = async (assessmentId, status) => {
    try {
      const r = await apiCall(`/api/assessments/${assessmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (r.ok) { fetchAssessments(); fetchStats(); }
    } catch (e) { console.error(e); }
  };

  const filtered = assessments.filter(a => {
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
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#F2782E] rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
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
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0E0E0F]">Admin Dashboard</h1>
          <p className="mt-1 text-[#6B6F76]">Manage VAPT assessments and client communications</p>
        </div>

        {/* ── Stats ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total',       value: stats.total,      icon: FileText,    bg: 'bg-blue-50',   ic: 'text-blue-600' },
              { label: 'Pending',     value: stats.pending,    icon: Clock,       bg: 'bg-yellow-50', ic: 'text-yellow-600' },
              { label: 'In Progress', value: stats.inProgress + stats.inReview + stats.approved + stats.reporting, icon: TrendingUp, bg: 'bg-purple-50', ic: 'text-purple-600' },
              { label: 'Complete',    value: stats.complete,   icon: CheckCircle, bg: 'bg-green-50',  ic: 'text-green-600' },
              { label: 'Clients',     value: stats.clients,    icon: Users,       bg: 'bg-orange-50', ic: 'text-[#F2782E]' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-[#E8E5E0] p-5">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <s.icon className={`h-5 w-5 ${s.ic}`} />
                </div>
                <p className="text-2xl font-bold text-[#0E0E0F]">{s.value}</p>
                <p className="text-sm text-[#6B6F76] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border border-[#E8E5E0] overflow-hidden">
          <div className="p-5 border-b border-[#E8E5E0] flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-lg font-bold text-[#0E0E0F] flex-1">All Assessments</h2>
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
              <button onClick={() => { fetchAssessments(); fetchStats(); }} className="p-2 border border-[#E8E5E0] rounded-xl text-[#6B6F76] hover:text-[#0E0E0F] hover:border-[#0E0E0F] transition-colors" title="Refresh">
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
              <p className="text-[#6B6F76]">{search ? 'No results for that search' : 'No assessments match this filter'}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8E5E0]">
              {filtered.map(a => (
                <AssessmentRow
                  key={a.id} assessment={a}
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
      </main>
    </div>
  );
}

// ── Assessment row with inline assign + status controls ─────────────────────
function AssessmentRow({ assessment: a, analysts, onAssign, onStatusChange }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="p-5 hover:bg-[#F7F5F2] transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Left: info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link to={`/portal/assessment/${a.id}`} className="text-base font-semibold text-[#0E0E0F] hover:text-[#F2782E] transition-colors">
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
          <Link to={`/portal/assessment/${a.id}`}
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
