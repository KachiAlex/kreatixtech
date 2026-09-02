import React, { useState } from 'react';
import { Star, Archive, Trash2, Mail, RefreshCw, MoreHorizontal, Clock3 } from 'lucide-react';
import { emailApi, snoozeApi } from '../api';
import type { Email } from '../types';

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  onRefresh: () => void;
  selectedEmailId?: number | null;
  folderName?: string;
  mobileHidden?: boolean;
}

function formatTime(receivedAt: string): string {
  const d = new Date(receivedAt + (receivedAt.includes('T') ? '' : 'Z'));
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const EmailList: React.FC<EmailListProps> = ({ emails, onSelectEmail, onRefresh, selectedEmailId, folderName, mobileHidden }) => {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [starred, setStarred] = useState<Set<number>>(new Set(
    emails.filter(e => e.is_starred === 1).map(e => e.id)
  ));

  const toggleStar = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const isStarred = starred.has(id);
    setStarred(prev => { const n = new Set(prev); isStarred ? n.delete(id) : n.add(id); return n; });
    try { await emailApi.star(id, !isStarred); } catch (e) { console.error(e); }
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const selectAll = () => {
    if (selected.size === emails.length) setSelected(new Set());
    else setSelected(new Set(emails.map(e => e.id)));
  };

  const bulkAction = async (action: string) => {
    try {
      await emailApi.bulk([...selected], action);
      setSelected(new Set());
      onRefresh();
    } catch (e) { console.error(e); }
  };

  return (
    <section className={`mail-list${mobileHidden ? ' hide-mobile' : ''}`}>
      <div className="list-head">
        <div>
          <h1>{folderName || 'Inbox'}</h1>
          <small>{emails.length} conversations</small>
        </div>
        <div>
          <button className="icon-btn" onClick={onRefresh}><RefreshCw /></button>
          <button className="icon-btn"><MoreHorizontal /></button>
        </div>
      </div>

      <div className="list-tools">
        <input className="select-box" type="checkbox" checked={selected.size === emails.length && emails.length > 0} onChange={selectAll} aria-label="Select all" />
        <span>{selected.size > 0 ? `${selected.size} selected` : 'Select conversations'}</span>
        <div className={`bulk ${selected.size > 0 ? 'show' : ''}`}>
          <button title="Archive" onClick={() => bulkAction('archive')}><Archive /></button>
          <button title="Delete" onClick={() => bulkAction('delete')}><Trash2 /></button>
          <button title="Mark unread" onClick={() => bulkAction('mark_unread')}><Mail /></button>
        </div>
        <span className="page-count">1–{emails.length}</span>
      </div>

      <div className="mail-scroll">
        {emails.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999', fontSize: 14 }}>
            No conversations here.
          </div>
        ) : (
          emails.map(email => (
            <article
              key={email.id}
              className={`mail-item ${selectedEmailId === email.id ? 'current' : ''} ${email.is_read === 0 ? 'unread' : ''}`}
              onClick={() => onSelectEmail(email)}
            >
              <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                <input
                  className="select-box"
                  type="checkbox"
                  checked={selected.has(email.id)}
                  onChange={() => toggleSelect(email.id)}
                  aria-label="Select message"
                />
                <button
                  className={`star ${starred.has(email.id) ? 'on' : ''}`}
                  onClick={(e) => toggleStar(e, email.id)}
                  aria-label="Star"
                >
                  <Star />
                </button>
              </div>
              <div className="mail-content">
                <div className="sender-line">
                  <strong>{email.from_name || email.from_address}</strong>
                  <time>{formatTime(email.received_at)}</time>
                </div>
                <h2>{email.subject || '(no subject)'}</h2>
                <p>{email.snippet || email.text?.substring(0, 120) || ''}</p>
                {email.labels && email.labels.length > 0 && (
                  <>
                    {email.labels.map(label => (
                      <span key={label.id} className="tag">
                        <i style={{ background: label.color }} />
                        {label.name}
                      </span>
                    ))}
                  </>
                )}
                {email.has_attachments === 1 && (
                  <span className="tag" style={{ marginLeft: email.labels?.length ? 5 : 0 }}>
                    <i style={{ background: '#F2782E' }} /> Attachment
                  </span>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default EmailList;
