import React, { useState, useEffect, useRef } from 'react';
import {
  X, Minimize2, Maximize2, Trash2, Send, Paperclip, ChevronDown,
  Bold, Italic, Underline, Strikethrough, Link2, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Image as ImageIcon,
  Smile, Type, Palette, Signature, MoreVertical, FileText, Lock,
} from 'lucide-react';
import { emailApi, signatureApi, templateApi } from '../api';
import { encryptMessage } from '../crypto-utils';
import { useAuth } from '../auth-context';
import { useAccount } from '../account-context';
import { useToast } from './Toast';
import type { Email, Signature as SigType } from '../types';

interface ComposeModalProps {
  onClose: () => void;
  replyTo?: Email | null;
  replyAll?: boolean;
  forwardFrom?: Email | null;
}

const ComposeModal: React.FC<ComposeModalProps> = ({ onClose, replyTo, replyAll, forwardFrom }) => {
  const { user } = useAuth();
  const { currentEmail, currentName, accounts, primaryEmail, switchAccount } = useAccount();
  const { success: toastSuccess, error: toastError, info: toastInfo, prompt: promptDialog } = useToast();
  const [fromEmail, setFromEmail] = useState(currentEmail);
  const [fromName, setFromName] = useState(currentName);

  useEffect(() => { setFromEmail(currentEmail); setFromName(currentName); }, [currentEmail, currentName]);
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
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [encryptEnabled, setEncryptEnabled] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigPopupRef = useRef<HTMLDivElement>(null);
  const sendPopupRef = useRef<HTMLDivElement>(null);
  const templatePopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (replyTo) {
      // Build recipient list
      // For sent (outbound) emails, reply should go to the original To recipients, not self
      const isOutbound = replyTo.direction === 'outbound';
      const allRecipients: string[] = isOutbound
        ? replyTo.to_address.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [replyTo.from_address];
      const ccRecipients: string[] = [];

      if (replyAll) {
        // Add original To recipients (excluding self)
        const toAddrs = replyTo.to_address.split(',').map((s: string) => s.trim()).filter(Boolean);
        for (const addr of toAddrs) {
          if (addr.toLowerCase() !== (currentEmail || user?.email || '').toLowerCase() && !allRecipients.includes(addr)) {
            allRecipients.push(addr);
          }
        }
        // Add original CC recipients (excluding self)
        if (replyTo.cc_address) {
          const ccAddrs = replyTo.cc_address.split(',').map((s: string) => s.trim()).filter(Boolean);
          for (const addr of ccAddrs) {
            if (addr.toLowerCase() !== (currentEmail || user?.email || '').toLowerCase() && !ccRecipients.includes(addr) && !allRecipients.includes(addr)) {
              ccRecipients.push(addr);
            }
          }
        }
      }

      // For Reply All: first recipient goes in To, rest go in CC along with original CCs
      if (replyAll && allRecipients.length > 1) {
        const toAddr = allRecipients.shift()!;
        setTo(toAddr);
        const remainingCc = [...allRecipients, ...ccRecipients];
        if (remainingCc.length > 0) {
          setCc(remainingCc.join(', '));
          setShowCc(true);
        }
      } else {
        setTo(allRecipients.join(', '));
        if (replyTo.cc_address && !replyAll) { setCc(replyTo.cc_address); setShowCc(true); }
        else if (ccRecipients.length > 0) { setCc(ccRecipients.join(', ')); setShowCc(true); }
        else { setCc(''); }
      }

      setSubject(replyTo.subject.startsWith('Re: ') ? replyTo.subject : `Re: ${replyTo.subject}`);
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
    loadTemplates();
  }, [replyTo, replyAll, forwardFrom]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sigPopupRef.current && !sigPopupRef.current.contains(e.target as Node)) setShowSigPopup(false);
      if (sendPopupRef.current && !sendPopupRef.current.contains(e.target as Node)) setShowSendPopup(false);
      if (templatePopupRef.current && !templatePopupRef.current.contains(e.target as Node)) setShowTemplatePopup(false);
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

  const insertLink = async () => {
    const url = await promptDialog('Enter the URL to link:');
    if (url) exec('createLink', url);
  };

  const insertImage = async () => {
    const url = await promptDialog('Enter the image URL:');
    if (url) exec('insertImage', url);
  };

  const insertSignature = (html: string) => {
    if (editorRef.current) {
      editorRef.current.innerHTML += `<br><br>${html}`;
    }
    setShowSigPopup(false);
  };

  const loadTemplates = async () => {
    try {
      const data = await templateApi.list();
      setTemplates(data.templates);
    } catch (e) { console.error(e); }
  };

  const applyTemplate = (tpl: any) => {
    if (tpl.subject && !subject) setSubject(tpl.subject);
    if (tpl.html && editorRef.current) {
      editorRef.current.innerHTML = tpl.html;
    } else if (tpl.body && editorRef.current) {
      editorRef.current.innerHTML = tpl.body.replace(/\n/g, '<br>');
    }
    setShowTemplatePopup(false);
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
      let bodyHtml = editorRef.current?.innerHTML || '';
      let bodyText = editorRef.current?.innerText || '';

      // Encrypt if enabled
      if (encryptEnabled) {
        const passphrase = await promptDialog('Enter encryption passphrase (share this with recipient securely):');
        if (!passphrase) { setIsSending(false); return; }
        const encrypted = await encryptMessage(bodyText, passphrase);
        bodyText = `-----BEGIN ENCRYPTED MESSAGE-----\n${encrypted}\n-----END ENCRYPTED MESSAGE-----`;
        bodyHtml = `<div style="background:#f0f0f0;padding:16px;border-radius:8px;font-family:monospace;font-size:12px;white-space:pre-wrap;">${bodyText}</div>`;
      }

      const attachmentPayload = await Promise.all(
        attachments.map(async (file) => {
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          const chunkSize = 8192;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
          }
          const base64 = btoa(binary);
          return {
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
            content: base64,
          };
        })
      );

      await emailApi.send({
        to,
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject,
        body: bodyText,
        html: bodyHtml,
        from: fromEmail || user?.email,
        fromName: fromName || user?.display_name,
        replyToId: replyTo?.id,
        attachments: attachmentPayload,
      });
      toastSuccess('Email sent successfully');
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Failed to send email';
      if (msg.includes('saved_to_outbox') || msg.includes('Outbox')) {
        toastError('Email failed to send — saved to Outbox for retry');
      } else {
        toastError(msg);
      }
    } finally {
      setIsSending(false);
    }
  };

  const allFromAccounts = [
    { email: primaryEmail || user?.email || '', name: user?.display_name || '' },
    ...accounts.map(a => ({ email: a.email, name: a.display_name || '' })),
  ].filter(a => a.email);

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
          <span><i></i> {replyTo ? (replyAll ? 'Reply All' : 'Reply') : forwardFrom ? 'Forward' : 'New Message'}</span>
          <div className="window-actions">
            <button onClick={() => setMinimized(true)} title="Minimize"><Minimize2 /></button>
            <button onClick={() => setExpanded(!expanded)} title="Maximize"><Maximize2 /></button>
            <button onClick={onClose} title="Close"><X /></button>
          </div>
        </div>

        <div className="fields">
          <div className="field">
            <span>From</span>
            <select
              value={fromEmail}
              onChange={(e) => {
                const acct = allFromAccounts.find(a => a.email === e.target.value);
                if (acct) { setFromEmail(acct.email); setFromName(acct.name || ''); }
              }}
              style={{ fontSize: 13, border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer', color: '#555' }}
            >
              {allFromAccounts.map(acct => (
                <option key={acct.email} value={acct.email}>{acct.name ? `${acct.name} <${acct.email}>` : acct.email}</option>
              ))}
            </select>
          </div>
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
                  <button onClick={() => { setShowSendPopup(false); toastInfo('Schedule send is coming soon'); }}>Schedule send</button>
                </div>
              )}
            </div>
          </div>
          <div className="footer-tools">
            <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
            <button className="fmt" onClick={() => fileInputRef.current?.click()} title="Attach file"><Paperclip /></button>
            <button className="fmt" onClick={insertImage} title="Insert image"><ImageIcon /></button>
            <button className="fmt" title="Emoji"><Smile /></button>
            <button
              className={`fmt${encryptEnabled ? ' active' : ''}`}
              onClick={() => setEncryptEnabled(!encryptEnabled)}
              title="Encrypt message"
              style={encryptEnabled ? { background: '#F2782E', color: '#fff', borderRadius: 6 } : {}}
            >
              <Lock style={{ width: 16, height: 16 }} />
            </button>
            <div ref={templatePopupRef} style={{ position: 'relative' }}>
              <button className="fmt" onClick={() => setShowTemplatePopup(!showTemplatePopup)} title="Templates" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <FileText style={{ width: 16, height: 16 }} /><span style={{ fontSize: 12 }}>Templates</span>
              </button>
              {showTemplatePopup && (
                <div className="popup show" style={{ bottom: 40, left: 0, minWidth: 200 }}>
                  {templates.length === 0 ? (
                    <button onClick={() => setShowTemplatePopup(false)}>No templates configured</button>
                  ) : (
                    templates.map(tpl => (
                      <button key={tpl.id} onClick={() => applyTemplate(tpl)}>
                        {tpl.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
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
