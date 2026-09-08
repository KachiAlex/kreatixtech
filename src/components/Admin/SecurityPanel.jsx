import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, ShieldAlert, ShieldCheck, Activity, Ban, Globe,
  RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock,
  Server, HardDrive, Cpu, Lock, Eye, EyeOff, ChevronDown,
  Search, Filter, Wifi, Container, Terminal, MapPin, Zap,
  BarChart3
} from 'lucide-react';

const SEVERITY_CONFIG = {
  CRITICAL: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Critical' },
  HIGH:     { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'High' },
  MEDIUM:   { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Medium' },
  LOW:      { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Low' },
  INFO:     { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Info' },
};

const EVENT_TYPE_LABELS = {
  SSH_FAILED:       'SSH Failed Login',
  SSH_SUCCESS:      'SSH Successful Login',
  FAIL2BAN_BAN:     'IP Banned (fail2ban)',
  FAIL2BAN_UNBAN:   'IP Unbanned (fail2ban)',
  PORT_SCAN:        'Port Scan Detected',
  SUSPICIOUS_LOGIN: 'Suspicious Login',
  DOCKER_EXPOSURE:  'Docker Port Exposed',
  FIREWALL_CHANGE:  'Firewall Change',
  MANUAL_BAN:       'Manual IP Ban',
  MANUAL_UNBAN:     'Manual IP Unban',
  SECURITY_SCAN:    'Security Scan',
};

const EVENT_FILTERS = [
  { value: 'all', label: 'All Events' },
  { value: 'SSH_FAILED', label: 'SSH Failed' },
  { value: 'SSH_SUCCESS', label: 'SSH Success' },
  { value: 'FAIL2BAN_BAN', label: 'Bans' },
  { value: 'SUSPICIOUS_LOGIN', label: 'Suspicious' },
  { value: 'MANUAL_BAN', label: 'Manual Actions' },
];

function StatCard({ icon: Icon, label, value, sublabel, color, bg }) {
  return (
    <div className="bg-white rounded-xl border border-[#E8E5E0] p-4 sm:p-5">
      <div className={`w-9 h-9 sm:w-10 sm:h-10 ${bg} rounded-xl flex items-center justify-center mb-2 sm:mb-3`}>
        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-[#0E0E0F]">{value ?? 0}</p>
      <p className="text-xs sm:text-sm text-[#6B6F76] mt-0.5">{label}</p>
      {sublabel && <p className="text-xs text-[#9B9B9B] mt-0.5">{sublabel}</p>}
    </div>
  );
}

function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.INFO;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

function EventRow({ event, onResolve }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.INFO;

  return (
    <div className={`border-b border-[#F0EEE9] ${event.resolved ? 'opacity-60' : ''}`}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#FAF8F5] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-2 h-2 rounded-full ${cfg.color.replace('text-', 'bg-')} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#0E0E0F]">
              {EVENT_TYPE_LABELS[event.type] || event.type}
            </span>
            <SeverityBadge severity={event.severity} />
            {event.resolved && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                <CheckCircle size={12} /> Resolved
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B6F76] mt-0.5 truncate">{event.description}</p>
        </div>
        {event.ipAddress && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#6B6F76] flex-shrink-0">
            <Globe size={12} />
            <span className="font-mono">{event.ipAddress}</span>
          </div>
        )}
        <div className="text-xs text-[#9B9B9B] flex-shrink-0 hidden md:block">
          {new Date(event.createdAt).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </div>
        <ChevronDown size={14} className={`text-[#9B9B9B] transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </div>
      {expanded && (
        <div className="px-4 pb-3 bg-[#FAF8F5]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {event.ipAddress && (
              <div><span className="text-[#9B9B9B]">IP:</span> <span className="font-mono text-[#0E0E0F]">{event.ipAddress}</span></div>
            )}
            {event.port && (
              <div><span className="text-[#9B9B9B]">Port:</span> <span className="font-mono text-[#0E0E0F]">{event.port}</span></div>
            )}
            {event.country && (
              <div><span className="text-[#9B9B9B]">Country:</span> <span className="text-[#0E0E0F]">{event.country}</span></div>
            )}
            <div><span className="text-[#9B9B9B]">Source:</span> <span className="text-[#0E0E0F]">{event.source}</span></div>
          </div>
          {event.details && (
            <pre className="mt-2 text-xs bg-white border border-[#E8E5E0] rounded-lg p-2 overflow-x-auto text-[#6B6F76]">
              {JSON.stringify(event.details, null, 2)}
            </pre>
          )}
          {!event.resolved && (
            <button
              onClick={(e) => { e.stopPropagation(); onResolve(event.id); }}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
            >
              <CheckCircle size={12} /> Mark Resolved
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function BannedIPRow({ ip, onUnban }) {
  const [unbanning, setUnbanning] = useState(false);
  const expired = ip.expiresAt && new Date(ip.expiresAt) < new Date();

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F0EEE9] hover:bg-[#FAF8F5] transition-colors">
      <div className={`w-2 h-2 rounded-full ${expired ? 'bg-gray-300' : 'bg-red-500'} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-[#0E0E0F]">{ip.ipAddress}</span>
          {ip.source === 'manual' && (
            <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold">Manual</span>
          )}
        </div>
        <p className="text-xs text-[#6B6F76] mt-0.5">{ip.reason || `Banned in ${ip.jail}`}</p>
      </div>
      <div className="text-xs text-[#9B9B9B] hidden sm:block text-right">
        <div>Banned {new Date(ip.bannedAt).toLocaleDateString()}</div>
        {ip.expiresAt && <div className={expired ? 'text-gray-400' : 'text-orange-500'}>
          {expired ? 'Expired' : `Expires ${new Date(ip.expiresAt).toLocaleTimeString()}`}
        </div>}
      </div>
      <button
        onClick={() => { setUnbanning(true); onUnban(ip.ipAddress).finally(() => setUnbanning(false)); }}
        disabled={unbanning}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50 flex-shrink-0"
      >
        {unbanning ? <RefreshCw size={12} className="animate-spin" /> : <Ban size={12} />}
        Unban
      </button>
    </div>
  );
}

function SystemStatusCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-[#E8E5E0] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E8E5E0] flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#F2782E]" />
        <h3 className="text-sm font-bold text-[#0E0E0F]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function StatusRow({ label, value, status }) {
  const statusColor = status === 'ok' ? 'text-green-600' : status === 'warn' ? 'text-yellow-600' : status === 'bad' ? 'text-red-600' : 'text-[#6B6F76]';
  const dotColor = status === 'ok' ? 'bg-green-500' : status === 'warn' ? 'bg-yellow-500' : status === 'bad' ? 'bg-red-500' : 'bg-gray-300';

  return (
    <div className="flex items-center justify-between py-2 border-b border-[#F5F3F0] last:border-0">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span className="text-sm text-[#6B6F76]">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${statusColor}`}>{value}</span>
    </div>
  );
}

export default function SecurityPanel({ apiCall }) {
  const [activeTab, setActiveTab] = useState('feed');
  const [overview, setOverview] = useState(null);
  const [events, setEvents] = useState([]);
  const [bannedIPs, setBannedIPs] = useState([]);
  const [stats, setStats] = useState(null);
  const [latestReport, setLatestReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [bannedLoading, setBannedLoading] = useState(false);
  const [eventFilter, setEventFilter] = useState('all');
  const [eventPage, setEventPage] = useState(1);
  const [eventTotalPages, setEventTotalPages] = useState(1);
  const [banIPInput, setBanIPInput] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banLoading, setBanLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSystemDetails, setShowSystemDetails] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const r = await apiCall('/api/security/overview');
      if (r.ok) {
        const data = await r.json();
        setOverview(data);
        setLatestReport(data.latestReport);
      }
    } catch (e) { console.error(e); }
  }, [apiCall]);

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const typeParam = eventFilter !== 'all' ? `&type=${eventFilter}` : '';
      const r = await apiCall(`/api/security/events?page=${eventPage}&limit=50${typeParam}`);
      if (r.ok) {
        const data = await r.json();
        setEvents(data.events);
        setEventTotalPages(data.pagination.totalPages);
      }
    } catch (e) { console.error(e); }
    finally { setEventsLoading(false); }
  }, [apiCall, eventFilter, eventPage]);

  const fetchBanned = useCallback(async () => {
    setBannedLoading(true);
    try {
      const r = await apiCall('/api/security/banned?limit=100');
      if (r.ok) {
        const data = await r.json();
        setBannedIPs(data.banned);
      }
    } catch (e) { console.error(e); }
    finally { setBannedLoading(false); }
  }, [apiCall]);

  const fetchStats = useCallback(async () => {
    try {
      const r = await apiCall('/api/security/stats?days=7');
      if (r.ok) setStats(await r.json());
    } catch (e) { console.error(e); }
  }, [apiCall]);

  useEffect(() => {
    Promise.all([fetchOverview(), fetchEvents(), fetchBanned(), fetchStats()])
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchEvents(); }, [eventFilter, eventPage]);
  useEffect(() => {
    if (activeTab === 'banned') fetchBanned();
    if (activeTab === 'stats') fetchStats();
  }, [activeTab]);

  const handleBanIP = async (e) => {
    e.preventDefault();
    if (!banIPInput) return;
    setBanLoading(true);
    setError(null);
    try {
      const r = await apiCall('/api/security/ban', {
        method: 'POST',
        body: JSON.stringify({ ipAddress: banIPInput, reason: banReason }),
      });
      if (r.ok) {
        setBanIPInput('');
        setBanReason('');
        fetchBanned();
        fetchOverview();
      } else {
        const data = await r.json();
        setError(data.error || 'Failed to ban IP');
      }
    } catch (e) { setError('Network error'); }
    finally { setBanLoading(false); }
  };

  const handleUnban = async (ip) => {
    try {
      const r = await apiCall('/api/security/unban', {
        method: 'POST',
        body: JSON.stringify({ ipAddress: ip }),
      });
      if (r.ok) { fetchBanned(); fetchOverview(); }
    } catch (e) { console.error(e); }
  };

  const handleResolve = async (eventId) => {
    try {
      const r = await apiCall(`/api/security/events/${eventId}/resolve`, { method: 'POST' });
      if (r.ok) fetchEvents();
    } catch (e) { console.error(e); }
  };

  const handleRefresh = () => {
    fetchOverview();
    fetchEvents();
    fetchBanned();
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#F2782E] border-t-transparent" />
      </div>
    );
  }

  const f2b = latestReport?.fail2banStats || {};
  const sshCfg = latestReport?.sshConfig || {};
  const disk = latestReport?.diskUsage || {};
  const mem = latestReport?.memoryUsage || {};
  const dockerPorts = latestReport?.dockerPorts || [];
  const ufwRules = latestReport?.ufwRules || [];
  const activeConn = latestReport?.activeConnections || {};

  const TABS = [
    { key: 'feed', label: 'Threat Feed', icon: Activity },
    { key: 'banned', label: 'Banned IPs', icon: Ban },
    { key: 'system', label: 'System Status', icon: Server },
    { key: 'stats', label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#0E0E0F] flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#F2782E]" />
            Security Center
          </h2>
          <p className="text-[#6B6F76] text-sm mt-1">Monitor VPS security, intrusion attempts, and firewall status</p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E5E0] rounded-xl text-sm font-bold text-[#0E0E0F] hover:border-[#F2782E] transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 font-bold">&times;</button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={ShieldAlert}
          label="Failed SSH (24h)"
          value={overview?.failedSSH24h ?? 0}
          sublabel={stats ? `${stats.total} events (7d)` : ''}
          color="text-red-600" bg="bg-red-50"
        />
        <StatCard
          icon={Ban}
          label="Active Bans"
          value={overview?.activeBans ?? 0}
          sublabel={`${overview?.bans24h ?? 0} new (24h)`}
          color="text-orange-600" bg="bg-orange-50"
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical (24h)"
          value={overview?.criticalEvents ?? 0}
          sublabel={`${overview?.highEvents ?? 0} high severity`}
          color="text-purple-600" bg="bg-purple-50"
        />
        <StatCard
          icon={ShieldCheck}
          label="Firewall"
          value={latestReport?.ufwStatus?.includes('active') ? 'Active' : 'Unknown'}
          sublabel={sshCfg.passwordAuth === 'no' ? 'SSH: Key-only' : 'SSH: Check config'}
          color={latestReport?.ufwStatus?.includes('active') ? 'text-green-600' : 'text-yellow-600'}
          bg={latestReport?.ufwStatus?.includes('active') ? 'bg-green-50' : 'bg-yellow-50'}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-[#E8E5E0] p-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#FDF1E8] text-[#F2782E]'
                : 'text-[#6B6F76] hover:bg-[#F7F5F2]'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Threat Feed Tab ── */}
      {activeTab === 'feed' && (
        <div className="bg-white rounded-xl border border-[#E8E5E0] overflow-hidden">
          <div className="p-4 border-b border-[#E8E5E0] flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-sm font-bold text-[#0E0E0F]">Live Threat Feed</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B6F76]" />
                <select
                  value={eventFilter}
                  onChange={(e) => { setEventFilter(e.target.value); setEventPage(1); }}
                  className="pl-8 pr-3 py-1.5 border border-[#E8E5E0] rounded-lg text-xs bg-white appearance-none focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                >
                  {EVENT_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {eventsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#F2782E] border-t-transparent" />
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center">
              <ShieldCheck className="h-10 w-10 text-green-400 mx-auto mb-3" />
              <p className="text-[#6B6F76] text-sm">No security events recorded</p>
              <p className="text-[#9B9B9B] text-xs mt-1">Events will appear here when the VPS agent reports them</p>
            </div>
          ) : (
            <>
              <div className="max-h-[600px] overflow-y-auto">
                {events.map(evt => <EventRow key={evt.id} event={evt} onResolve={handleResolve} />)}
              </div>
              {eventTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#E8E5E0]">
                  <span className="text-xs text-[#6B6F76]">Page {eventPage} of {eventTotalPages}</span>
                  <div className="flex gap-2">
                    <button disabled={eventPage <= 1} onClick={() => setEventPage(p => p - 1)}
                      className="px-3 py-1 text-xs border border-[#E8E5E0] rounded-lg disabled:opacity-40 hover:border-[#0E0E0F]">Prev</button>
                    <button disabled={eventPage >= eventTotalPages} onClick={() => setEventPage(p => p + 1)}
                      className="px-3 py-1 text-xs border border-[#E8E5E0] rounded-lg disabled:opacity-40 hover:border-[#0E0E0F]">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Banned IPs Tab ── */}
      {activeTab === 'banned' && (
        <div className="space-y-4">
          {/* Manual ban form */}
          <div className="bg-white rounded-xl border border-[#E8E5E0] p-4">
            <h3 className="text-sm font-bold text-[#0E0E0F] mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#F2782E]" /> Manual IP Ban
            </h3>
            <form onSubmit={handleBanIP} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={banIPInput}
                onChange={(e) => setBanIPInput(e.target.value)}
                placeholder="IP address (e.g. 192.168.1.1)"
                className="flex-1 px-3 py-2 border border-[#E8E5E0] rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                required
              />
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason (optional)"
                className="flex-1 px-3 py-2 border border-[#E8E5E0] rounded-lg text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={banLoading}
                className="px-4 py-2 bg-[#F2782E] text-white rounded-lg text-sm font-bold hover:bg-[#E0641C] transition-colors disabled:opacity-50"
              >
                {banLoading ? 'Banning...' : 'Ban IP'}
              </button>
            </form>
          </div>

          {/* Banned IPs list */}
          <div className="bg-white rounded-xl border border-[#E8E5E0] overflow-hidden">
            <div className="p-4 border-b border-[#E8E5E0] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0E0E0F]">Currently Banned IPs</h3>
              <span className="text-xs text-[#6B6F76]">{bannedIPs.length} active</span>
            </div>
            {bannedLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#F2782E] border-t-transparent" />
              </div>
            ) : bannedIPs.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
                <p className="text-[#6B6F76] text-sm">No IPs currently banned</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {bannedIPs.map(ip => <BannedIPRow key={ip.id} ip={ip} onUnban={handleUnban} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── System Status Tab ── */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          {!latestReport ? (
            <div className="bg-white rounded-xl border border-[#E8E5E0] py-16 text-center">
              <Server className="h-10 w-10 text-[#6B6F76] mx-auto mb-3" />
              <p className="text-[#6B6F76] text-sm">No system reports available yet</p>
              <p className="text-[#9B9B9B] text-xs mt-1">Reports will appear once the VPS agent starts sending data</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Server Info */}
                <SystemStatusCard title="Server Info" icon={Server}>
                  <StatusRow label="Hostname" value={latestReport.hostname} />
                  <StatusRow label="Uptime" value={latestReport.uptime || 'Unknown'} />
                  <StatusRow label="Load Average" value={latestReport.loadAverage || 'Unknown'} />
                  <StatusRow label="Established Connections" value={activeConn.totalEstablished ?? 'Unknown'} />
                  <StatusRow label="SSH Connections" value={activeConn.sshConnections ?? 'Unknown'} />
                </SystemStatusCard>

                {/* Firewall */}
                <SystemStatusCard title="Firewall (UFW)" icon={Shield}>
                  <StatusRow
                    label="Status"
                    value={latestReport.ufwStatus || 'Unknown'}
                    status={latestReport.ufwStatus?.includes('active') ? 'ok' : 'bad'}
                  />
                  {ufwRules.map((rule, i) => (
                    <StatusRow key={i} label={rule.split(' ')[0]} value={rule} status="ok" />
                  ))}
                </SystemStatusCard>

                {/* SSH Config */}
                <SystemStatusCard title="SSH Configuration" icon={Lock}>
                  <StatusRow
                    label="Password Auth"
                    value={sshCfg.passwordAuth || 'Unknown'}
                    status={sshCfg.passwordAuth === 'no' ? 'ok' : 'bad'}
                  />
                  <StatusRow
                    label="Cloud-init Override"
                    value={sshCfg.cloudInitOverride || 'Not found'}
                    status={sshCfg.cloudInitOverride === 'no' ? 'ok' : sshCfg.cloudInitOverride === 'not found' ? 'ok' : 'bad'}
                  />
                  <StatusRow label="Permit Root Login" value={sshCfg.permitRootLogin || 'Unknown'} />
                  <StatusRow label="Max Auth Tries" value={sshCfg.maxAuthTries || 'Default'} />
                  <StatusRow
                    label="Authorized Keys"
                    value={`${sshCfg.authorizedKeysCount || 0} key(s)`}
                    status={sshCfg.authorizedKeysCount <= 1 ? 'ok' : 'warn'}
                  />
                  <StatusRow
                    label="authorized_keys2"
                    value={sshCfg.authorizedKeys2Exists ? 'EXISTS' : 'Removed'}
                    status={sshCfg.authorizedKeys2Exists ? 'bad' : 'ok'}
                  />
                </SystemStatusCard>

                {/* fail2ban */}
                <SystemStatusCard title="Fail2ban" icon={ShieldAlert}>
                  <StatusRow label="Currently Banned" value={f2b.currentlyBanned ?? 0} status={f2b.currentlyBanned > 0 ? 'warn' : 'ok'} />
                  <StatusRow label="Currently Failed" value={f2b.currentlyFailed ?? 0} status={f2b.currentlyFailed > 0 ? 'warn' : 'ok'} />
                  <StatusRow label="Total Banned (all time)" value={f2b.totalBanned ?? 0} />
                  <StatusRow label="Active Jails" value={f2b.jails || 'Unknown'} />
                </SystemStatusCard>

                {/* Disk & Memory */}
                <SystemStatusCard title="Disk & Memory" icon={HardDrive}>
                  <StatusRow
                    label="Disk Usage"
                    value={disk.usePercent || 'Unknown'}
                    status={parseInt(disk.usePercent) > 80 ? 'bad' : parseInt(disk.usePercent) > 60 ? 'warn' : 'ok'}
                  />
                  <StatusRow label="Disk Total" value={disk.total || 'Unknown'} />
                  <StatusRow label="Disk Available" value={disk.avail || 'Unknown'} />
                  <StatusRow
                    label="Memory Used"
                    value={mem.used ? `${mem.used} MB / ${mem.total} MB` : 'Unknown'}
                    status={mem.used && mem.total && (mem.used / mem.total) > 0.85 ? 'warn' : 'ok'}
                  />
                  <StatusRow label="Memory Available" value={mem.available ? `${mem.available} MB` : 'Unknown'} />
                </SystemStatusCard>

                {/* Docker Ports */}
                <SystemStatusCard title="Docker Containers" icon={Container}>
                  {dockerPorts.length === 0 ? (
                    <StatusRow label="No containers" value="—" />
                  ) : (
                    dockerPorts.map((c, i) => {
                      const exposed = c.ports && c.ports.includes('0.0.0.0');
                      return (
                        <StatusRow
                          key={i}
                          label={c.container}
                          value={c.ports || 'No ports'}
                          status={exposed ? 'bad' : 'ok'}
                        />
                      );
                    })
                  )}
                </SystemStatusCard>
              </div>

              {/* Last report time */}
              <div className="text-center text-xs text-[#9B9B9B]">
                Last report: {new Date(latestReport.createdAt).toLocaleString()}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Statistics Tab ── */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          {!stats ? (
            <div className="bg-white rounded-xl border border-[#E8E5E0] py-16 text-center">
              <Activity className="h-10 w-10 text-[#6B6F76] mx-auto mb-3" />
              <p className="text-[#6B6F76] text-sm">No statistics available yet</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Activity} label="Total Events (7d)" value={stats.total} color="text-blue-600" bg="bg-blue-50" />
                <StatCard icon={Ban} label="Bans (7d)" value={stats.byType.find(t => t.type === 'FAIL2BAN_BAN')?.count || 0} color="text-orange-600" bg="bg-orange-50" />
                <StatCard icon={ShieldAlert} label="Failed SSH (7d)" value={stats.byType.find(t => t.type === 'SSH_FAILED')?.count || 0} color="text-red-600" bg="bg-red-50" />
                <StatCard icon={Globe} label="Unique IPs (7d)" value={stats.topAttackers.length} color="text-purple-600" bg="bg-purple-50" />
              </div>

              {/* Events by day */}
              <div className="bg-white rounded-xl border border-[#E8E5E0] p-4">
                <h3 className="text-sm font-bold text-[#0E0E0F] mb-4">Events Over Time (7 days)</h3>
                {stats.byDay.length === 0 ? (
                  <p className="text-[#6B6F76] text-sm text-center py-8">No data</p>
                ) : (
                  <div className="flex items-end gap-2 h-40">
                    {stats.byDay.map(day => {
                      const maxCount = Math.max(...stats.byDay.map(d => d.count), 1);
                      const height = (day.count / maxCount) * 100;
                      return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-[#0E0E0F]">{day.count}</span>
                          <div
                            className="w-full bg-gradient-to-t from-[#F2782E] to-[#E0641C] rounded-t-md transition-all"
                            style={{ height: `${height}%`, minHeight: '4px' }}
                          />
                          <span className="text-xs text-[#9B9B9B]">{day.date.slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top attacker IPs */}
              <div className="bg-white rounded-xl border border-[#E8E5E0] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E8E5E0]">
                  <h3 className="text-sm font-bold text-[#0E0E0F]">Top Attacker IPs (7d)</h3>
                </div>
                {stats.topAttackers.length === 0 ? (
                  <div className="py-8 text-center text-[#6B6F76] text-sm">No attacker data</div>
                ) : (
                  <div className="divide-y divide-[#F0EEE9]">
                    {stats.topAttackers.map((attacker, i) => (
                      <div key={attacker.ip} className="flex items-center gap-3 px-4 py-3">
                        <span className="text-xs font-bold text-[#9B9B9B] w-6">#{i + 1}</span>
                        <Globe className="h-4 w-4 text-[#6B6F76]" />
                        <span className="font-mono text-sm text-[#0E0E0F] flex-1">{attacker.ip}</span>
                        <span className="text-sm font-bold text-[#F2782E]">{attacker.count} events</span>
                        <button
                          onClick={() => { setBanIPInput(attacker.ip); setActiveTab('banned'); }}
                          className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-bold hover:bg-red-100"
                        >
                          Ban
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Events by type */}
              <div className="bg-white rounded-xl border border-[#E8E5E0] p-4">
                <h3 className="text-sm font-bold text-[#0E0E0F] mb-4">Events by Type</h3>
                <div className="space-y-2">
                  {stats.byType.map(item => {
                    const maxCount = Math.max(...stats.byType.map(t => t.count), 1);
                    const width = (item.count / maxCount) * 100;
                    return (
                      <div key={item.type} className="flex items-center gap-3">
                        <span className="text-xs text-[#6B6F76] w-32 truncate">{EVENT_TYPE_LABELS[item.type] || item.type}</span>
                        <div className="flex-1 bg-[#F7F5F2] rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#F2782E] to-[#E0641C] rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${width}%`, minWidth: '30px' }}
                          >
                            <span className="text-xs font-bold text-white">{item.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
