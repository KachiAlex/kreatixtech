import React, { useState, useEffect } from 'react';
import { Plane, Save, Power } from 'lucide-react';
import { settingsApi } from '../api';
import type { UserSettings } from '../types';

const VacationResponder: React.FC<{ settings: UserSettings | null }> = ({ settings }) => {
  const [enabled, setEnabled] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setEnabled(settings.vacation_enabled === 1);
      setSubject(settings.vacation_subject || '');
      setBody(settings.vacation_body || '');
      setStartDate(settings.vacation_start || '');
      setEndDate(settings.vacation_end || '');
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update({
        vacation_enabled: enabled ? 1 : 0,
        vacation_subject: subject,
        vacation_body: body,
        vacation_start: startDate || null,
        vacation_end: endDate || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Plane style={{ width: 20, height: 20, color: '#F2782E' }} />
          <strong style={{ fontSize: 15 }}>Vacation Responder</strong>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: enabled ? '#16a34a' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          <Power style={{ width: 14, height: 14 }} /> {enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      <div style={{ padding: '10px 14px', background: enabled ? '#f0fdf4' : '#f8f9fa', borderRadius: 8, border: `1px solid ${enabled ? '#bbf7d0' : '#e8e5e0'}`, fontSize: 12, color: '#666' }}>
        {enabled
          ? 'Auto-reply is active. Incoming emails will receive your vacation message.'
          : 'Auto-reply is off. Turn it on to automatically respond to incoming emails while you\'re away.'}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4 }}>Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Out of Office"
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13 }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4 }}>Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Hi, I'm currently out of the office and will respond when I return. For urgent matters, please contact..."
          rows={5}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4 }}>Start date (optional)</label>
          <input
            type="date"
            value={startDate ? startDate.substring(0, 10) : ''}
            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4 }}>End date (optional)</label>
          <input
            type="date"
            value={endDate ? endDate.substring(0, 10) : ''}
            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '8px 20px', background: '#F2782E', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Save style={{ width: 14, height: 14 }} /> {saving ? 'Saving...' : 'Save'}
        </button>
        {saved && <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Saved!</span>}
      </div>
    </div>
  );
};

export default VacationResponder;
