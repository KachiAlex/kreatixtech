import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Tag, Mail, Shield, Monitor } from 'lucide-react';
import { settingsApi, signatureApi, aliasApi, sessionApi, labelApi } from '../api';
import { useAuth } from '../auth-context';
import type { UserSettings, Signature, Alias, Session, Label } from '../types';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { user, refreshUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [tab, setTab] = useState<'general' | 'signature' | 'labels' | 'aliases' | 'sessions'>('general');
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState({ name: '', color: '#6B7280' });
  const [newAlias, setNewAlias] = useState({ alias_email: '', forward_to: '' });
  const [newSig, setNewSig] = useState({ name: 'Default', html: '' });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [s, sigs, al, sess, lbls] = await Promise.all([
        settingsApi.get(), signatureApi.list(), aliasApi.list(), sessionApi.list(), labelApi.list(),
      ]);
      setSettings(s as UserSettings);
      setSignatures(sigs.signatures);
      setAliases(al.aliases);
      setSessions(sess.sessions);
      setLabels(lbls.labels);
    } catch (e) { console.error('Failed to load settings', e); }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsApi.update(settings);
      await refreshUser();
    } catch (e) { console.error('Failed to save settings', e); }
    setSaving(false);
  };

  const handleCreateLabel = async () => {
    if (!newLabel.name) return;
    try { await labelApi.create(newLabel.name, newLabel.color); setNewLabel({ name: '', color: '#6B7280' }); loadAll(); } catch (e) { alert('Label already exists'); }
  };

  const handleDeleteLabel = async (id: number) => {
    try { await labelApi.delete(id); loadAll(); } catch (e) { console.error(e); }
  };

  const handleCreateAlias = async () => {
    if (!newAlias.alias_email || !newAlias.forward_to) return;
    try { await aliasApi.create(newAlias.alias_email, newAlias.forward_to); setNewAlias({ alias_email: '', forward_to: '' }); loadAll(); } catch (e) { alert('Alias already exists'); }
  };

  const handleDeleteAlias = async (id: number) => {
    try { await aliasApi.delete(id); loadAll(); } catch (e) { console.error(e); }
  };

  const handleCreateSig = async () => {
    try { await signatureApi.create(newSig.name, newSig.html, true); setNewSig({ name: 'Default', html: '' }); loadAll(); } catch (e) { console.error(e); }
  };

  const handleDeleteSig = async (id: number) => {
    try { await signatureApi.delete(id); loadAll(); } catch (e) { console.error(e); }
  };

  const handleDeleteSession = async (id: string) => {
    try { await sessionApi.delete(id); loadAll(); } catch (e) { console.error(e); }
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Mail },
    { id: 'signature' as const, label: 'Signatures', icon: Mail },
    { id: 'labels' as const, label: 'Labels', icon: Tag },
    { id: 'aliases' as const, label: 'Aliases', icon: Shield },
    { id: 'sessions' as const, label: 'Sessions', icon: Monitor },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-ink">Settings</h2>
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
            {tab === 'general' && settings && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Theme</label>
                  <select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value as any })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Display Density</label>
                  <select value={settings.density} onChange={(e) => setSettings({ ...settings, density: e.target.value as any })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Items per page</label>
                  <input type="number" value={settings.items_per_page} onChange={(e) => setSettings({ ...settings, items_per_page: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Reply-to address</label>
                  <input type="email" value={settings.reply_to_address || ''} onChange={(e) => setSettings({ ...settings, reply_to_address: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="reply@kreatixtech.com" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="notify" checked={settings.notify_on_new_email === 1} onChange={(e) => setSettings({ ...settings, notify_on_new_email: e.target.checked ? 1 : 0 })} className="w-4 h-4" />
                  <label htmlFor="notify" className="text-sm text-gray-700">Notify on new email</label>
                </div>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-orange text-white rounded-lg font-bold text-sm hover:bg-orange-deep disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {tab === 'signature' && (
              <div className="space-y-4">
                {signatures.map(sig => (
                  <div key={sig.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-bold text-gray-700">{sig.name} {sig.is_default === 1 && <span className="text-xs text-orange ml-2">Default</span>}</p>
                      <p className="text-xs text-gray-400 truncate max-w-md">{sig.html?.substring(0, 80) || 'No content'}</p>
                    </div>
                    <button onClick={() => handleDeleteSig(sig.id)} className="p-2 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <input type="text" placeholder="Signature name" value={newSig.name} onChange={(e) => setNewSig({ ...newSig, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <textarea placeholder="Signature HTML" value={newSig.html} onChange={(e) => setNewSig({ ...newSig, html: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[100px]" />
                  <button onClick={handleCreateSig} className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-bold hover:bg-orange-deep"><Plus className="w-4 h-4" /> Add Signature</button>
                </div>
              </div>
            )}

            {tab === 'labels' && (
              <div className="space-y-4">
                {labels.map(label => (
                  <div key={label.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: label.color }} />
                      <span className="text-sm font-medium text-gray-700">{label.name}</span>
                    </div>
                    <button onClick={() => handleDeleteLabel(label.id)} className="p-2 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-4 flex gap-2">
                  <input type="text" placeholder="Label name" value={newLabel.name} onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input type="color" value={newLabel.color} onChange={(e) => setNewLabel({ ...newLabel, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                  <button onClick={handleCreateLabel} className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-bold hover:bg-orange-deep"><Plus className="w-4 h-4" /> Add</button>
                </div>
              </div>
            )}

            {tab === 'aliases' && (
              <div className="space-y-4">
                {aliases.map(alias => (
                  <div key={alias.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-bold text-gray-700">{alias.alias_email}</p>
                      <p className="text-xs text-gray-400">forwards to {alias.forward_to}</p>
                    </div>
                    <button onClick={() => handleDeleteAlias(alias.id)} className="p-2 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <input type="email" placeholder="Alias email (e.g. support@kreatixtech.com)" value={newAlias.alias_email} onChange={(e) => setNewAlias({ ...newAlias, alias_email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input type="email" placeholder="Forward to" value={newAlias.forward_to} onChange={(e) => setNewAlias({ ...newAlias, forward_to: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <button onClick={handleCreateAlias} className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-bold hover:bg-orange-deep"><Plus className="w-4 h-4" /> Add Alias</button>
                </div>
              </div>
            )}

            {tab === 'sessions' && (
              <div className="space-y-3">
                {sessions.map(sess => (
                  <div key={sess.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{sess.device_info?.substring(0, 60) || 'Unknown device'}</p>
                      <p className="text-xs text-gray-400">IP: {sess.ip_address || 'N/A'} | Expires: {new Date(sess.expires_at + (sess.expires_at.includes('T') ? '' : 'Z')).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDeleteSession(sess.id)} className="p-2 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {sessions.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No active sessions</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
