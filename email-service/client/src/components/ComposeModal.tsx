import React, { useState, useEffect, useRef } from 'react';
import {
  X, Minimize2, Maximize2, Trash2, Send, Paperclip, ChevronDown,
  Bold, Italic, Underline, Strikethrough, Link2, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Image as ImageIcon,
  Smile, Type, Palette, Signature, MoreVertical,
} from 'lucide-react';
import { emailApi, signatureApi } from '../api';
import { useAuth } from '../auth-context';
import type { Email, Signature as SigType } from '../types';

interface ComposeModalProps {
  onClose: () => void;
  replyTo?: Email | null;
  forwardFrom?: Email | null;
}

const ComposeModal: React.FC<ComposeModalProps> = ({ onClose, replyTo, forwardFrom }) => {
  const { user } = useAuth();
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [signatures, setSignatures] = useState<SigType[]>([]);
  const [showSigPopup, setShowSigPopup] = useState(false);
  const [showSendPopup, setShowSendPopup] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigPopupRef = useRef<HTMLDivElement>(null);
  const sendPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (replyTo) {
      setTo(replyTo.from_address);
      setSubject(replyTo.subject.startsWith('Re: ') ? replyTo.subject : `Re: ${replyTo.subject}`);
      if (replyTo.cc_address) { setCc(replyTo.cc_address); setShowCc(true); }
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = `<br><br><blockquote style="border-left:2px solid #E8E5E0;padding-left:12px;margin:0;color:#6B6F76;font-size:13px;">On ${replyTo.received_at}, ${replyTo.from_name || replyTo.from_address} wrote:<br><br>${replyTo.html || replyTo.text?.replace(/\n/g, '<br>') || ''}</blockquote>`;
        }
      }, 100);
    } else if (forwardFrom) {
      setSubject(forwardFrom.subject.startsWith('Fwd: ') ? forwardFrom.subject : `Fwd: ${forwardFrom.subject}`);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = `<br><br><div style="color:#6B6F76;font-size:13px;border-top:1px solid #E8E5E0;padding-top:12px;">---------- Forwarded message ----------<br>From: ${forwardFrom.from_name || forwardFrom.from_address}<br>Date: ${forwardFrom.received_at}<br>Subject: ${forwardFrom.subject}<br><br>${forwardFrom.html || forwardFrom.text?.replace(/\n/g, '<br>') || ''}</div>`;
        }
      }, 100);
    }
    loadSignatures();
  }, [replyTo, forwardFrom]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sigPopupRef.current && !sigPopupRef.current.contains(e.target as Node)) setShowSigPopup(false);
      if (sendPopupRef.current && !sendPopupRef.current.contains(e.target as Node)) setShowSendPopup(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadSignatures = async () => {
    try {
      const data = await signatureApi.list();
      setSignatures(data.signatures);
    } catch (e) { console.error(e); }
  };

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) exec('insertImage', url);
  };

  const insertSignature = (html: string) => {
    if (editorRef.current) {
      editorRef.current.innerHTML += `<br><br>${html}`;
    }
    setShowSigPopup(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!to || !subject) return;
    setIsSending(true);
    try {
      const bodyHtml = editorRef.current?.innerHTML || '';
      const bodyText = editorRef.current?.innerText || '';
      await emailApi.send({
        to,
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject,
        body: bodyText,
        html: bodyHtml,
        from: user?.email,
        fromName: user?.display_name,
        replyToId: replyTo?.id,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  if (minimized) {
    return (
      <div style={{ position: 'fixed', bottom: 0, right: 24, width: 280, background: '#fff', borderRadius: '14px 14px 0 0', boxShadow: 'var(--shadow)', zIndex: 21, border: '1px solid #d9d5cf', borderBottom: 0 }}>
        <div className="compose-title" style={{ cursor: 'pointer' }} onClick={() => setMinimized(false)}>
          <span><i></i> {subject || 'New Message'}</span>
          <div className="window-actions">
            <button onClick={(e) => { e.stopPropagation(); setMinimized(false); }}><Maximize2 /></button>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }}><X /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`overlay ${expanded ? 'show' : ''}`} onClick={() => expanded && setExpanded(false)} />
      <div className={`composer ${expanded ? 'expanded' : ''} show`}>
        <div className="compose-title">
          <span><i></i> {replyTo ? 'Reply' : forwardFrom ? 'Forward' : 'New Message'}</span>
          <div className="window-actions">
            <button onClick={() => setMinimized(true)} title="Minimize"><Minimize2 /></button>
            <button onClick={() => setExpanded(!expanded)} title="Maximize"><Maximize2 /></button>
            <button onClick={onClose} title="Close"><X /></button>
          </div>
        </div>

        <div className="fields">
          <div className="field">
            <span>To</span>
            <input type="email" value={to} onChange={(e) => setTo(e.target.value)} required />
            <button type="button" onClick={() => setShowCc(!showCc)}>{showCc ? 'Hide' : 'Cc/Bcc'}</button>
          </div>
          {showCc && (
            <>
              <div className="field">
                <span>Cc</span>
                <input type="text" value={cc} onChange={(e) => setCc(e.target.value)} />
              </div>
              <div className="field">
                <span>Bcc</span>
                <input type="text" value={bcc} onChange={(e) => setBcc(e.target.value)} />
              </div>
            </>
          )}
          <div className="field">
            <span>Subject</span>
            <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
        </div>

        <div className="formatting">
          <div className="format-row">
            <select onChange={(e) => exec('fontSize', e.target.value)} defaultValue="">
              <option value="">Size</option>
              <option value="2">Small</option>
              <option value="3">Normal</option>
              <option value="5">Large</option>
              <option value="6">Huge</option>
            </select>
            <div className="divider" />
            <button className="fmt" onClick={() => exec('bold')} title="Bold"><Bold /></button>
            <button className="fmt" onClick={() => exec('italic')} title="Italic"><Italic /></button>
            <button className="fmt" onClick={() => exec('underline')} title="Underline"><Underline /></button>
            <button className="fmt" onClick={() => exec('strikeThrough')} title="Strikethrough"><Strikethrough /></button>
            <div className="divider" />
            <input type="color" className="colour-input" onChange={(e) => exec('foreColor', e.target.value)} title="Text color" />
            <div className="divider" />
            <button className="fmt" onClick={() => exec('justifyLeft')} title="Align left"><AlignLeft /></button>
            <button className="fmt" onClick={() => exec('justifyCenter')} title="Align center"><AlignCenter /></button>
            <button className="fmt" onClick={() => exec('justifyRight')} title="Align right"><AlignRight /></button>
            <div className="divider" />
            <button className="fmt" onClick={() => exec('insertUnorderedList')} title="Bullet list"><List /></button>
            <button className="fmt" onClick={() => exec('insertOrderedList')} title="Numbered list"><ListOrdered /></button>
            <button className="fmt" onClick={insertLink} title="Insert link"><Link2 /></button>
            <button className="fmt" onClick={insertImage} title="Insert image"><ImageIcon /></button>
          </div>
        </div>

        <div className="editor-wrap">
          <div
            ref={editorRef}
            className="editor"
            contentEditable
            data-placeholder="Compose your message..."
            suppressContentEditableWarning
          />
          {attachments.length > 0 && (
            <div className="attachment-chips">
              {attachments.map((file, i) => (
                <span key={i} className="attachment-chip">
                  <Paperclip style={{ width: 14, height: 14 }} />
                  {file.name}
                  <button onClick={() => removeAttachment(i)}><X style={{ width: 14, height: 14 }} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="compose-footer">
          <div className="send-group">
            <button className="send" onClick={handleSubmit} disabled={isSending || !to || !subject}>
              {isSending ? 'Sending...' : 'Send'}
            </button>
            <div ref={sendPopupRef} style={{ position: 'relative' }}>
              <button className="send-more" onClick={() => setShowSendPopup(!showSendPopup)}><ChevronDown /></button>
              {showSendPopup && (
                <div className="popup show" style={{ bottom: 40, left: 0 }}>
                  <button onClick={() => { setShowSendPopup(false); handleSubmit(); }}>Send now</button>
                  <button onClick={() => { setShowSendPopup(false); alert('Schedule send - coming soon'); }}>Schedule send</button>
                </div>
              )}
            </div>
          </div>
          <div className="footer-tools">
            <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
            <button className="fmt" onClick={() => fileInputRef.current?.click()} title="Attach file"><Paperclip /></button>
            <button className="fmt" onClick={insertImage} title="Insert image"><ImageIcon /></button>
            <button className="fmt" title="Emoji"><Smile /></button>
            <div ref={sigPopupRef} style={{ position: 'relative' }}>
              <button className="fmt footer-signature" onClick={() => setShowSigPopup(!showSigPopup)} title="Signature">
                <Signature /><span>Signature</span>
              </button>
              {showSigPopup && (
                <div className="popup show" style={{ bottom: 40, left: 0, minWidth: 200 }}>
                  {signatures.length === 0 ? (
                    <button onClick={() => setShowSigPopup(false)}>No signatures configured</button>
                  ) : (
                    signatures.map(sig => (
                      <button key={sig.id} onClick={() => insertSignature(sig.html || '')}>
                        {sig.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <button className="icon-btn discard" onClick={onClose} title="Discard"><Trash2 /></button>
        </div>
      </div>
    </>
  );
};

export default ComposeModal;
