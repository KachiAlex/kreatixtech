import React from 'react';
import { Star, Reply, Forward, Trash2, Archive, Clock3, MoreHorizontal, Paperclip, FileText, AlertCircle } from 'lucide-react';
import { emailApi, attachmentApi } from '../api';
import type { Email } from '../types';

interface EmailViewProps {
  email: Email | null;
  onReply: (email: Email) => void;
  onForward: (email: Email) => void;
  onDelete: (id: number) => void;
  onArchive: (id: number) => void;
  onSnooze: (id: number) => void;
  onBack?: () => void;
  mobileVisible?: boolean;
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'Z'));
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

const avatarColors = ['#F2782E', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

const EmailView: React.FC<EmailViewProps> = ({ email, onReply, onForward, onDelete, onArchive, onSnooze, onBack, mobileVisible }) => {
  const [starred, setStarred] = React.useState(false);

  React.useEffect(() => {
    if (email) setStarred(email.is_starred === 1);
  }, [email]);

  if (!email) {
    return (
      <main className={`reader${mobileVisible ? ' show-mobile' : ''}`}>
        <div className="reader-tools">
          <div className="reader-actions">
            <button className="icon-btn" title="Back" onClick={onBack}><Archive /></button>
          </div>
        </div>
        <div className="reader-scroll" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#999' }}>
            <FileText style={{ width: 48, height: 48, margin: '0 auto 12px' }} />
            <p>Select a message to read</p>
          </div>
        </div>
      </main>
    );
  }

  const toggleStar = async () => {
    setStarred(!starred);
    try { await emailApi.star(email.id, !starred); } catch (e) { console.error(e); }
  };

  const senderName = email.from_name || email.from_address;
  const avatarColor = getAvatarColor(senderName);
  const initials = senderName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <main className={`reader${mobileVisible ? ' show-mobile' : ''}`}>
      <div className="reader-tools">
        <div className="reader-actions">
          <button className="icon-btn" title="Back" onClick={onBack}><Archive /></button>
          <button className="icon-btn" title="Archive" onClick={() => onArchive(email.id)}><Archive /></button>
          <button className="icon-btn" title="Delete" onClick={() => onDelete(email.id)}><Trash2 /></button>
          <button className="icon-btn" title="Snooze" onClick={() => onSnooze(email.id)}><Clock3 /></button>
          <button className="icon-btn" title="More"><MoreHorizontal /></button>
        </div>
        <div className="reader-actions">
          <button className={`icon-btn ${starred ? 'star on' : ''}`} title="Star" onClick={toggleStar}>
            <Star style={starred ? { fill: 'currentColor' } : {}} />
          </button>
          <button className="icon-btn" title="Reply" onClick={() => onReply(email)}><Reply /></button>
          <button className="icon-btn" title="Forward" onClick={() => onForward(email)}><Forward /></button>
        </div>
      </div>

      <div className="reader-scroll">
        <div className="subject">
          <div style={{ flex: 1 }}>
            <span className="eyebrow">{email.direction === 'outbound' ? 'SENT' : 'INBOX'}</span>
            <h1>{email.subject || '(no subject)'}</h1>
            <div className="chips">
              {email.labels?.map(l => <span key={l.id}>{l.name}</span>)}
              {email.has_attachments === 1 && <span>Attachment</span>}
              {email.is_starred === 1 && <span>Starred</span>}
            </div>
          </div>
        </div>

        <div className="sender">
          <div className="sender-avatar" style={{ background: avatarColor }}>{initials}</div>
          <div className="sender-info">
            <strong>{senderName}</strong>
            <small>{email.from_address} → {email.to_address}</small>
          </div>
          <time>{formatFullDate(email.received_at)}</time>
        </div>

        <div className="body-copy" dangerouslySetInnerHTML={{ __html: email.html || email.text?.replace(/\n/g, '<br>') || '' }} />

        {email.snooze_until && (
          <div className="callout">
            <AlertCircle />
            <div>
              <strong>Snoozed until {new Date(email.snooze_until).toLocaleString()}</strong>
              <span>This message will return to your inbox at the scheduled time.</span>
            </div>
          </div>
        )}

        {email.attachments && email.attachments.length > 0 && (
          <div style={{ marginTop: 24 }}>
            {email.attachments.map(att => (
              <a
                key={att.id}
                className="attachment"
                href={attachmentApi.downloadUrl(att.id)}
                download={att.filename}
                style={{ textDecoration: 'none', color: 'inherit', marginRight: 10, marginBottom: 10 }}
              >
                <div className="file-icon"><FileText /></div>
                <div style={{ flex: 1 }}>
                  <strong>{att.filename}</strong>
                  <small>{formatFileSize(att.size)}</small>
                </div>
                <Paperclip />
              </a>
            ))}
          </div>
        )}

        <div className="reply-row">
          <button className="reply-btn" onClick={() => onReply(email)}>
            <Reply /> Reply
          </button>
          <button className="reply-btn" onClick={() => onForward(email)}>
            <Forward /> Forward
          </button>
        </div>
      </div>
    </main>
  );
};

export default EmailView;
