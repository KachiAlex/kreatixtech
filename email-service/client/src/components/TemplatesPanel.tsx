import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Pencil } from 'lucide-react';
import { templateApi } from '../api';

const BUILTIN_TEMPLATES = [
  { name: 'Thank You', subject: 'Thank you!', body: 'Hi {name},\n\nThank you for your email. I appreciate you reaching out and will get back to you shortly.\n\nBest regards', category: 'thank_you' },
  { name: 'Follow Up', subject: 'Following up', body: 'Hi {name},\n\nI wanted to follow up on my previous email. Please let me know if you have any questions.\n\nBest regards', category: 'follow_up' },
  { name: 'Meeting Request', subject: 'Meeting request', body: 'Hi {name},\n\nI\'d like to schedule a meeting to discuss {topic}. Are you available sometime this week?\n\nBest regards', category: 'meeting' },
  { name: 'Invoice', subject: 'Invoice #{number}', body: 'Hi {name},\n\nPlease find attached invoice #{number} for {amount}. Payment is due within 30 days.\n\nThank you', category: 'invoice' },
];

const TemplatesPanel: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', subject: '', body: '', category: 'general' });

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    try {
      const data = await templateApi.list();
      setTemplates(data.templates);
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!form.name) return;
    try {
      if (editing) {
        await templateApi.update(editing.id, form);
      } else {
        await templateApi.create(form);
      }
      setForm({ name: '', subject: '', body: '', category: 'general' });
      setEditing(null);
      setShowForm(false);
      loadTemplates();
    } catch (e) { console.error(e); }
  };

  const handleEdit = (t: any) => {
    setEditing(t);
    setForm({ name: t.name, subject: t.subject || '', body: t.body || '', category: t.category || 'general' });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try { await templateApi.delete(id); loadTemplates(); } catch (e) { console.error(e); }
  };

  const handleUseBuiltin = async (tpl: any) => {
    try {
      await templateApi.create(tpl);
      loadTemplates();
    } catch (e) { console.error(e); }
  };

  const categoryColors: Record<string, string> = {
    general: '#6B7280', thank_you: '#10B981', follow_up: '#F59E0B', meeting: '#3B82F6', invoice: '#8B5CF6',
  };

  return (
    <div className="space-y-4">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText style={{ width: 20, height: 20, color: '#F2782E' }} />
          <strong style={{ fontSize: 15 }}>Email Templates</strong>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ name: '', subject: '', body: '', category: 'general' }); setShowForm(!showForm); }}
          style={{ padding: '6px 14px', background: '#F2782E', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Plus style={{ width: 14, height: 14 }} /> New Template
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 16, border: '1px solid #e8e5e0', marginBottom: 12 }}>
          <input type="text" placeholder="Template name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, marginBottom: 8 }} />
          <input type="text" placeholder="Subject (optional)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, marginBottom: 8 }} />
          <textarea placeholder="Body (use {name}, {topic}, etc. for placeholders)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={5} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, marginBottom: 8, resize: 'vertical', fontFamily: 'inherit' }} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, marginBottom: 8, display: 'block' }}>
            <option value="general">General</option>
            <option value="thank_you">Thank You</option>
            <option value="follow_up">Follow Up</option>
            <option value="meeting">Meeting</option>
            <option value="invoice">Invoice</option>
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ padding: '8px 16px', background: '#F2782E', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{editing ? 'Update' : 'Create'}</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}

      {templates.length === 0 && !showForm && (
        <div>
          <div style={{ textAlign: 'center', padding: 16, color: '#999', fontSize: 13, marginBottom: 12 }}>No templates yet. Start with a pre-built template:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {BUILTIN_TEMPLATES.map(tpl => (
              <button key={tpl.name} onClick={() => handleUseBuiltin(tpl)}
                style={{ padding: '10px 14px', border: '1px solid #e8e5e0', borderRadius: 10, background: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{tpl.name}</div>
                <div style={{ color: '#999', fontSize: 11 }}>{tpl.subject}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {templates.map((t) => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid #e8e5e0', borderRadius: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</span>
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: (categoryColors[t.category] || '#6B7280') + '20', color: categoryColors[t.category] || '#6B7280' }}>{t.category}</span>
            </div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{t.subject || '(no subject)'}</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => handleEdit(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#666' }}><Pencil style={{ width: 14, height: 14 }} /></button>
            <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#dc2626' }}><Trash2 style={{ width: 14, height: 14 }} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplatesPanel;
