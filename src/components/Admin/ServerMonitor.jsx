import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Server, Activity, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Cpu, HardDrive, MemoryStick, Clock, Zap, Power, RotateCw,
  Globe, ChevronDown, ChevronRight, Loader2, Gauge,
  Network, AlertOctagon, ListChecks, Wrench, History, Bell,
  Pause, Play, ArrowUpCircle, ArrowDownCircle, Box, Database,
  Layers, Container
} from 'lucide-react';

const STATUS_CONFIG = {
  healthy:  { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Healthy', icon: CheckCircle },
  degraded: { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500',   label: 'Degraded', icon: AlertTriangle },
  down:     { color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200',     dot: 'bg-red-500',     label: 'Down', icon: XCircle },
};

const TYPE_CONFIG = {
  pm2:     { label: 'PM2',     icon: Server,    color: 'text-blue-600',    bg: 'bg-blue-50' },
  docker:   { label: 'Docker',  icon: Container, color: 'text-cyan-600',    bg: 'bg-cyan-50' },
  standalone: { label: 'Standalone', icon: Box, color: 'text-purple-600',  bg: 'bg-purple-50' },
};

const ROLE_CONFIG = {
  app:   { label: 'App',      icon: Server,    color: 'text-gray-500' },
  web:   { label: 'Web',      icon: Globe,     color: 'text-gray-500' },
  db:    { label: 'Database', icon: Database,  color: 'text-amber-600' },
  cache: { label: 'Cache',    icon: Zap,        color: 'text-red-500' },
};

function formatBytes(mb) {
  if (mb == null) return '—';
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

function formatDuration(seconds) {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatTimeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Type Badge ─────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.standalone;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ── Role Badge ──────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.app;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ── System Metrics Card ─────────────────────────────────────────────────────
function SystemMetricCard({ icon: Icon, label, value, sub, color, bg, warn }) {
  return (
    <div className={`bg-white rounded-xl border p-4 sm:p-5 ${warn ? 'border-red-300' : 'border-[#E8E5E0]'}`}>
      <div className={`w-9 h-9 sm:w-10 sm:h-10 ${bg} rounded-xl flex items-center justify-center mb-2 sm:mb-3`}>
        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-[#0E0E0F]">{value}</p>
      <p className="text-xs sm:text-sm text-[#6B6F76] mt-0.5">{label}</p>
      {sub && <p className="text-xs text-[#9B9B9B] mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Health Timeline ─────────────────────────────────────────────────────────
function HealthTimeline({ serviceId, apiCall }) {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const r = await apiCall(`/api/monitoring/history?serviceId=${encodeURIComponent(serviceId)}&hours=24`);
      if (r.ok) {
        const data = await r.json();
        setSnapshots(data.snapshots || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [apiCall, serviceId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const buckets = Array.from({ length: 24 }, (_, i) => {
    const hourStart = Date.now() - (23 - i) * 3600 * 1000;
    const hourEnd = hourStart + 3600 * 1000;
    const inRange = snapshots.filter(s => {
      const t = new Date(s.timestamp).getTime();
      return t >= hourStart && t < hourEnd;
    });
    if (inRange.length === 0) return { hour: i, status: 'no-data', count: 0 };
    const hasDown = inRange.some(s => s.status === 'down');
    const hasDegraded = inRange.some(s => s.status === 'degraded');
    return {
      hour: i,
      status: hasDown ? 'down' : hasDegraded ? 'degraded' : 'healthy',
      count: inRange.length,
      label: new Date(hourStart).toLocaleTimeString('en', { hour: 'numeric' }),
    };
  });

  const bucketColor = {
    healthy: 'bg-emerald-500',
    degraded: 'bg-amber-500',
    down: 'bg-red-500',
    'no-data': 'bg-gray-200',
  };

  if (loading) return <div className="px-4 py-2 text-xs text-[#9B9B9B]">Loading history...</div>;

  return (
    <div className="px-4 pb-3 pt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-[#6B6F76] hover:text-[#0E0E0F] mb-2"
      >
        <History className="h-3 w-3" />
        24h history
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {expanded && (
        <div className="flex items-end gap-0.5 h-8">
          {buckets.map((b, i) => (
            <div
              key={i}
              className={`flex-1 ${bucketColor[b.status]} rounded-sm`}
              style={{ height: '100%', minHeight: '4px', opacity: b.status === 'no-data' ? 0.3 : 1 }}
              title={`${b.label}:00 — ${b.status} (${b.count} checks)`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Service Card ────────────────────────────────────────────────────────────
function ServiceCard({ service, onRestart, restarting, apiCall }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[service.overall] || STATUS_CONFIG.degraded;
  const StatusIcon = cfg.icon;
  const isRestarting = restarting === service.id;
  const canRestart = (service.pm2Name || service.dockerContainer) && !service.skipRestart;

  return (
    <div className={`bg-white rounded-xl border ${cfg.border} overflow-hidden transition-all`}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#FAF8F5] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} flex-shrink-0 ${service.overall === 'down' ? 'animate-pulse' : ''}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#0E0E0F]">{service.name}</span>
            <TypeBadge type={service.type} />
            <RoleBadge role={service.role} />
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-[#6B6F76] mt-0.5 truncate">{service.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {service.http?.latency != null && (
            <span className="text-xs text-[#9B9B9B] hidden sm:inline">{service.http.latency}ms</span>
          )}
          {canRestart && (
            <button
              onClick={(e) => { e.stopPropagation(); onRestart(service.id); }}
              disabled={isRestarting}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                isRestarting ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-[#0E0E0F] text-white hover:bg-[#F2782E]'
              }`}
              title={`Restart ${service.name}`}
            >
              {isRestarting ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
              {isRestarting ? '...' : 'Restart'}
            </button>
          )}
          {expanded ? <ChevronDown className="h-4 w-4 text-[#9B9B9B]" /> : <ChevronRight className="h-4 w-4 text-[#9B9B9B]" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#F0EEE9] bg-[#FAF8F5]">
          <div className="px-4 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {service.http?.httpCode != null && (
                <div>
                  <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">HTTP Status</p>
                  <p className="text-sm font-semibold text-[#0E0E0F] mt-0.5">{service.http.httpCode}</p>
                </div>
              )}
              {service.http?.latency != null && (
                <div>
                  <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">Latency</p>
                  <p className="text-sm font-semibold text-[#0E0E0F] mt-0.5">{service.http.latency}ms</p>
                </div>
              )}
              {service.port && (
                <div>
                  <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">Port</p>
                  <p className="text-sm font-semibold text-[#0E0E0F] mt-0.5">{service.port}</p>
                </div>
              )}
              {/* PM2 details */}
              {service.pm2?.status && (
                <>
                  <div>
                    <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">PM2 Status</p>
                    <p className="text-sm font-semibold text-[#0E0E0F] mt-0.5">{service.pm2.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">Restarts</p>
                    <p className="text-sm font-semibold text-[#0E0E0F] mt-0.5">{service.pm2.restarts ?? '—'}</p>
                  </div>
                  {service.pm2.pid && (
                    <div>
                      <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">PID</p>
                      <p className="text-sm font-semibold text-[#0E0E0F] mt-0.5">{service.pm2.pid}</p>
                    </div>
                  )}
                  {service.pm2.memory != null && (
                    <div>
                      <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">Memory</p>
                      <p className="text-sm font-semibold text-[#0E0E0F] mt-0.5">{formatBytes(service.pm2.memory / (1024 * 1024))}</p>
                    </div>
                  )}
                </>
              )}
              {/* Docker details */}
              {service.docker && (
                <>
                  <div>
                    <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">Container</p>
                    <p className="text-sm font-semibold text-[#0E0E0F] mt-0.5">{service.docker.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">Image</p>
                    <p className="text-sm font-semibold text-[#0E0E0F] mt-0.5 truncate">{service.docker.image}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">Health</p>
                    <p className="text-sm font-semibold text-[#0E0E0F] mt-0.5">{service.docker.health}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">Restarts</p>
                    <p className="text-sm font-semibold text-[#0E0E0F] mt-0.5">{service.docker.restartCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">Network</p>
                    <p className="text-sm font-semibold text-[#0E0E0F] mt-0.5">{service.docker.networkMode}</p>
                  </div>
                  {service.docker.ports?.length > 0 && (
                    <div className="col-span-2 sm:col-span-4">
                      <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">Port Mappings</p>
                      <p className="text-sm font-mono text-[#0E0E0F] mt-0.5">{service.docker.ports.join(', ')}</p>
                    </div>
                  )}
                </>
              )}
              {service.publicUrl && (
                <div className="col-span-2 sm:col-span-4">
                  <p className="text-xs text-[#9B9B9B] uppercase tracking-wide">Public URL</p>
                  <a href={service.publicUrl} target="_blank" rel="noopener noreferrer"
                     className="text-sm text-[#F2782E] hover:underline mt-0.5 inline-flex items-center gap-1">
                    {service.publicUrl}
                    <Globe className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
            {service.http?.error && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700 font-mono">{service.http.error}</p>
              </div>
            )}
          </div>
          {service.port && service.role !== 'db' && service.role !== 'cache' && (
            <HealthTimeline serviceId={service.id} apiCall={apiCall} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Project Section ──────────────────────────────────────────────────────────
function ProjectSection({ project, onRestart, onRestartProject, restarting, apiCall, projectType }) {
  const [expanded, setExpanded] = useState(true);
  const healthy = project.services.filter(s => s.overall === 'healthy').length;
  const degraded = project.services.filter(s => s.overall === 'degraded').length;
  const down = project.services.filter(s => s.overall === 'down').length;
  const total = project.services.length;

  const projectIcon = down > 0 ? AlertTriangle : degraded > 0 ? AlertTriangle : Layers;
  const projectColor = down > 0 ? 'text-red-500' : degraded > 0 ? 'text-amber-500' : 'text-emerald-500';
  const ProjectIcon = projectIcon;

  // Project type badge
  const typeBadge = projectType === 'docker'
    ? { label: 'Docker', icon: Container, color: 'text-cyan-600', bg: 'bg-cyan-50' }
    : projectType === 'pm2'
    ? { label: 'PM2', icon: Server, color: 'text-blue-600', bg: 'bg-blue-50' }
    : { label: 'Mixed', icon: Box, color: 'text-purple-600', bg: 'bg-purple-50' };
  const TypeIcon = typeBadge.icon;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 w-full">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <ProjectIcon className={`h-4 w-4 ${projectColor}`} />
          <h3 className="text-sm font-bold text-[#0E0E0F] uppercase tracking-wider">
            {project.name}
          </h3>
          {expanded ? <ChevronDown className="h-4 w-4 text-[#9B9B9B]" /> : <ChevronRight className="h-4 w-4 text-[#9B9B9B]" />}
        </button>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeBadge.bg} ${typeBadge.color}`}>
          <TypeIcon className="h-3 w-3" />
          {typeBadge.label}
        </span>
        <span className="text-xs text-[#6B6F76]">
          {healthy}/{total} healthy
          {degraded > 0 && <span className="text-amber-600 ml-1">· {degraded} degraded</span>}
          {down > 0 && <span className="text-red-600 ml-1">· {down} down</span>}
        </span>
        <button
          onClick={() => onRestartProject(project.name)}
          disabled={restarting === `project:${project.name}`}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border border-[#E8E5E0] text-[#6B6F76] hover:border-[#F2782E] hover:text-[#F2782E] transition-colors disabled:opacity-50"
          title={`Restart all services in ${project.name} (datastores first)`}
        >
          {restarting === `project:${project.name}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
          Restart project
        </button>
      </div>
      {expanded && (
        <div className="space-y-3">
          {project.services.map(svc => (
            <ServiceCard key={svc.id} service={svc} onRestart={onRestart} restarting={restarting} apiCall={apiCall} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Infrastructure Card ──────────────────────────────────────────────────────
function InfraCard({ label, status, onRestart, icon: Icon, restarting }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.down;
  return (
    <div className={`bg-white rounded-xl border ${cfg.border} p-4 flex items-center gap-3`}>
      <div className={`w-9 h-9 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-4 w-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0E0E0F]">{label}</p>
        <p className={`text-xs ${cfg.color}`}>{cfg.label}</p>
      </div>
      {onRestart && (
        <button
          onClick={onRestart}
          disabled={restarting}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0E0E0F] text-white hover:bg-[#F2782E] transition-colors disabled:opacity-50"
        >
          {restarting ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
          Restart
        </button>
      )}
    </div>
  );
}

// ── Incident Row ─────────────────────────────────────────────────────────────
function IncidentRow({ incident }) {
  const isActive = !incident.resolved_at;
  const cfg = isActive
    ? { icon: ArrowDownCircle, color: 'text-red-600', bg: 'bg-red-50' }
    : { icon: ArrowUpCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' };
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#F0EEE9] hover:bg-[#FAF8F5]">
      <div className={`w-7 h-7 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0E0E0F]">{incident.service_name}</p>
        <p className="text-xs text-[#6B6F76]">
          {isActive ? `Down since ${formatTimeAgo(incident.started_at)}` : `Recovered after ${formatDuration(incident.duration_seconds)}`}
        </p>
      </div>
      <span className={`text-xs font-semibold ${cfg.color}`}>
        {isActive ? 'Ongoing' : 'Resolved'}
      </span>
    </div>
  );
}

// ── Logs Panel ───────────────────────────────────────────────────────────────
function LogsPanel({ logs, loading }) {
  const [expanded, setExpanded] = useState(false);
  if (!logs.length && !loading) return null;

  return (
    <div className="bg-white rounded-xl border border-[#E8E5E0] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#FAF8F5] transition-colors"
      >
        <ListChecks className="h-4 w-4 text-[#6B6F76]" />
        <span className="text-sm font-semibold text-[#0E0E0F] flex-1 text-left">
          Health Check Logs ({logs.length})
        </span>
        {expanded ? <ChevronDown className="h-4 w-4 text-[#9B9B9B]" /> : <ChevronRight className="h-4 w-4 text-[#9B9B9B]" />}
      </button>
      {expanded && (
        <div className="border-t border-[#F0EEE9] max-h-64 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="px-4 py-2 border-b border-[#F0EEE9] hover:bg-[#FAF8F5]">
              {log.timestamp && <span className="text-xs text-[#9B9B9B] font-mono mr-2">{log.timestamp}</span>}
              <span className={`text-xs font-mono ${
                log.message?.includes('WARN') ? 'text-amber-600' :
                log.message?.includes('CRITICAL') ? 'text-red-600' : 'text-[#6B6F76]'
              }`}>{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ServerMonitor Component ────────────────────────────────────────────
export default function ServerMonitor({ apiCall }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restarting, setRestarting] = useState(null);
  const [restartDiag, setRestartDiag] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [maintenance, setMaintenance] = useState({ enabled: false });
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'docker' | 'pm2'
  const [rediscovering, setRediscovering] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const fetchHealth = useCallback(async () => {
    try {
      const r = await apiCall('/api/monitoring/health');
      if (r.ok) {
        const d = await r.json();
        setData(d);
        setMaintenance(d.maintenance || { enabled: false });
        setError(null);
      } else {
        const d = await r.json().catch(() => ({}));
        setError(d.error || `Health check failed: ${r.status}`);
      }
    } catch (e) {
      console.error(e);
      setError('Network error fetching health status');
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [apiCall]);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const r = await apiCall('/api/monitoring/logs');
      if (r.ok) { const d = await r.json(); setLogs(d.logs || []); }
    } catch (e) { console.error(e); }
    finally { setLogsLoading(false); }
  }, [apiCall]);

  const fetchIncidents = useCallback(async () => {
    try {
      const r = await apiCall('/api/monitoring/incidents?days=7');
      if (r.ok) { const d = await r.json(); setIncidents(d.incidents || []); }
    } catch (e) { console.error(e); }
  }, [apiCall]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === 1) return;

    const token = localStorage.getItem('portalToken');
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/monitoring/ws?token=${encodeURIComponent(token)}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => { setWsConnected(true); console.log('[monitor] WebSocket connected'); };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'health') {
            setData(msg.data);
            setMaintenance(msg.data?.maintenance || { enabled: false });
            setLastRefresh(new Date());
            setLoading(false);
          } else if (msg.type === 'maintenance') {
            setMaintenance(msg.data || { enabled: false });
          }
        } catch (e) { console.error('[monitor] WS parse error:', e); }
      };
      ws.onclose = () => {
        setWsConnected(false);
        wsRef.current = null;
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        reconnectTimer.current = setTimeout(connectWebSocket, 5000);
      };
      ws.onerror = () => { setWsConnected(false); };
    } catch (e) { console.error('[monitor] WebSocket error:', e); }
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchLogs();
    fetchIncidents();
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [fetchHealth, fetchLogs, fetchIncidents, connectWebSocket]);

  const handleRestart = async (serviceId) => {
    setRestarting(serviceId);
    setRestartDiag(null);
    try {
      const r = await apiCall(`/api/monitoring/restart/${encodeURIComponent(serviceId)}`, { method: 'POST' });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.success) {
        await fetchHealth(); await fetchIncidents();
      } else {
        setRestartDiag({
          serviceId,
          message: d.message || d.error || 'Restart failed',
          error: d.error,
          state: d.state,
          logs: d.logs || [],
        });
        await fetchHealth();
      }
    } catch (e) { setError('Network error during restart'); }
    finally { setRestarting(null); }
  };

  const handleRestartProject = async (projectName) => {
    if (!window.confirm(`Restart all services in '${projectName}'? Datastores restart first, then apps.`)) return;
    setRestarting(`project:${projectName}`);
    setRestartDiag(null);
    try {
      const r = await apiCall(`/api/monitoring/restart-project/${encodeURIComponent(projectName)}`, { method: 'POST' });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.success) {
        await fetchHealth(); await fetchIncidents();
      } else {
        setRestartDiag({
          serviceId: `project:${projectName}`,
          message: d.error || `Some services in '${projectName}' did not come up`,
          results: d.results || [],
        });
        await fetchHealth();
      }
    } catch (e) { setError('Network error during project restart'); }
    finally { setRestarting(null); }
  };

  const handleRediscover = async () => {
    setRediscovering(true);
    try {
      const r = await apiCall('/api/monitoring/rediscover', { method: 'POST' });
      if (r.ok) {
        await fetchHealth();
      } else {
        const d = await r.json().catch(() => ({}));
        setError(d.error || 'Re-discovery failed');
      }
    } catch (e) {
      setError('Network error during re-discovery');
    } finally {
      setRediscovering(false);
    }
  };

  const handleRestartAll = async () => {
    if (!window.confirm('Restart ALL PM2 services sequentially? Each service will be restarted one at a time with health checks between.')) return;
    setRestarting('all');
    try {
      const r = await apiCall('/api/monitoring/restart-all', { method: 'POST' });
      if (r.ok) { await fetchHealth(); await fetchIncidents(); }
      else { const d = await r.json().catch(() => ({})); setError(d.error || 'Restart all failed'); }
    } catch (e) { setError('Network error during restart all'); }
    finally { setRestarting(null); }
  };

  const handleRestartNginx = async () => {
    if (!window.confirm('Restart Nginx? This will briefly interrupt all public traffic.')) return;
    setRestarting('nginx');
    try {
      const r = await apiCall('/api/monitoring/restart-nginx', { method: 'POST' });
      if (r.ok) { await fetchHealth(); }
      else { const d = await r.json().catch(() => ({})); setError(d.error || 'Nginx restart failed'); }
    } catch (e) { setError('Network error during Nginx restart'); }
    finally { setRestarting(null); }
  };

  const handleToggleMaintenance = async () => {
    const newEnabled = !maintenance.enabled;
    const reason = newEnabled
      ? window.prompt('Reason for enabling maintenance mode?', 'Planned maintenance') || ''
      : 'Maintenance mode disabled';
    if (newEnabled && !reason) return;

    setMaintenanceLoading(true);
    try {
      const r = await apiCall('/api/monitoring/maintenance', {
        method: 'POST',
        body: JSON.stringify({ enabled: newEnabled, reason }),
      });
      if (r.ok) { const d = await r.json(); setMaintenance(d.maintenance); }
    } catch (e) { setError('Failed to toggle maintenance mode'); }
    finally { setMaintenanceLoading(false); }
  };

  // Split projects into Docker, PM2/standalone, and Mixed groups.
  // Must run before any early returns to keep hook order stable.
  const projectGroups = useMemo(() => {
    const projects = data?.projects;
    if (!projects) return { docker: [], pm2: [], mixed: [] };
    const docker = [];
    const pm2 = [];
    const mixed = [];
    for (const p of projects) {
      const hasDocker = p.services.some(s => s.type === 'docker');
      const hasPm2 = p.services.some(s => s.type === 'pm2' || s.type === 'standalone');
      if (hasDocker && hasPm2) mixed.push({ ...p, _type: 'mixed' });
      else if (hasDocker) docker.push({ ...p, _type: 'docker' });
      else pm2.push({ ...p, _type: 'pm2' });
    }
    return { docker, pm2, mixed };
  }, [data?.projects]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#F2782E]" />
        <span className="ml-3 text-[#6B6F76]">Discovering services...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertOctagon className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 font-semibold">{error}</p>
        <button onClick={fetchHealth} className="mt-3 px-4 py-2 bg-[#0E0E0F] text-white rounded-lg text-sm font-semibold hover:bg-[#F2782E]">
          Retry
        </button>
      </div>
    );
  }

  const { summary, projects, system, infrastructure } = data || {};
  const memWarn = system?.memory?.availablePct < 15;
  const diskWarn = system?.disk?.usedPct > 85;
  const swapWarn = system?.swap?.usedPct > 70;
  const activeIncidents = incidents.filter(i => !i.resolved_at);

  const filteredProjects = filter === 'docker'
    ? [...projectGroups.docker, ...projectGroups.mixed]
    : filter === 'pm2'
    ? [...projectGroups.pm2, ...projectGroups.mixed]
    : [...projectGroups.docker, ...projectGroups.pm2, ...projectGroups.mixed];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0E0E0F] rounded-xl flex items-center justify-center">
            <Server className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#0E0E0F]">Server Monitor</h2>
            <p className="text-xs text-[#6B6F76] flex items-center gap-2">
              {wsConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live (WebSocket)
                  {lastRefresh && <span>· Updated {formatTimeAgo(lastRefresh.toISOString())}</span>}
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  Disconnected {lastRefresh && `· Last: ${formatTimeAgo(lastRefresh.toISOString())}`}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleToggleMaintenance}
            disabled={maintenanceLoading}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              maintenance.enabled
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-white border border-[#E8E5E0] text-[#0E0E0F] hover:bg-[#FAF8F5]'
            }`}
          >
            {maintenance.enabled ? <Pause className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
            {maintenance.enabled ? 'Maintenance ON' : 'Maintenance'}
          </button>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E8E5E0] rounded-lg text-sm font-semibold text-[#0E0E0F] hover:bg-[#FAF8F5] transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleRediscover}
            disabled={rediscovering}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E8E5E0] rounded-lg text-sm font-semibold text-[#0E0E0F] hover:bg-[#FAF8F5] transition-colors disabled:opacity-50"
            title="Force immediate re-discovery of all services (bypasses 60s interval)"
          >
            {rediscovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
            {rediscovering ? 'Discovering...' : 'Re-discover'}
          </button>
          <button
            onClick={handleRestartAll}
            disabled={restarting === 'all'}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0E0E0F] text-white rounded-lg text-sm font-semibold hover:bg-[#F2782E] transition-colors disabled:opacity-50"
          >
            {restarting === 'all' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
            Restart All PM2
          </button>
        </div>
      </div>

      {/* Maintenance banner */}
      {maintenance.enabled && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <Wrench className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Maintenance Mode is ON</p>
            <p className="text-xs text-amber-700 mt-1">
              Auto-restart is paused. Services will not be automatically restarted while in maintenance mode.
              {maintenance.set_by && ` Enabled by ${maintenance.set_by}.`}
              {maintenance.reason && ` Reason: ${maintenance.reason}.`}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {restartDiag && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">{restartDiag.message}</p>
                {restartDiag.error && <p className="text-xs text-amber-700 mt-1">{restartDiag.error}</p>}
                {restartDiag.state && <p className="text-xs text-amber-700 mt-0.5">Container state: <span className="font-mono">{restartDiag.state}</span></p>}
              </div>
            </div>
            <button onClick={() => setRestartDiag(null)} className="text-amber-600 hover:text-amber-800 text-xs font-semibold">Dismiss</button>
          </div>
          {restartDiag.results?.length > 0 && (
            <div className="mt-3 space-y-1">
              {restartDiag.results.map(r => (
                <div key={r.serviceId} className="flex items-center gap-2 text-xs">
                  {r.success ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                  <span className="font-semibold text-[#0E0E0F]">{r.name}</span>
                  <span className="text-[#6B6F76]">{r.success ? `— ${r.state}` : `— ${r.error || 'failed'}`}</span>
                </div>
              ))}
            </div>
          )}
          {restartDiag.logs?.length > 0 && (
            <pre className="mt-3 p-3 bg-[#0E0E0F] text-emerald-300 text-[11px] leading-relaxed rounded-lg overflow-x-auto max-h-48 overflow-y-auto font-mono">
              {restartDiag.logs.join('\n')}
            </pre>
          )}
        </div>
      )}

      {/* Summary bar */}
      {summary && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${summary.down > 0 ? 'bg-red-50 border-red-200' : summary.degraded > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <Gauge className={`h-5 w-5 ${summary.down > 0 ? 'text-red-500' : summary.degraded > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span className="text-sm font-bold text-[#0E0E0F]">{summary.healthy}/{summary.total} Healthy</span>
            {summary.degraded > 0 && <span className="text-xs text-amber-600 font-semibold">{summary.degraded} degraded</span>}
            {summary.down > 0 && <span className="text-xs text-red-600 font-semibold">{summary.down} down</span>}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white border-[#E8E5E0]">
            <Layers className="h-4 w-4 text-[#6B6F76]" />
            <span className="text-sm font-semibold text-[#0E0E0F]">{summary.projects} projects</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white border-[#E8E5E0]">
            <Container className="h-4 w-4 text-cyan-600" />
            <span className="text-sm font-semibold text-[#0E0E0F]">{summary.dockerContainers} Docker</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white border-[#E8E5E0]">
            <Server className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-[#0E0E0F]">{summary.pm2Processes} PM2</span>
          </div>
          {activeIncidents.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-red-50 border-red-200">
              <Bell className="h-4 w-4 text-red-500" />
              <span className="text-sm font-bold text-red-700">{activeIncidents.length} active incident{activeIncidents.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}

      {/* System metrics */}
      {system && (
        <div>
          <h3 className="text-sm font-bold text-[#6B6F76] uppercase tracking-wider mb-3">System Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <SystemMetricCard icon={Clock} label="Uptime" value={system.uptimeHuman || '—'} color="text-blue-600" bg="bg-blue-50" />
            <SystemMetricCard icon={Cpu} label="CPU Load (1m)" value={system.load?.['1min']?.toFixed(2) || '—'} sub={`5m: ${system.load?.['5min']?.toFixed(2) || '—'} · 15m: ${system.load?.['15min']?.toFixed(2) || '—'}`} color="text-purple-600" bg="bg-purple-50" />
            <SystemMetricCard icon={MemoryStick} label="Memory Used" value={`${system.memory?.usedPct || 0}%`} sub={`${formatBytes(system.memory?.used)} / ${formatBytes(system.memory?.total)}`} color={memWarn ? 'text-red-600' : 'text-emerald-600'} bg={memWarn ? 'bg-red-50' : 'bg-emerald-50'} warn={memWarn} />
            <SystemMetricCard icon={Activity} label="Memory Available" value={`${system.memory?.availablePct || 0}%`} sub={formatBytes(system.memory?.available)} color={memWarn ? 'text-red-600' : 'text-blue-600'} bg={memWarn ? 'bg-red-50' : 'bg-blue-50'} warn={memWarn} />
            <SystemMetricCard icon={HardDrive} label="Disk Used" value={`${system.disk?.usedPct || 0}%`} sub={`${system.disk?.available || '—'} avail`} color={diskWarn ? 'text-red-600' : 'text-amber-600'} bg={diskWarn ? 'bg-red-50' : 'bg-amber-50'} warn={diskWarn} />
            <SystemMetricCard icon={Zap} label="Swap Used" value={`${system.swap?.usedPct || 0}%`} sub={`${formatBytes(system.swap?.used)} / ${formatBytes(system.swap?.total)}`} color={swapWarn ? 'text-red-600' : 'text-gray-600'} bg={swapWarn ? 'bg-red-50' : 'bg-gray-50'} warn={swapWarn} />
          </div>
        </div>
      )}

      {/* Infrastructure */}
      {infrastructure && (
        <div>
          <h3 className="text-sm font-bold text-[#6B6F76] uppercase tracking-wider mb-3">Infrastructure</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfraCard label="Nginx" status={infrastructure.nginx?.status} icon={Network} onRestart={handleRestartNginx} restarting={restarting === 'nginx'} />
            <InfraCard label="PM2 Service (systemd)" status={infrastructure.pm2Service?.status} icon={Server} />
          </div>
        </div>
      )}

      {/* Projects — grouped by Docker / PM2 / Mixed */}
      {filteredProjects.length > 0 && (
        <div>
          {/* Filter toggle */}
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-bold text-[#6B6F76] uppercase tracking-wider">Projects</h3>
            <div className="flex items-center gap-1 ml-auto bg-white border border-[#E8E5E0] rounded-lg p-1">
              {[
                { key: 'all', label: 'All', count: projectGroups.docker.length + projectGroups.pm2.length + projectGroups.mixed.length },
                { key: 'docker', label: 'Docker', count: projectGroups.docker.length + projectGroups.mixed.length },
                { key: 'pm2', label: 'PM2', count: projectGroups.pm2.length + projectGroups.mixed.length },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    filter === f.key
                      ? 'bg-[#0E0E0F] text-white'
                      : 'text-[#6B6F76] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>

          {/* Docker Projects section */}
          {(filter === 'all' || filter === 'docker') && projectGroups.docker.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E8E5E0]">
                <Container className="h-4 w-4 text-cyan-600" />
                <h4 className="text-xs font-bold text-cyan-700 uppercase tracking-wider">Docker Projects</h4>
                <span className="text-xs text-[#9B9B9B]">{projectGroups.docker.length} projects</span>
              </div>
              <div className="space-y-6">
                {projectGroups.docker.map(project => (
                  <ProjectSection key={project.name} project={project} onRestart={handleRestart} onRestartProject={handleRestartProject} restarting={restarting} apiCall={apiCall} projectType="docker" />
                ))}
              </div>
            </div>
          )}

          {/* PM2 / Standalone Projects section */}
          {(filter === 'all' || filter === 'pm2') && projectGroups.pm2.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E8E5E0]">
                <Server className="h-4 w-4 text-blue-600" />
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">PM2 / Standalone Projects</h4>
                <span className="text-xs text-[#9B9B9B]">{projectGroups.pm2.length} projects</span>
              </div>
              <div className="space-y-6">
                {projectGroups.pm2.map(project => (
                  <ProjectSection key={project.name} project={project} onRestart={handleRestart} onRestartProject={handleRestartProject} restarting={restarting} apiCall={apiCall} projectType="pm2" />
                ))}
              </div>
            </div>
          )}

          {/* Mixed Projects section (has both Docker and PM2) */}
          {projectGroups.mixed.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E8E5E0]">
                <Box className="h-4 w-4 text-purple-600" />
                <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider">Mixed Projects (Docker + PM2)</h4>
                <span className="text-xs text-[#9B9B9B]">{projectGroups.mixed.length} projects</span>
              </div>
              <div className="space-y-6">
                {projectGroups.mixed.map(project => (
                  <ProjectSection key={project.name} project={project} onRestart={handleRestart} onRestartProject={handleRestartProject} restarting={restarting} apiCall={apiCall} projectType="mixed" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent incidents */}
      {incidents.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#6B6F76] uppercase tracking-wider mb-3">Recent Incidents (7 days)</h3>
          <div className="bg-white rounded-xl border border-[#E8E5E0] overflow-hidden">
            {incidents.slice(0, 20).map(inc => <IncidentRow key={inc.id} incident={inc} />)}
          </div>
        </div>
      )}

      {/* Logs */}
      <LogsPanel logs={logs} loading={logsLoading} />

      {/* Warnings */}
      {memWarn && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Low Memory Warning</p>
            <p className="text-xs text-red-600 mt-1">Only {system?.memory?.availablePct}% memory available ({formatBytes(system?.memory?.available)}). Consider upgrading VPS RAM.</p>
          </div>
        </div>
      )}
      {diskWarn && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">High Disk Usage Warning</p>
            <p className="text-xs text-red-600 mt-1">Disk is {system?.disk?.usedPct}% full. Consider cleaning up old logs, backups, or Docker images.</p>
          </div>
        </div>
      )}
    </div>
  );
}
