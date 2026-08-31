import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, UserPlus, RefreshCw, Trash2, Power, 
  Shield, AlertCircle, Search, X, Save, Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';

const WORKER_API_URL = 'https://email-worker.zionitefm.workers.dev/api/admin';

export default function EmailAccountsPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${WORKER_API_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch email accounts');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const response = await fetch(`${WORKER_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, display_name: newName, password: newPassword }),
      });
      if (response.ok) {
        setNewEmail('');
        setNewName('');
        setNewPassword('');
        setShowForm(false);
        fetchUsers();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create email account');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const response = await fetch(`${WORKER_API_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Permanently delete this email account? This cannot be undone.')) return;
    try {
      const response = await fetch(`${WORKER_API_URL}/users/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete email account');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-ink-900 mb-1">Email Accounts</h2>
          <p className="text-ink-400 text-sm">{users.length} total accounts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsers} className="p-2 rounded-lg bg-surface-100 hover:bg-surface-200 text-ink-600 transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            <Plus size={14} /> Add Account
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-coral-500/10 border border-coral-500/20 text-coral-500 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span className="font-medium flex items-center gap-2"><AlertCircle size={14} />{error}</span>
          <button onClick={() => setError(null)} className="font-bold">×</button>
        </div>
      )}

      {showForm && (
        <div className="card p-6 bg-white mb-6 border-coral-500/20 border-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-ink-900 font-bold text-sm">Create New Email Account</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-100 text-ink-400">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Display Name *</label>
              <input required value={newName} onChange={e => setNewName(e.target.value)}
                className="input-field" placeholder="e.g. Edward Kreatix" />
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                className="input-field" placeholder="edward@kreatixtech.com" />
            </div>
            <div>
              <label className="label">Initial Password *</label>
              <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="input-field" placeholder="••••••••" />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm px-5">Cancel</button>
              <button type="submit" disabled={creating} className="btn-primary text-sm px-5">
                <Save size={13} /> {creating ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card bg-white overflow-hidden">
        <div className="p-4 border-b border-surface-300 bg-surface-50 flex items-center gap-3">
          <Search size={16} className="text-ink-300" />
          <input
            type="text" placeholder="Search accounts..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm p-0 w-full placeholder:text-ink-300"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-100/50 text-ink-400 text-[10px] uppercase tracking-wider font-bold">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-ink-400 text-sm">
                    No email accounts found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-coral-500/10 flex items-center justify-center text-coral-500 font-bold text-xs">
                          {user.display_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-ink-900 text-sm">{user.display_name}</p>
                          <p className="text-xs text-ink-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('tag text-[10px]', 
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-coral-500/10 text-coral-500'
                      )}>
                        {user.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] text-ink-400 font-mono">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => toggleUserStatus(user)}
                          className={cn('p-2 rounded-lg transition-colors',
                            user.is_active ? 'text-amber-500 hover:bg-amber-500/10' : 'text-green-500 hover:bg-green-500/10'
                          )}
                          title={user.is_active ? 'Suspend Account' : 'Activate Account'}
                        >
                          <Power size={14} />
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="p-2 text-coral-500 hover:bg-coral-500/10 rounded-lg transition-colors"
                          title="Delete Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="card p-4 bg-surface-100 flex gap-3 items-start text-xs text-ink-500">
        <Shield size={16} className="text-coral-500 flex-shrink-0" />
        <div>
          <p className="font-bold text-ink-900">Global Infrastructure Support</p>
          <p className="mt-0.5 leading-relaxed">
            These accounts are automatically synchronized with our Cloudflare Email Routing infrastructure. 
            Ensure your <strong>MX records</strong> are correctly mapped in the dashboard to receive external mail.
          </p>
        </div>
      </div>
    </div>
  );
}
