import React, { useState, useEffect } from 'react';
import { Star, Reply, ReplyAll, Forward, Trash2, Archive, Clock3, MoreHorizontal, Paperclip, FileText, AlertCircle, ChevronDown, ChevronRight, Image as ImageIcon, Eye, CheckCircle, X, Lock, ArrowLeft } from 'lucide-react';
import { emailApi, attachmentApi, threadApi, receiptApi, snoozeApi, deliveryApi } from '../api';
import { decryptMessage, isEncrypted, unwrapEncrypted } from '../crypto-utils';
import type { Email } from '../types';

interface EmailViewProps {
  email: Email | null;
  onReply: (email: Email) => void;
  onReplyAll: (email: Email) => void;
  onForward: (email: Email) => void;
  onDelete: (id: number) => void;
  onArchive: (id: number) => void;
  onSnooze: (id: number) => void;
  onBack?: () => void;
  onSelectEmail?: (email: Email) => void;
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

const SNOOZE_PRESETS = [
  { label: 'Later today', hours: 3 },
  { label: 'Tomorrow', hours: 24 },
  { label: 'This weekend', hours: 72 },
  { label: 'Next week', hours: 168 },
];

const EmailView: React.FC<EmailViewProps> = ({ email, onReply, onReplyAll, onForward, onDelete, onArchive, onSnooze, onBack, onSelectEmail, mobileVisible }) => {
  const [starred, setStarred] = useState(false);
  const [thread, setThread] = useState<any[]>([]);
  const [expandedThread, setExpandedThread] = useState(false);
  const [showSnoozePicker, setShowSnoozePicker] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<any>(null);
  const [showReceipts, setShowReceipts] = useState(false);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [showDelivery, setShowDelivery] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const moreRef = React.useRef<HTMLDivElement>(null);
  const [deliveryData, setDeliveryData] = useState<{ delivery_status: string; events: any[] } | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);

