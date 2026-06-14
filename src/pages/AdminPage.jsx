import React, { useState } from 'react';
import {
  Lock, LayoutDashboard, Code2, Shield, Plus, Edit2, Trash2,
  LogOut, Menu, MessageSquare, X, Save,
  CheckCircle2, AlertCircle, FileText, Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn, formatDateTime, statusConfig } from '../lib/utils';
import { useForm } from 'react-hook-form';

// ─── Login ───────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = onLogin(password);
      if (!ok) {
        setError('Invalid password. Please try again.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-brand-900/50">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Kreatix Technologies</p>
        </div>
        <div className="glass-card border border-white/5 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter admin password"
                className="input-field"
                autoFocus
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-gray-600 text-xs mt-4">
            Demo password: <span className="font-mono text-gray-500">kreatix@admin2024</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Project Form Modal ───────────────────────────
const categories = ['Web Application', 'Mobile Application', 'SaaS Platform', 'API / Backend'];

function ProjectModal({ project, onClose, onSave }) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: project || {
      title: '', category: 'Web Application', description: '',
      tags: '', thumbnail: '', demoUrl: '', demoImages: '', year: new Date().getFullYear(), featured: false,
    }
  });

  const onSubmit = (data) => {
    onSave({
      ...data,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      demoImages: data.demoImages ? data.demoImages.split('\n').map((u) => u.trim()).filter(Boolean) : [],
      demoType: data.demoUrl ? 'url' : 'images',
      year: Number(data.year),
      featured: !!data.featured,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-700 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-white font-bold">{project ? 'Edit Project' : 'Add New Project'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Project Title *</label>
              <input {...register('title', { required: 'Required' })} placeholder="e.g. FinTrack Pro" className="input-field" />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Category *</label>
              <select {...register('category')} className="input-field">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <input {...register('year')} type="number" min="2018" max="2030" className="input-field" />
            </div>
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea {...register('description', { required: 'Required' })} rows={3} placeholder="Describe the project..." className="input-field resize-none" />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="label">Tags (comma-separated)</label>
            <input {...register('tags')} placeholder="React, Node.js, PostgreSQL, AWS" className="input-field" />
            <p className="text-gray-500 text-xs mt-1">e.g. React, Node.js, AWS</p>
          </div>

          <div>
            <label className="label">Thumbnail URL *</label>
            <input {...register('thumbnail', { required: 'Required' })} placeholder="https://..." className="input-field" />
            {errors.thumbnail && <p className="text-red-400 text-xs mt-1">{errors.thumbnail.message}</p>}
          </div>

          <div>
            <label className="label">Live Demo URL (optional)</label>
            <input {...register('demoUrl')} placeholder="https://demo.yourapp.com" className="input-field" />
          </div>

          <div>
            <label className="label">Demo Screenshots (one URL per line)</label>
            <textarea {...register('demoImages')} rows={3} placeholder="https://image1.jpg&#10;https://image2.jpg" className="input-field resize-none font-mono text-sm" />
          </div>

          <div className="flex items-center gap-3">
            <input {...register('featured')} type="checkbox" id="featured" className="w-4 h-4 accent-brand-500 rounded" />
            <label htmlFor="featured" className="text-sm text-gray-300 cursor-pointer">Mark as Featured Project</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary text-sm px-6">Cancel</button>
            <button type="submit" className="btn-primary text-sm px-6">
              <Save size={14} />
              {project ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── VAPT Thread Modal ────────────────────────────
function VaptThreadModal({ request, onClose }) {
  const { addThreadMessage, updateVaptStatus } = useApp();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const status = statusConfig[request.status] || statusConfig.pending;

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setTimeout(() => {
      addThreadMessage(request.id, message.trim(), 'admin');
      setMessage('');
      setSending(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-dark-700 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <p className="text-xs text-gray-500 font-mono">{request.id}</p>
            <h3 className="text-white font-bold">{request.serviceType}</h3>
            <p className="text-gray-400 text-xs">{request.companyName} · {request.contactName}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={request.status}
              onChange={(e) => updateVaptStatus(request.id, e.target.value)}
              className="input-field text-xs py-1.5 px-3 w-40"
            >
              {Object.entries(statusConfig).map(([val, cfg]) => (
                <option key={val} value={val}>{cfg.label}</option>
              ))}
            </select>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-3 border-b border-white/5 bg-dark-600/40 text-xs text-gray-400 grid grid-cols-2 gap-2">
          <span><b className="text-gray-300">Email:</b> {request.email}</span>
          <span><b className="text-gray-300">Phone:</b> {request.phone || 'N/A'}</span>
          <span><b className="text-gray-300">Environment:</b> {request.targetEnvironment}</span>
          <span><b className="text-gray-300">Timeline:</b> {request.timeline}</span>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {request.thread.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3', msg.role === 'admin' ? 'flex-row-reverse' : '')}>
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
                msg.role === 'system' ? 'bg-gray-700 text-gray-300' :
                msg.role === 'admin' ? 'bg-brand-600 text-white' :
                'bg-accent-500/30 text-accent-300'
              )}>
                {msg.role === 'system' ? '🔔' : msg.role === 'admin' ? 'KT' : 'C'}
              </div>
              <div className={cn('max-w-sm', msg.role === 'admin' ? 'items-end flex flex-col' : '')}>
                <div className={cn(
                  'rounded-2xl px-4 py-3 text-sm',
                  msg.role === 'system' ? 'bg-dark-500 text-gray-300' :
                  msg.role === 'admin' ? 'bg-brand-500/15 border border-brand-500/20 text-gray-100' :
                  'bg-dark-500/80 border border-white/5 text-gray-200'
                )}>
                  {msg.message}
                </div>
                <p className="text-xs text-gray-500 mt-1 px-1">{msg.author} · {formatDateTime(msg.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reply */}
        <div className="px-6 pb-6 pt-3 border-t border-white/5">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Reply to client..."
              className="input-field flex-1 text-sm py-2.5"
            />
            <button type="submit" disabled={sending || !message.trim()} className="btn-primary text-sm px-4 py-2.5 disabled:opacity-50">
              <Send size={14} />
              {sending ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar content (shared between desktop + mobile drawer) ─
function SidebarContent({ tabs, activeTab, setActiveTab, logoutAdmin, onClose }) {
  return (
    <>
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Admin Panel</p>
          <p className="text-white font-bold">Kreatix Technologies</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 md:hidden">
            <X size={18} />
          </button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); onClose?.(); }}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <tab.icon size={17} />
            {tab.label}
            {tab.badge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <button
          onClick={logoutAdmin}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );
}

// ─── Main Admin Dashboard ─────────────────────────
export default function AdminPage() {
  const { adminAuthenticated, loginAdmin, logoutAdmin, projects, addProject, updateProject, deleteProject, vaptRequests } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [projectModal, setProjectModal] = useState(null);
  const [vaptModal, setVaptModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!adminAuthenticated) {
    return <AdminLogin onLogin={loginAdmin} />;
  }

  const pendingVapt = vaptRequests.filter((r) => r.status === 'pending' || r.status === 'in_review').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: Code2 },
    { id: 'vapt', label: 'VAPT Requests', icon: Shield, badge: pendingVapt },
  ];

  const sidebarProps = { tabs, activeTab, setActiveTab, logoutAdmin };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-dark-800 border-r border-white/5 flex-col fixed top-0 left-0 h-full z-40">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Mobile drawer */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-72 bg-dark-800 border-r border-white/5 flex flex-col z-50 transition-transform duration-300 md:hidden',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent {...sidebarProps} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <main className="md:ml-64 flex-1 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-white/5 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
          >
            <Menu size={18} />
          </button>
          <span className="text-white font-semibold text-sm">Admin · {tabs.find(t => t.id === activeTab)?.label}</span>
          <button onClick={logoutAdmin} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400">
            <LogOut size={16} />
          </button>
        </div>
        <div className="p-4 md:p-8 flex-1">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Dashboard Overview</h2>
            <p className="text-gray-400 text-sm mb-8">Welcome back! Here's what's happening.</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Code2, label: 'Portfolio Projects', value: projects.length, color: 'text-brand-400', bg: 'bg-brand-500/10' },
                { icon: Shield, label: 'VAPT Requests', value: vaptRequests.length, color: 'text-red-400', bg: 'bg-red-500/10' },
                { icon: AlertCircle, label: 'Pending Review', value: pendingVapt, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { icon: CheckCircle2, label: 'Completed', value: vaptRequests.filter(r => r.status === 'completed').length, color: 'text-green-400', bg: 'bg-green-500/10' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="glass-card border border-white/5 p-5">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon size={20} className={color} />
                  </div>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-gray-400 text-sm">{label}</p>
                </div>
              ))}
            </div>

            {/* Recent VAPT requests */}
            <div className="glass-card border border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Recent VAPT Requests</h3>
                <button onClick={() => setActiveTab('vapt')} className="text-brand-400 text-sm hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {vaptRequests.slice(0, 3).map((r) => {
                  const st = statusConfig[r.status] || statusConfig.pending;
                  return (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-white text-sm font-medium">{r.companyName}</p>
                        <p className="text-gray-500 text-xs">{r.serviceType} · {r.id}</p>
                      </div>
                      <span className={`badge border ${st.color} text-xs`}>{st.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Portfolio Projects</h2>
                <p className="text-gray-400 text-sm">{projects.length} projects</p>
              </div>
              <button onClick={() => setProjectModal('new')} className="btn-primary text-sm">
                <Plus size={15} />
                Add Project
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="glass-card border border-white/5 p-4 flex items-center gap-4">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-semibold text-sm">{project.title}</p>
                      {project.featured && (
                        <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[10px]">Featured</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mb-1">{project.category} · {project.year}</p>
                    <div className="flex flex-wrap gap-1">
                      {(project.tags || []).slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setProjectModal(project)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-brand-500/20 text-gray-400 hover:text-brand-400 transition-all"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(project.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VAPT Tab */}
        {activeTab === 'vapt' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-1">VAPT Assessment Requests</h2>
              <p className="text-gray-400 text-sm">{vaptRequests.length} total requests</p>
            </div>

            <div className="space-y-3">
              {vaptRequests.map((r) => {
                const st = statusConfig[r.status] || statusConfig.pending;
                return (
                  <div key={r.id} className="glass-card border border-white/5 p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-semibold">{r.companyName}</p>
                          <span className={`badge border ${st.color} text-[10px]`}>{st.label}</span>
                        </div>
                        <p className="text-gray-400 text-xs">{r.serviceType} · {r.contactName} · {r.email}</p>
                        <p className="text-gray-500 text-xs font-mono mt-0.5">{r.id}</p>
                      </div>
                      <button
                        onClick={() => setVaptModal(r)}
                        className="btn-secondary text-xs px-4 py-2 flex-shrink-0"
                      >
                        <MessageSquare size={12} />
                        View Thread ({r.thread.length})
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 bg-dark-500/40 rounded-lg px-3 py-2">
                      {r.scope}
                    </p>
                    {r.documents && r.documents.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {r.documents.map((d) => (
                          <span key={d} className="flex items-center gap-1 text-xs text-gray-500 bg-dark-500/40 rounded px-2 py-1">
                            <FileText size={10} />
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Project Modal */}
      {projectModal && (
        <ProjectModal
          project={projectModal === 'new' ? null : projectModal}
          onClose={() => setProjectModal(null)}
          onSave={(data) => {
            if (projectModal === 'new') {
              addProject(data);
            } else {
              updateProject(projectModal.id, data);
            }
          }}
        />
      )}

      {/* VAPT Thread Modal */}
      {vaptModal && (
        <VaptThreadModal
          request={vaptRequests.find((r) => r.id === vaptModal.id) || vaptModal}
          onClose={() => setVaptModal(null)}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card border border-red-500/20 p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Delete Project?</h3>
            <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => { deleteProject(deleteConfirm); setDeleteConfirm(null); }}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
