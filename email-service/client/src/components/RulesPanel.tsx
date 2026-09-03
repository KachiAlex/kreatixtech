import React, { useState, useEffect } from 'react';
import { Filter, Plus, Trash2, Power } from 'lucide-react';
import { rulesApi, folderApi, labelApi } from '../api';
import type { Folder, Label } from '../types';

const RulesPanel: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    condition_field: 'from',
    condition_op: 'contains',
    condition_value: '',
    action: 'move_to_folder',
    action_value: '',
    priority: 0,
  });

  useEffect(() => {
    loadRules();
    loadFolders();
    loadLabels();
  }, []);

  const loadRules = async () => {
    try {
      const data = await rulesApi.list();
      setRules(data.rules);
    } catch (e) { console.error(e); }
  };

  const loadFolders = async () => {
    try {
      const data = await folderApi.list();
      setFolders(data.folders);
    } catch (e) { console.error(e); }
  };

  const loadLabels = async () => {
    try {
      const data = await labelApi.list();
      setLabels(data.labels);
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.condition_value) return;
    try {
      await rulesApi.create(form);
      setForm({ name: '', condition_field: 'from', condition_op: 'contains', condition_value: '', action: 'move_to_folder', action_value: '', priority: 0 });
      setShowForm(false);
      loadRules();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    try {
      await rulesApi.delete(id);
      loadRules();
    } catch (e) { console.error(e); }
  };

  const handleToggle = async (rule: any) => {
    try {
      await rulesApi.update(rule.id, { ...rule, is_active: rule.is_active ? 0 : 1 });
      loadRules();
    } catch (e) { console.error(e); }
  };

  const fieldLabels: Record<string, string> = { from: 'From', subject: 'Subject', to: 'To', body: 'Body' };
  const opLabels: Record<string, string> = { contains: 'contains', equals: 'equals', starts_with: 'starts with', ends_with: 'ends with' };
  const actionLabels: Record<string, string> = { move_to_folder: 'Move to folder', mark_read: 'Mark as read', mark_star: 'Star', label: 'Apply label', delete: 'Delete', block_sender: 'Block sender' };

  return (
    <div className="space-y-4">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter style={{ width: 20, height: 20, color: '#F2782E' }} />
          <strong style={{ fontSize: 15 }}>Rules & Filters</strong>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '6px 14px', background: '#F2782E', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Plus style={{ width: 14, height: 14 }} /> New Rule
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 16, border: '1px solid #e8e5e0', marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Rule name (e.g. 'Newsletter to Archive')"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <select value={form.condition_field} onChange={(e) => setForm({ ...form, condition_field: e.target.value })} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}>
              {Object.entries(fieldLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={form.condition_op} onChange={(e) => setForm({ ...form, condition_op: e.target.value })} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}>
              {Object.entries(opLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input
              type="text"
              placeholder="value to match"
              value={form.condition_value}
              onChange={(e) => setForm({ ...form, condition_value: e.target.value })}
              style={{ flex: 1, minWidth: 120, padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value, action_value: '' })} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}>
              {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            {form.action === 'move_to_folder' && (
              <select value={form.action_value} onChange={(e) => setForm({ ...form, action_value: e.target.value })} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}>
                <option value="">Select folder...</option>
                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            )}
            {form.action === 'label' && (
              <select value={form.action_value} onChange={(e) => setForm({ ...form, action_value: e.target.value })} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}>
                <option value="">Select label...</option>
                {labels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCreate} style={{ padding: '8px 16px', background: '#F2782E', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Create Rule</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}

      {rules.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: 24, color: '#999', fontSize: 13 }}>
          No rules yet. Create a rule to automatically filter incoming emails.
        </div>
      ) : (
        rules.map((rule) => (
          <div key={rule.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid #e8e5e0', borderRadius: 10, opacity: rule.is_active ? 1 : 0.5 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{rule.name}</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                {fieldLabels[rule.condition_field]} {opLabels[rule.condition_op]} "{rule.condition_value}" → {actionLabels[rule.action]}
                {rule.action_value && ` (${rule.action_value})`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => handleToggle(rule)} title={rule.is_active ? 'Disable' : 'Enable'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: rule.is_active ? '#16a34a' : '#999' }}>
                <Power style={{ width: 16, height: 16 }} />
              </button>
              <button onClick={() => handleDelete(rule.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#dc2626' }}>
                <Trash2 style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RulesPanel;
