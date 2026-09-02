import React, { useState, useEffect } from 'react';
import { X, Users, Activity, BarChart3, Plus, Trash2, Shield, UserCheck, UserX, Mail } from 'lucide-react';
import { adminApi } from '../api';
import { useAuth } from '../auth-context';
import type { User, AdminStats, AuditLog } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'stats' | 'users' | 'audit'>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', display_name: '', role: 'user' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [s, u, l] = await Promise.all([adminApi.stats(), adminApi.users(), adminApi.audit()]);
      setStats(s); setUsers(u.users); setLogs(l.logs);
    } catch (e) { console.error('Failed to load admin data', e); }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) return;
    try {
      await adminApi.createUser(newUser.email, newUser.password, newUser.display_name, newUser.role);
      setNewUser({ email: '', password: '', display_name: '', role: 'user' });
      setShowAddUser(false);
      loadAll();
    } catch (e: any) { alert(e.message); }
  };

  const handleToggleActive = async (u: User) => {
    try { await adminApi.updateUser(u.id, { is_active: u.is_active ? 0 : 1 }); loadAll(); } catch (e) { console.error(e); }
  };

  const handleToggleAdmin = async (u: User) => {
    try { await adminApi.updateUser(u.id, { role: u.role === 'admin' ? 'user' : 'admin' }); loadAll(); } catch (e) { console.error(e); }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Delete this user permanently?')) return;
    try { await adminApi.deleteUser(id); loadAll(); } catch (e: any) { alert(e.message); }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  };

  const tabs = [
    { id: 'stats' as const, label: 'Statistics', icon: BarChart3 },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'audit' as const, label: 'Audit Log', icon: Activity },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange" />
            <h2 className="text-lg font-bold text-ink">Admin Panel</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 border-r border-gray-100 p-3 space-y-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${tab === t.id ? 'bg-orange-light text-orange font-bold' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {tab === 'stats' && stats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-orange-light/30 rounded-xl border border-orange/10">
                  <Users className="w-6 h-6 text-orange mb-2" />
                  <p className="text-2xl font-black text-ink">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-500">Total Users</p>
                </div>
                <div className="p-5 bg-green-50 rounded-xl border border-green-100">
                  <UserCheck className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-2xl font-black text-ink">{stats.activeUsers}</p>
                  <p className="text-xs text-gray-500">Active Users</p>
                </div>
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                  <Mail className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="text-2xl font-black text-ink">{stats.totalEmails}</p>
                  <p className="text-xs text-gray-500">Total Emails</p>
                </div>
                <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                  <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-2xl font-black text-ink">{formatSize(stats.totalStorageUsed)}</p>
                  <p className="text-xs text-gray-500">Storage Used</p>
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div className="space-y-3">
                <button onClick={() => setShowAddUser(!showAddUser)} className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-bold hover:bg-orange-deep">
                  <Plus className="w-4 h-4" /> Add User
                </button>

                {showAddUser && (
                  <div className="p-4 border border-gray-200 rounded-lg space-y-2 bg-gray-50">
                    <input type="text" placeholder="Display name" value={newUser.display_name} onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={handleCreateUser} className="px-4 py-2 bg-orange text-white rounded-lg text-sm font-bold hover:bg-orange-deep">Create</button>
                  </div>
                )}

                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange/10 flex items-center justify-center text-orange font-bold text-sm">
                        {u.display_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700">{u.display_name || u.email} {u.role === 'admin' && <span className="text-xs bg-orange-light text-orange px-1.5 py-0.5 rounded ml-1">Admin</span>}</p>
                        <p className="text-xs text-gray-400">{u.email} | Joined {new Date(u.created_at + (u.created_at.includes('T') ? '' : 'Z')).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggleActive(u)} className={`p-2 rounded ${u.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`} title={u.is_active ? 'Deactivate' : 'Activate'}>
                        {u.is_active ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleToggleAdmin(u)} className="p-2 rounded text-gray-500 hover:bg-gray-100" title="Toggle admin">
                        <Shield className="w-4 h-4" />
                      </button>
                      {u.id !== user?.id && (
                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 rounded text-red-500 hover:bg-red-50" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'audit' && (
              <div className="space-y-2">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-700">
                        <span className="font-bold">{log.user_email || 'System'}</span> — {log.action}
                        {log.resource && <span className="text-gray-400"> on {log.resource}</span>}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(log.created_at + (log.created_at.includes('T') ? '' : 'Z')).toLocaleString()} | IP: {log.ip_address || 'N/A'}</p>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No audit logs</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