  useEffect(() => {
    if (email) {
      setStarred(email.is_starred === 1);
      setExpandedThread(false);
      setShowSnoozePicker(false);
      setPreviewAttachment(null);
      setShowReceipts(false);
      setShowDelivery(false);
      setShowMore(false);
      setDeliveryData(null);
      // Load thread
      if (email.thread_id) {
        threadApi.get(email.id).then(data => setThread(data.thread)).catch(() => setThread([]));
      } else {
        setThread([]);
      }
    }
  }, [email]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMore(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!email) {
    return (
      <main className={`reader${mobileVisible ? ' show-mobile' : ''}`}>
        <div className="reader-tools">
          <div className="reader-actions">
            <button className="icon-btn" title="Back" onClick={onBack}><ArrowLeft /></button>
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

  const handleSnoozePreset = async (hours: number) => {
    const until = new Date(Date.now() + hours * 3600000).toISOString().replace('T', ' ').substring(0, 16);
    try { await snoozeApi.snooze(email.id, until); setShowSnoozePicker(false); } catch (e) { console.error(e); }
  };

  const loadReceipts = async () => {
    try {
      const data = await receiptApi.list(email.id);
      setReceipts(data.receipts || []);
      setShowReceipts(true);
      setShowDelivery(false);
      setTimeout(() => {
        const panel = document.querySelector('[data-receipts-panel]');
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (e) { console.error('Failed to load receipts:', e); }
  };

  const loadDelivery = async () => {
    try {
      const data = await deliveryApi.get(email.id);
      setDeliveryData(data);
      setShowDelivery(true);
      setShowReceipts(false);
      setTimeout(() => {
        const panel = document.querySelector('[data-delivery-panel]');
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (e) { console.error('Failed to load delivery:', e); }
  };

  const deliveryStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
    sent: { color: '#6b7280', bg: '#f3f4f6', label: 'Sent' },
    delivered: { color: '#16a34a', bg: '#f0fdf4', label: 'Delivered' },
    bounced: { color: '#dc2626', bg: '#fef2f2', label: 'Bounced' },
    complained: { color: '#d97706', bg: '#fffbeb', label: 'Complained' },
    opened: { color: '#2563eb', bg: '#eff6ff', label: 'Opened' },
    clicked: { color: '#7c3aed', bg: '#f5f3ff', label: 'Clicked' },
  };

  const handleDecrypt = async () => {
    const passphrase = prompt('Enter decryption passphrase:');
    if (!passphrase) return;
    try {
      const rawText = email.text || email.html || '';
      const encryptedPayload = isEncrypted(rawText) ? unwrapEncrypted(rawText) : rawText;
      const decrypted = await decryptMessage(encryptedPayload, passphrase);
      setDecryptedContent(decrypted);
    } catch {
      alert('Failed to decrypt — wrong passphrase or corrupted data.');
    }
  };

  const emailIsEncrypted = isEncrypted(email.text || email.html || '');

  const senderName = email.from_name || email.from_address;
  const avatarColor = getAvatarColor(senderName);
  const initials = senderName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  const isImage = (mime: string) => mime.startsWith('image/');
  const isPdf = (mime: string) => mime === 'application/pdf';

  return (
    <main className={`reader${mobileVisible ? ' show-mobile' : ''}`}>
      <div className="reader-tools">
        <div className="reader-actions">
          <button className="icon-btn" title="Back" onClick={onBack}><ArrowLeft /></button>
          <button className="icon-btn" title="Archive" onClick={() => onArchive(email.id)}><Archive /></button>
          <button className="icon-btn" title="Delete" onClick={() => onDelete(email.id)}><Trash2 /></button>
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" title="Snooze" onClick={() => setShowSnoozePicker(!showSnoozePicker)}><Clock3 /></button>
            {showSnoozePicker && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid #E8E5E0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, padding: 4, minWidth: 140 }}>
                {SNOOZE_PRESETS.map(p => (
                  <button key={p.label} onClick={() => handleSnoozePreset(p.hours)} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 13, borderRadius: 4 }}>{p.label}</button>
                ))}
                <button onClick={() => { onSnooze(email.id); setShowSnoozePicker(false); }} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 13, borderRadius: 4, borderTop: '1px solid #f0f0f0' }}>Custom...</button>
              </div>
            )}
          </div>
          {email.direction === 'outbound' && (
            <>
              <button className="icon-btn" title="Delivery status" onClick={loadDelivery}><CheckCircle /></button>
              <button className="icon-btn" title="Read receipts" onClick={loadReceipts}><Eye /></button>
            </>
          )}
          <div ref={moreRef} style={{ position: 'relative' }}>
            <button className="icon-btn" title="More" onClick={() => setShowMore(!showMore)}><MoreHorizontal /></button>
            {showMore && (
              <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #E8E5E0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 100, padding: 4, minWidth: 160 }}>
                <button onClick={() => { emailApi.markUnread(email.id); setShowMore(false); onBack?.(); }} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 13, borderRadius: 4 }}>Mark as unread</button>
                <button onClick={() => { setShowMore(false); window.print(); }} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 13, borderRadius: 4 }}>Print</button>
                <button onClick={() => { navigator.clipboard?.writeText(email.subject); setShowMore(false); }} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 13, borderRadius: 4 }}>Copy subject</button>
              </div>
            )}
          </div>
          {emailIsEncrypted && !decryptedContent && (
            <button className="icon-btn" title="Decrypt message" onClick={handleDecrypt} style={{ color: '#F2782E' }}>
              <Lock style={{ width: 18, height: 18 }} />
            </button>
          )}
        </div>
        <div className="reader-actions">
          <button className={`icon-btn ${starred ? 'star on' : ''}`} title="Star" onClick={toggleStar}>
            <Star style={starred ? { fill: 'currentColor' } : {}} />
          </button>
          <button className="icon-btn" title="Reply" onClick={() => onReply(email)}><Reply /></button>
          <button className="icon-btn" title="Reply All" onClick={() => onReplyAll(email)}><ReplyAll /></button>
          <button className="icon-btn" title="Forward" onClick={() => onForward(email)}><Forward /></button>
        </div>
      </div>

      <div className="reader-scroll">
        {/* Thread/conversation indicator */}
        {thread.length > 1 && (
          <div style={{ marginBottom: 12, background: '#f8f9fa', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
               onClick={() => setExpandedThread(!expandedThread)}>
            {expandedThread ? <ChevronDown style={{ width: 16, height: 16 }} /> : <ChevronRight style={{ width: 16, height: 16 }} />}
            <span style={{ fontSize: 13, fontWeight: 600 }}>{thread.length} messages in this conversation</span>
          </div>
        )}

        {/* Expanded thread view */}
        {expandedThread && thread.length > 1 && (
          <div style={{ marginBottom: 16 }}>
            {thread.map((msg, i) => (
              <div key={msg.id} style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: msg.id === email.id ? 'default' : 'pointer', opacity: msg.id === email.id ? 1 : 0.6 }}
                   onClick={() => { if (msg.id !== email.id && onSelectEmail) { emailApi.get(msg.id).then(full => onSelectEmail(full)).catch(console.error); } }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: getAvatarColor(msg.from_name || msg.from_address), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {(msg.from_name || msg.from_address).split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: msg.is_read === 0 ? 700 : 400 }}>{msg.from_name || msg.from_address}</span>
                  <span style={{ color: '#999', marginLeft: 6 }}>{msg.direction === 'outbound' ? '(You)' : ''}</span>
                </div>
                <span style={{ color: '#999', fontSize: 11 }}>{new Date(msg.received_at + (msg.received_at.includes('T') ? '' : 'Z')).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}

        <div className="subject">
          <div style={{ flex: 1 }}>
            <span className="eyebrow">{email.direction === 'outbound' ? 'SENT' : 'INBOX'}</span>
            <h1>{email.subject || '(no subject)'}</h1>
            <div className="chips">
              {email.labels?.map(l => <span key={l.id}>{l.name}</span>)}
              {email.has_attachments === 1 && <span>Attachment</span>}
              {email.is_starred === 1 && <span>Starred</span>}
              {email.direction === 'outbound' && deliveryData?.delivery_status && (() => {
                const cfg = deliveryStatusConfig[deliveryData.delivery_status] || deliveryStatusConfig.sent;
                return <span style={{ background: cfg.bg, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>;
              })()}
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

        {decryptedContent ? (
          <div className="body-copy">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
              <Lock style={{ width: 14, height: 14 }} /> Decrypted message
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{decryptedContent}</div>
          </div>
        ) : emailIsEncrypted ? (
          <div className="body-copy">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, background: '#fef3c7', borderRadius: 10, border: '1px solid #fde68a' }}>
              <Lock style={{ width: 20, height: 20, color: '#d97706' }} />
              <div>
                <strong style={{ fontSize: 13, color: '#92400e' }}>This message is encrypted</strong>
                <div style={{ fontSize: 12, color: '#b45309', marginTop: 4 }}>Click the lock icon above to decrypt with your passphrase.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="body-copy" dangerouslySetInnerHTML={{ __html: email.html || email.text?.replace(/\n/g, '<br>') || '' }} />
        )}

        {email.snooze_until && (
          <div className="callout">
            <AlertCircle />
            <div>
              <strong>Snoozed until {new Date(email.snooze_until).toLocaleString()}</strong>
              <span>This message will return to your inbox at the scheduled time.</span>
            </div>
          </div>
        )}

        {/* Read receipts panel */}
        {showReceipts && (
          <div data-receipts-panel style={{ marginTop: 16, background: '#f0f9ff', borderRadius: 10, padding: 14, border: '1px solid #bae6fd' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#0369a1' }}>
                <CheckCircle style={{ width: 16, height: 16 }} /> Read Receipts ({receipts.length})
              </div>
              <button onClick={() => setShowReceipts(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1' }}><X style={{ width: 16, height: 16 }} /></button>
            </div>
            {receipts.length === 0 ? (
              <div style={{ fontSize: 12, color: '#666' }}>No read receipts yet. The recipient hasn't opened this email.</div>
            ) : (
              receipts.map((r: any) => (
                <div key={r.id} style={{ fontSize: 12, padding: '4px 0', borderBottom: '1px solid #e0f2fe', color: '#0369a1' }}>
                  <strong>{r.recipient}</strong> opened on {new Date(r.read_at + (r.read_at.includes('T') ? '' : 'Z')).toLocaleString()}
                </div>
              ))
            )}
          </div>
        )}

        {/* Delivery tracking panel */}
        {showDelivery && deliveryData && (
          <div data-delivery-panel style={{ marginTop: 16, background: '#f8fafc', borderRadius: 10, padding: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                <CheckCircle style={{ width: 16, height: 16 }} /> Delivery Tracking
                {(() => {
                  const cfg = deliveryStatusConfig[deliveryData.delivery_status] || deliveryStatusConfig.sent;
                  return <span style={{ background: cfg.bg, color: cfg.color, fontWeight: 600, padding: '2px 10px', borderRadius: 12, fontSize: 11 }}>{cfg.label}</span>;
                })()}
              </div>
              <button onClick={() => setShowDelivery(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X style={{ width: 16, height: 16 }} /></button>
            </div>
            {deliveryData.events.length === 0 ? (
              <div style={{ fontSize: 12, color: '#94a3b8' }}>No delivery events yet. Events will appear here once Resend processes the email.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {deliveryData.events.map((ev: any) => {
                  const cfg = deliveryStatusConfig[ev.event_type.replace('email.', '')] || { color: '#64748b', bg: '#f1f5f9', label: ev.event_type };
                  return (
                    <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '6px 10px', background: cfg.bg, borderRadius: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                      {ev.recipient && <span style={{ color: '#64748b' }}>→ {ev.recipient}</span>}
                      <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>{new Date(ev.created_at + (ev.created_at.includes('T') ? '' : 'Z')).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Attachments with preview */}
        {email.attachments && email.attachments.length > 0 && (
          <div style={{ marginTop: 24 }}>
            {email.attachments.map(att => (
              <div key={att.id} style={{ display: 'inline-block', marginRight: 10, marginBottom: 10 }}>
                <a
                  className="attachment"
                  href={attachmentApi.downloadUrl(att.id)}
                  download={att.filename}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="file-icon">
                    {isImage(att.mime_type) ? <ImageIcon /> : <FileText />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong>{att.filename}</strong>
                    <small>{formatFileSize(att.size)}</small>
                  </div>
                  <Paperclip />
                </a>
                {(isImage(att.mime_type) || isPdf(att.mime_type)) && (
                  <button
                    onClick={() => setPreviewAttachment(att)}
                    style={{ display: 'block', width: '100%', padding: '4px 8px', border: '1px solid #E8E5E0', borderTop: 'none', borderRadius: '0 0 8px 8px', background: '#f8f9fa', cursor: 'pointer', fontSize: 11, color: '#F2782E', textAlign: 'center' }}
                  >
                    Quick preview
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Attachment preview modal */}
        {previewAttachment && (
          <div
            onClick={() => setPreviewAttachment(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, maxWidth: '90vw', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
                <strong style={{ fontSize: 14 }}>{previewAttachment.filename}</strong>
                <button onClick={() => setPreviewAttachment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X style={{ width: 18, height: 18 }} /></button>
              </div>
              <div style={{ overflow: 'auto', padding: 16 }}>
                {isImage(previewAttachment.mime_type) ? (
                  <img src={attachmentApi.downloadUrl(previewAttachment.id)} alt={previewAttachment.filename} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
                ) : isPdf(previewAttachment.mime_type) ? (
                  <iframe src={attachmentApi.downloadUrl(previewAttachment.id)} style={{ width: '70vw', height: '70vh', border: 'none' }} title={previewAttachment.filename} />
                ) : null}
              </div>
            </div>
          </div>
        )}

        <div className="reply-row">
          <button className="reply-btn" onClick={() => onReply(email)}>
            <Reply /> Reply
          </button>
          <button className="reply-btn" onClick={() => onReplyAll(email)}>
            <ReplyAll /> Reply All
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
