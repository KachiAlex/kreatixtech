import React, { useState, useEffect } from 'react';
import { Plus, Clock, MapPin, Trash2, X, CalendarDays } from 'lucide-react';
import { calendarApi } from '../api';
import type { CalendarEvent } from '../types';

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '', start_time: '', end_time: '', all_day: 0, color: '#F2782E' });

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try {
      const data = await calendarApi.list();
      setEvents(data.events);
    } catch (e) { console.error(e); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.start_time || !form.end_time) return;
    try {
      await calendarApi.create(form);
      setShowForm(false);
      setForm({ title: '', description: '', location: '', start_time: '', end_time: '', all_day: 0, color: '#F2782E' });
      loadEvents();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    try { await calendarApi.delete(id); loadEvents(); } catch (e) { console.error(e); }
  };

  const formatEventTime = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="eyebrow">CALENDAR</span>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-.03em' }}>Events</h1>
        </div>
        <button className="compose-main" onClick={() => setShowForm(true)}>
          <Plus /> New Event
        </button>
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>
          <CalendarDays style={{ width: 48, height: 48, margin: '0 auto 12px' }} />
          <p>No events scheduled</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 760 }}>
          {events.map(ev => (
            <div key={ev.id} style={{ display: 'flex', gap: 14, padding: 16, border: '1px solid var(--line)', borderRadius: 12, background: '#fbfaf8' }}>
              <div style={{ width: 4, borderRadius: 2, background: ev.color }} />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 15 }}>{ev.title}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: 'var(--muted)', fontSize: 13 }}>
                  <Clock style={{ width: 14, height: 14 }} /> {formatEventTime(ev.start_time)} — {formatEventTime(ev.end_time)}
                </div>
                {ev.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: 'var(--muted)', fontSize: 13 }}>
                    <MapPin style={{ width: 14, height: 14 }} /> {ev.location}
                  </div>
                )}
                {ev.description && <p style={{ margin: '8px 0 0', fontSize: 13, color: '#555' }}>{ev.description}</p>}
              </div>
              <button className="icon-btn" onClick={() => handleDelete(ev.id)} title="Delete"><Trash2 /></button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <>
          <div className="overlay show" onClick={() => setShowForm(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 22, background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow)', padding: 28, width: 'min(480px,90vw)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>New Event</h2>
              <button className="icon-btn" onClick={() => setShowForm(false)}><X /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={{ height: 42, border: '1px solid var(--line)', borderRadius: 8, padding: '0 12px', fontSize: 14 }} />
              <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={{ height: 42, border: '1px solid var(--line)', borderRadius: 8, padding: '0 12px', fontSize: 14 }} />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <label style={{ flex: 1, fontSize: 12, color: 'var(--muted)' }}>Start
                  <input type="datetime-local" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required style={{ width: '100%', height: 38, border: '1px solid var(--line)', borderRadius: 8, padding: '0 8px', fontSize: 13 }} />
                </label>
                <label style={{ flex: 1, fontSize: 12, color: 'var(--muted)' }}>End
                  <input type="datetime-local" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required style={{ width: '100%', height: 38, border: '1px solid var(--line)', borderRadius: 8, padding: '0 8px', fontSize: 13 }} />
                </label>
              </div>
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ minHeight: 80, border: '1px solid var(--line)', borderRadius: 8, padding: 10, fontSize: 14, resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="reply-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="compose-main" style={{ height: 38 }}>Create Event</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
