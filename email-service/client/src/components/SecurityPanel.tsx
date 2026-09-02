import React, { useState, useEffect } from 'react';
import { ShieldAlert, Ban, CheckCircle, Trash2, Plus, Shield, AlertTriangle, Eye } from 'lucide-react';
import { securityApi } from '../api';
import { useToast } from './Toast';

const SecurityPanel: React.FC = () => {
  const { success: toastSuccess, error: toastError, prompt: promptDialog, confirm: confirmDialog } = useToast();
  const [blocked, setBlocked] = useState<any[]>([]);
  const [trusted, setTrusted] = useState<any[]>([]);
  const [log, setLog] = useState<any[]>([]);
  const [tab, setTab] = useState<'blocked' | 'trusted' | 'log'>('blocked');

  const refresh = async () => {
    try {
      const [b, t, l] = await Promise.all([
        securityApi.listBlocked(),
        securityApi.listTrusted(),
        securityApi.getLog(30),
      ]);
      setBlocked(b.blocked);
      setTrusted(t.trusted);
      setLog(l.events);
    } catch (e: any) { toastError('Failed to load security data'); }
  };

  useEffect(() => { refresh(); }, []);

  const handleBlock = async () => {
    const email = await promptDialog('Enter email address to block:');
    if (!email) return;
    try { await securityApi.blockSender(email); toastSuccess('Sender blocked'); refresh(); }
    catch (e: any) { toastError(e.message || 'Failed to block sender'); }
  };

  const handleTrust = async () => {
    const email = await promptDialog('Enter email address to trust (whitelist):');
    if (!email) return;
    try { await securityApi.trustSender(email); toastSuccess('Sender trusted'); refresh(); }
    catch (e: any) { toastError(e.message || 'Failed to trust sender'); }
  };

  const handleUnblock = async (id: number, email: string) => {
    const ok = await confirmDialog(`Unblock ${email}?`);
    if (!ok) return;
    try { await securityApi.unblockSender(id); toastSuccess('Sender unblocked'); refresh(); }
    catch { toastError('Failed to unblock'); }
  };

  const handleUntrust = async (id: number, email: string) => {
    const ok = await confirmDialog(`Remove ${email} from trusted list?`);
    if (!ok) return;
    try { await securityApi.untrustSender(id); toastSuccess('Sender removed from trusted'); refresh(); }
    catch { toastError('Failed to remove'); }
  };

  const formatLogEvent = (event: any) => {
    const details = event.details ? JSON.parse(event.details) : {};
    switch (event.event_type) {
      case 'spam_detected':
        return `Spam detected from ${details.from || 'unknown'} (score: ${details.score}) — ${details.subject || 'no subject'}`;
      case 'phishing_blocked':
        return `Phishing attempt blocked from ${details.from || 'unknown'} — ${details.subject || 'no subject'}`;
      case 'sender_blocked':
        return `Email from blocked sender ${details.from || 'unknown'} was rejected`;
      case 'suspicious_link':
        return `Suspicious link detected in email from ${details.from || 'unknown'}`;
      default:
        return event.event_type;
    }
  };

  const eventIcon = (type: string) => {
    switch (type) {
      case 'spam_detected': return <ShieldAlert style={{ width: 16, height: 16, color: '#dc2626' }} />;
      case 'phishing_blocked': return <AlertTriangle style={{ width: 16, height: 16, color: '#dc2626' }} />;
      case 'sender_blocked': return <Ban style={{ width: 16, height: 16, color: '#6b7280' }} />;
      default: return <Eye style={{ width: 16, height: 16, color: '#6b7280' }} />;
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Shield style={{ width: 24, height: 24, color: '#F2782E' }} />
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Email Security</h2>
      </div>

      {/* Security summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#fee2e2', borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626' }}>{blocked.length}</div>
          <div style={{ fontSize: 12, color: '#7f1d1d' }}>Blocked Senders</div>
        </div>
        <div style={{ background: '#d1fae5', borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{trusted.length}</div>
          <div style={{ fontSize: 12, color: '#064e3b' }}>Trusted Senders</div>
        </div>
        <div style={{ background: '#fef3c7', borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#d97706' }}>{log.length}</div>
          <div style={{ fontSize: 12, color: '#78350f' }}>Security Events (30d)</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid #eee' }}>
        {[
          { key: 'blocked', label: 'Blocked Senders', icon: <Ban style={{ width: 15, height: 15 }} /> },
          { key: 'trusted', label: 'Trusted Senders', icon: <CheckCircle style={{ width: 15, height: 15 }} /> },
          { key: 'log', label: 'Security Log', icon: <Eye style={{ width: 15, height: 15 }} /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              border: 'none', borderBottom: tab === t.key ? '2px solid #F2782E' : '2px solid transparent',
              background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              color: tab === t.key ? '#F2782E' : '#666', marginBottom: -2,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Blocked senders tab */}
      {tab === 'blocked' && (
        <div>
          <button
            onClick={handleBlock}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 14 }}
          >
            <Plus style={{ width: 16, height: 16 }} /> Block a sender
          </button>
          {blocked.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#999', fontSize: 14 }}>No blocked senders.</div>
          ) : (
            blocked.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f0f0f0' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{b.email_address}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>Reason: {b.reason || 'manual'} · {new Date(b.blocked_at + 'Z').toLocaleDateString()}</div>
                </div>
                <button onClick={() => handleUnblock(b.id, b.email_address)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }} title="Unblock">
                  <Trash2 style={{ width: 16, height: 16 }} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Trusted senders tab */}
      {tab === 'trusted' && (
        <div>
          <button
            onClick={handleTrust}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 14 }}
          >
            <Plus style={{ width: 16, height: 16 }} /> Trust a sender
          </button>
          {trusted.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#999', fontSize: 14 }}>No trusted senders.</div>
          ) : (
            trusted.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f0f0f0' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.email_address}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>Added {new Date(t.added_at + 'Z').toLocaleDateString()}</div>
                </div>
                <button onClick={() => handleUntrust(t.id, t.email_address)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 4 }} title="Remove">
                  <Trash2 style={{ width: 16, height: 16 }} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Security log tab */}
      {tab === 'log' && (
        <div>
          {log.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#999', fontSize: 14 }}>No security events.</div>
          ) : (
            log.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ marginTop: 2 }}>{eventIcon(e.event_type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{formatLogEvent(e)}</div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{new Date(e.created_at + 'Z').toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SecurityPanel;
