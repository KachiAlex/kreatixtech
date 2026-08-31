import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, FileText, MessageSquare, Clock, CheckCircle, 
  AlertCircle, ChevronRight, LogOut, Bell, Building2,
  Shield, Code2, Cloud, Search
} from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';
import Logo from '../../components/Logo';
import { Settings as SettingsIcon } from 'lucide-react';

const SERVICE_ICONS = { SOFTWARE_DEV: Code2, CYBERSECURITY: Shield, CLOUD: Cloud, CONSULTING: MessageSquare };
const SERVICE_LABELS = { SOFTWARE_DEV: 'Software Dev', CYBERSECURITY: 'Cybersecurity', CLOUD: 'Cloud', CONSULTING: 'Consulting' };
const SERVICE_COLORS = { SOFTWARE_DEV: 'bg-blue-100 text-blue-700', CYBERSECURITY: 'bg-orange-100 text-[#F2782E]', CLOUD: 'bg-purple-100 text-purple-700', CONSULTING: 'bg-green-100 text-green-700' };

const statusColors = {
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  REVIEWED: 'bg-blue-100 text-blue-800',
  SCOPED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  REVIEW: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  ON_HOLD: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  SUBMITTED: 'Submitted', REVIEWED: 'In Review', SCOPED: 'Scoped',
  IN_PROGRESS: 'In Progress', REVIEW: 'Ready for Review',
  DELIVERED: 'Delivered', CLOSED: 'Closed', ON_HOLD: 'On Hold'
};

export default function ClientDashboard() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0
  });
  
  const { user, logout, apiCall, isClient, isAdmin } = usePortal();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/portal/admin', { replace: true });
      return;
    }
    if (!isClient) {
      navigate('/portal/admin');
      return;
    }
    fetchRequests();
  }, [isClient, isAdmin, navigate]);

  const fetchRequests = async () => {
    try {
      const response = await apiCall('/api/requests');
      const data = await response.json();
      
      if (response.ok) {
        setRequests(data.requests);
        setStats({
          total: data.pagination.total,
          active: data.requests.filter(a => 
            ['SUBMITTED', 'REVIEWED', 'SCOPED', 'IN_PROGRESS', 'REVIEW'].includes(a.status)
          ).length,
          completed: data.requests.filter(a => a.status === 'DELIVERED' || a.status === 'CLOSED').length
        });
      }
    } catch (error) {
      console.error('Failed to fetch service requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/portal/login');
  };

  const filteredRequests = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchType = typeFilter === 'all' || r.serviceType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <nav className="bg-[#0E0E0F] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <Logo size="md" linkTo="/portal/dashboard" className="text-white" />
          <span className="hidden sm:block text-sm font-semibold text-white/60 truncate max-w-[160px]">
            {user?.organization?.name}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <NotifBell />
            <span className="hidden sm:block text-sm text-gray-400 max-w-[120px] truncate">{user?.name}</span>
            <Link to="/portal/settings" className="p-2 text-gray-400 hover:text-white transition-colors" title="Settings">
              <SettingsIcon className="h-4 w-4" />
            </Link>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-ink">Service Request Dashboard</h1>
          <p className="mt-2 text-grey-dark">
            Manage your service requests and project engagements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-grey">Total Requests</p>
                <p className="text-2xl font-bold text-ink">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-border">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="h-6 w-6 text-orange" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-grey">Active</p>
                <p className="text-2xl font-bold text-ink">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-grey">Completed</p>
                <p className="text-2xl font-bold text-ink">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter / search bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-ink flex-1">Your Requests</h2>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-grey" />
              <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm focus:ring-2 focus:ring-orange focus:border-transparent w-full sm:w-44" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-xl text-sm bg-white focus:ring-2 focus:ring-orange focus:border-transparent">
              <option value="all">All Status</option>
              {Object.entries(statusLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-xl text-sm bg-white focus:ring-2 focus:ring-orange focus:border-transparent">
              <option value="all">All Types</option>
              {Object.entries(SERVICE_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <Link to="/portal/request/new"
              className="inline-flex items-center px-4 py-2 bg-orange text-white rounded-xl font-medium hover:bg-orange-deep transition-colors whitespace-nowrap">
              <Plus className="h-4 w-4 mr-1.5" /> New Request
            </Link>
          </div>
        </div>

        {filteredRequests.length === 0 && requests.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <div className="w-16 h-16 bg-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-orange" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">No requests yet</h3>
            <p className="text-grey mb-2">Submit your first service request and we'll get back to you quickly.</p>
            <p className="text-sm text-grey mb-6">You can request Cybersecurity, Software Development, Cloud Services, or Consulting.</p>
            <Link to="/portal/request/new"
              className="inline-flex items-center px-5 py-2.5 bg-orange text-white rounded-xl font-bold hover:bg-orange-deep transition-colors">
              <Plus className="h-5 w-5 mr-2" /> Create First Request
            </Link>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-10 text-center">
            <AlertCircle className="h-10 w-10 text-grey mx-auto mb-3 opacity-50" />
            <p className="text-grey">No requests match your filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {filteredRequests.map((request) => {
                const ServiceIcon = SERVICE_ICONS[request.serviceType] || FileText;
                return (
                <Link
                  key={request.id}
                  to={`/portal/request/${request.id}`}
                  className="block p-6 hover:bg-offwhite transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2 gap-2 flex-wrap">
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${SERVICE_COLORS[request.serviceType]}`}>
                          <ServiceIcon className="h-3 w-3" />
                          {SERVICE_LABELS[request.serviceType]}
                        </span>
                        <h3 className="text-lg font-semibold text-ink">
                          {request.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                          {statusLabels[request.status]}
                        </span>
                      </div>
                      <p className="text-sm text-grey mb-3 line-clamp-2">
                        {request.description}
                      </p>
                      <div className="flex items-center text-sm text-grey space-x-4">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                        {request._count?.messages > 0 && (
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {request._count.messages} messages
                          </span>
                        )}
                        {request._count?.attachments > 0 && (
                          <span className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {request._count.attachments} files
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-grey ml-4" />
                  </div>
                </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const TYPE_ICON = { NEW_MESSAGE: '💬', STATUS_CHANGE: '🔄', ASSESSMENT_ASSIGNED: '📋', ASSESSMENT_CREATED: '📥', FILE_UPLOAD: '📎' };

function NotifBell() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, refreshNotifications } = usePortal();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { if (open) refreshNotifications(); }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="relative p-2 text-[#6B6F76] hover:text-[#0E0E0F] transition-colors">
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
              <button onClick={markAllNotificationsRead} className="text-xs text-[#F2782E] hover:underline font-semibold">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-[#F7F5F2]">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#6B6F76]">No notifications</div>
            ) : notifications.slice(0, 20).map(n => (
              <div key={n.id} onClick={() => { if (!n.read) markNotificationRead(n.id); }}
                className={`px-4 py-3 flex gap-3 cursor-pointer transition-colors hover:bg-[#F7F5F2] ${n.read ? 'opacity-60' : ''}`}>
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
