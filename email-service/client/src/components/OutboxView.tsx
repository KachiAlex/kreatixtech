import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, AlertCircle, Mail } from 'lucide-react';
import { outboxApi } from '../api';
import { useToast } from './Toast';
import type { OutboxItem } from '../types';

const OutboxView: React.FC = () => {
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<number | null>(null);
  const { success: toastSuccess, error: toastError, confirm: confirmDialog } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await outboxApi.list();
      setItems(data.outbox);
    } catch (e) { console.error('Failed to load outbox', e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRetry = async (id: number) => {
    setRetrying(id);
    try {
      await outboxApi.retry(id);
      await load();
      toastSuccess('Email sent successfully on retry');
    } catch (e: any) {
      toastError(e.message || 'Retry failed — email remains in outbox');
    }
    setRetrying(null);
  };

  const handleDelete = async (id: number) => {
    const ok = await confirmDialog('Delete this failed email? This action cannot be undone.');
    if (!ok) return;
    try { await outboxApi.delete(id); await load(); toastSuccess('Failed email removed from outbox'); } catch (e: any) { toastError('Failed to delete outbox item'); }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
        <div style={{ width: 28, height: 28, margin: '0 auto', border: '3px solid #E8E5E0', borderTopColor: '#F2782E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxHeight: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Mail className="w-6 h-6 text-orange" />
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111213', margin: 0 }}>Outbox</h1>
        <span style={{ fontSize: 13, color: '#999' }}>Failed email deliveries</span>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <AlertCircle style={{ width: 48, height: 48, margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>No failed emails. Everything was sent successfully.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} style={{ border: '1px solid #EAE8E4', borderRadius: 12, padding: 16, background: '#FAF9F7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <AlertCircle style={{ width: 16, height: 16, color: '#d93025', flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#111213' }}>{item.subject}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#666', margin: '2px 0' }}>
                    <b>To:</b> {item.to_address}
                  </p>
                  {item.cc_address && (
                    <p style={{ fontSize: 13, color: '#666', margin: '2px 0' }}>
                      <b>Cc:</b> {item.cc_address}
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0' }}>
                    {new Date(item.created_at + (item.created_at.includes('T') ? '' : 'Z')).toLocaleString()}
                    {item.retry_count > 0 && <span> · Retried {item.retry_count} time(s)</span>}
                  </p>
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, fontSize: 12, color: '#d93025' }}>
                    {item.error_message}
                  </div>
                  {item.body && (
                    <p style={{ fontSize: 13, color: '#888', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                      {item.body.substring(0, 100)}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => handleRetry(item.id)}
                    disabled={retrying === item.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#F2782E', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: retrying === item.id ? 0.5 : 1 }}
                  >
                    <RefreshCw style={{ width: 14, height: 14 }} />
                    {retrying === item.id ? 'Retrying...' : 'Retry'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'white', color: '#d93025', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutboxView;
