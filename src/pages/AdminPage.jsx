import React, { useState } from 'react';
import {
  Lock, LayoutDashboard, Code2, Shield, Plus, Edit2, Trash2,
  LogOut, Menu, MessageSquare, X, Save, CheckCircle2, AlertCircle,
  FileText, Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn, formatDateTime, statusConfig } from '../lib/utils';
import { useForm } from 'react-hook-form';

// ── Login ──────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (!onLogin(password)) { setError('Incorrect password.'); setLoading(false); }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-ink-950" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Kreatix Technologies</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Password</label>
              <input type="password" value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter admin password" className="input-field" autoFocus />
            </div>
            {error && <p className="text-red-400 text-xs flex items-center gap-1.5"><AlertCircle size={12} />{error}</p>}
            <button type="submit" disabled={loading} className="btn-teal w-full justify-center py-3 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-slate-700 text-xs mt-5 font-mono">kreatix@admin2024</p>
        </div>
      </div>
    </div>
  );
}

// ── Project Form Modal ─────────────────────────────────
const categories = ['Web Application', 'Mobile Application', 'SaaS Platform', 'API / Backend'];

function ProjectModal({ project, onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: project || {
      title: '', category: 'Web Application', description: '',
      tags: '', thumbnail: '', demoUrl: '', demoImages: '', year: new Date().getFullYear(), featured: false,
    }
  });

  const onSubmit = (data) => {
    onSave({
      ...data,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      demoImages: data.demoImages ? data.demoImages.split('\n').map(u => u.trim()).filter(Boolean) : [],
      demoType: data.demoUrl ? 'url' : 'images',
      year: Number(data.year),
      featured: !!data.featured,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-ink-900 border border-ink-600 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
          <h3 className="text-white font-bold text-sm">{project ? 'Edit Project' : 'Add New Project'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-700 text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Title *</label>
              <input {...register('title', { required: true })} placeholder="e.g. FinTrack Pro" className="input-field" />
              {errors.title && <p className="text-red-400 text-xs mt-1">Required</p>}
            </div>
            <div>
              <label className="label">Category</label>
              <select {...register('category')} className="input-field">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <input {...register('year')} type="number" min="2018" max="2030" className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea {...register('description', { required: true })} rows={3} className="input-field resize-none" placeholder="Describe the project..." />
            {errors.description && <p className="text-red-400 text-xs mt-1">Required</p>}
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input {...register('tags')} placeholder="React, Node.js, AWS" className="input-field" />
          </div>
          <div>
            <label className="label">Thumbnail URL *</label>
            <input {...register('thumbnail', { required: true })} placeholder="https://..." className="input-field" />
            {errors.thumbnail && <p className="text-red-400 text-xs mt-1">Required</p>}
          </div>
          <div>
            <label className="label">Live Demo URL</label>
            <input {...register('demoUrl')} placeholder="https://demo.yourapp.com" className="input-field" />
          </div>
          <div className="flex items-center gap-3">
            <input {...register('featured')} type="checkbox" id="featured" className="w-4 h-4 accent-teal-500" />
            <label htmlFor="featured" className="text-sm text-slate-300 cursor-pointer">Featured project</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline text-sm px-5">Cancel</button>
            <button type="submit" className="btn-teal text-sm px-5">
              <Save size={13} /> {project ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── VAPT Thread Modal ──────────────────────────────────
function VaptThreadModal({ request, onClose }) {
  const { addThreadMessage, updateVaptStatus } = useApp();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const st = statusConfig[request.status] || statusConfig.pending;

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setTimeout(() => { addThreadMessage(request.id, message.trim(), 'admin'); setMessage(''); setSending(false); }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-ink-900 border border-ink-600 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
          <div>
            <p className="text-xs text-slate-500 font-mono">{request.id}</p>
            <h3 className="text-white font-bold text-sm">{request.serviceType}</h3>
            <p className="text-slate-500 text-xs">{request.companyName} · {request.contactName}</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={request.status} onChange={e => updateVaptStatus(request.id, e.target.value)}
              className="input-field text-xs py-1.5 px-3 w-36">
              {Object.entries(statusConfig).map(([val, cfg]) => (
                <option key={val} value={val}>{cfg.label}</option>
              ))}
            </select>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-700 text-slate-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {request.thread.map(m => (
            <div key={m.id} className={cn('flex gap-3', m.role === 'admin' ? 'flex-row-reverse' : '')}>
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                m.role === 'system' ? 'bg-ink-700 text-slate-400' :
                m.role === 'admin'  ? 'bg-teal-500/20 text-teal-400' :
                                     'bg-ink-600 text-slate-300'
              )}>
                {m.role === 'system' ? '·' : m.role === 'admin' ? 'KT' : 'C'}
              </div>
              <div className={cn('max-w-sm', m.role === 'admin' ? 'items-end flex flex-col' : '')}>
                <div className={cn(
                  'rounded-xl px-4 py-3 text-sm',
                  m.role === 'system' ? 'bg-ink-800 text-slate-400' :
                  m.role === 'admin'  ? 'bg-teal-500/10 border border-teal-500/20 text-slate-200' :
                                       'bg-ink-700 text-slate-200'
                )}>
                  {m.message}
                </div>
                <p className="text-xs text-slate-600 mt-1 px-1">{m.author} · {formatDateTime(m.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 pt-3 border-t border-ink-700">
          <form onSubmit={handleSend} className="flex gap-3">
            <input value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Reply to client..." className="input-field flex-1 text-sm py-2.5" />
            <button type="submit" disabled={sending || !message.trim()}
              className="btn-teal text-sm px-4 py-2.5 disabled:opacity-40">
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────
function SidebarContent({ tabs, activeTab, setActiveTab, logoutAdmin, onClose }) {
  return (
    <>
      <div className="px-6 py-5 border-b border-ink-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-teal-500 flex items-center justify-center">
            <span className="text-ink-950 font-black text-[10px]">K</span>
          </div>
          <span className="text-white font-bold text-sm">Admin</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-700 text-slate-400 md:hidden">
            <X size={16} />
          </button>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); onClose?.(); }}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-ink-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-ink-800'
            )}>
            <tab.icon size={16} />
            {tab.label}
            {tab.badge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-ink-700">
        <button onClick={logoutAdmin}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-colors">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </>
  );
}

// ── Main ───────────────────────────────────────────────
export default function AdminPage() {
  const { adminAuthenticated, loginAdmin, logoutAdmin, projects, addProject, updateProject, deleteProject, vaptRequests } = useApp();
  const [activeTab, setActiveTab]       = useState('overview');
  const [projectModal, setProjectModal] = useState(null);
  const [vaptModal, setVaptModal]       = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  if (!adminAuthenticated) return <AdminLogin onLogin={loginAdmin} />;

  const pendingVapt = vaptRequests.filter(r => r.status === 'pending' || r.status === 'in_review').length;

  const tabs = [
    { id: 'overview',  label: 'Overview',       icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio',       icon: Code2 },
    { id: 'vapt',      label: 'VAPT Requests',   icon: Shield, badge: pendingVapt },
  ];

  const sidebarProps = { tabs, activeTab, setActiveTab, logoutAdmin };

  return (
    <div className="min-h-screen bg-ink-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-ink-900 border-r border-ink-700 flex-col fixed top-0 left-0 h-full z-40">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-ink-900 border-r border-ink-700 flex flex-col z-50 transition-transform duration-300 md:hidden',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent {...sidebarProps} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Content */}
      <main className="md:ml-60 flex-1 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-ink-900 border-b border-ink-700">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-ink-800 hover:bg-ink-700 text-slate-300 transition-colors">
            <Menu size={17} />
          </button>
          <span className="text-white font-semibold text-sm">{tabs.find(t => t.id === activeTab)?.label}</span>
          <button onClick={logoutAdmin} className="p-2 rounded-lg bg-ink-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>

        <div className="p-6 md:p-8 flex-1">

          {/* Overview */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Overview</h2>
              <p className="text-slate-500 text-sm mb-8">Welcome back.</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {[
                  { icon: Code2,        label: 'Projects',      value: projects.length,                                             color: 'text-teal-400' },
                  { icon: Shield,       label: 'VAPT Requests', value: vaptRequests.length,                                         color: 'text-red-400' },
                  { icon: AlertCircle,  label: 'Pending',       value: pendingVapt,                                                 color: 'text-yellow-400' },
                  { icon: CheckCircle2, label: 'Completed',     value: vaptRequests.filter(r => r.status === 'completed').length,   color: 'text-green-400' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="card p-5">
                    <Icon size={18} className={cn(color, 'mb-3')} />
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="text-slate-500 text-sm">{label}</p>
                  </div>
                ))}
              </div>
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-sm">Recent VAPT Requests</h3>
                  <button onClick={() => setActiveTab('vapt')} className="text-teal-400 text-xs hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {vaptRequests.slice(0, 3).map(r => {
                    const st = statusConfig[r.status] || statusConfig.pending;
                    return (
                      <div key={r.id} className="flex items-center justify-between py-2 border-b border-ink-700 last:border-0">
                        <div>
                          <p className="text-white text-sm font-medium">{r.companyName}</p>
                          <p className="text-slate-500 text-xs font-mono">{r.id}</p>
                        </div>
                        <span className={cn('tag text-[10px]', st.color)}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Portfolio */}
          {activeTab === 'portfolio' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">Portfolio</h2>
                  <p className="text-slate-500 text-sm">{projects.length} projects</p>
                </div>
                <button onClick={() => setProjectModal('new')} className="btn-teal text-sm">
                  <Plus size={14} /> Add Project
                </button>
              </div>
              <div className="space-y-2">
                {projects.map(project => (
                  <div key={project.id} className="card p-4 flex items-center gap-4">
                    <img src={project.thumbnail} alt={project.title}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-ink-700" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-white font-semibold text-sm">{project.title}</p>
                        {project.featured && <span className="tag-teal text-[10px]">Featured</span>}
                      </div>
                      <p className="text-slate-500 text-xs mb-1">{project.category} · {project.year}</p>
                      <div className="flex flex-wrap gap-1">
                        {(project.tags || []).slice(0, 4).map(t => (
                          <span key={t} className="tag text-[10px]">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setProjectModal(project)}
                        className="p-2 rounded-lg hover:bg-ink-700 text-slate-400 hover:text-white transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(project.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VAPT */}
          {activeTab === 'vapt' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white mb-1">VAPT Requests</h2>
                <p className="text-slate-500 text-sm">{vaptRequests.length} total</p>
              </div>
              <div className="space-y-3">
                {vaptRequests.map(r => {
                  const st = statusConfig[r.status] || statusConfig.pending;
                  return (
                    <div key={r.id} className="card p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-semibold text-sm">{r.companyName}</p>
                            <span className={cn('tag text-[10px]', st.color)}>{st.label}</span>
                          </div>
                          <p className="text-slate-400 text-xs">{r.serviceType} · {r.contactName} · {r.email}</p>
                          <p className="text-slate-600 text-xs font-mono mt-0.5">{r.id}</p>
                        </div>
                        <button onClick={() => setVaptModal(r)}
                          className="btn-outline text-xs px-4 py-2 flex-shrink-0">
                          <MessageSquare size={12} /> Thread ({r.thread.length})
                        </button>
                      </div>
                      <p className="text-slate-400 text-sm bg-ink-900 rounded-lg px-3 py-2 line-clamp-2">{r.scope}</p>
                      {r.documents?.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {r.documents.map(d => (
                            <span key={d} className="flex items-center gap-1 tag text-[10px]">
                              <FileText size={9} />{d}
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

      {/* Modals */}
      {projectModal && (
        <ProjectModal
          project={projectModal === 'new' ? null : projectModal}
          onClose={() => setProjectModal(null)}
          onSave={data => projectModal === 'new' ? addProject(data) : updateProject(projectModal.id, data)}
        />
      )}

      {vaptModal && (
        <VaptThreadModal
          request={vaptRequests.find(r => r.id === vaptModal.id) || vaptModal}
          onClose={() => setVaptModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ink-900 border border-red-500/20 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Delete Project?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1 text-sm">Cancel</button>
              <button onClick={() => { deleteProject(deleteConfirm); setDeleteConfirm(null); }}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-sm transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
