import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  confirm: (message: string) => Promise<boolean>;
  prompt: (message: string, defaultValue?: string) => Promise<string | null>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

let toastId = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{ message: string; resolve: (v: boolean) => void } | null>(null);
  const [promptState, setPromptState] = useState<{ message: string; value: string; resolve: (v: string | null) => void } | null>(null);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast]);
  const error = useCallback((msg: string) => toast(msg, 'error', 6000), [toast]);
  const info = useCallback((msg: string) => toast(msg, 'info'), [toast]);

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const prompt = useCallback((message: string, defaultValue = ''): Promise<string | null> => {
    return new Promise(resolve => {
      setPromptState({ message, value: defaultValue, resolve });
    });
  }, []);

  const handleConfirm = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  const handlePrompt = (result: string | null) => {
    if (promptState) {
      promptState.resolve(result);
      setPromptState(null);
    }
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: '#16a34a',
    error: '#dc2626',
    info: '#2563eb',
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, info, confirm, prompt }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                background: 'white',
                borderRadius: 12,
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                borderLeft: `4px solid ${colors[t.type]}`,
                minWidth: 280,
                maxWidth: 420,
                pointerEvents: 'auto',
                animation: 'toastIn 0.25s ease-out',
              }}
            >
              <Icon style={{ width: 20, height: 20, color: colors[t.type], flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: '#333', flex: 1, lineHeight: 1.4 }}>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#999', flexShrink: 0 }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirm dialog */}
      {confirmState && (
        <div
          onClick={() => handleConfirm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <AlertCircle style={{ width: 24, height: 24, color: '#dc2626' }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: '#111213', margin: 0 }}>{confirmState.message}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleConfirm(false)}
                style={{
                  padding: '8px 18px',
                  border: '1px solid #EAE8E4',
                  background: 'white',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#666',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirm(true)}
                style={{
                  padding: '8px 18px',
                  border: 'none',
                  background: '#dc2626',
                  color: 'white',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt dialog */}
      {promptState && (
        <div
          onClick={() => handlePrompt(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Info style={{ width: 24, height: 24, color: '#2563eb' }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: '#111213', margin: 0 }}>{promptState.message}</p>
            </div>
            <input
              type="text"
              value={promptState.value}
              autoFocus
              onChange={e => setPromptState(prev => prev ? { ...prev, value: e.target.value } : null)}
              onKeyDown={e => {
                if (e.key === 'Enter') handlePrompt(promptState.value);
                if (e.key === 'Escape') handlePrompt(null);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #EAE8E4',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                marginBottom: 16,
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => handlePrompt(null)}
                style={{
                  padding: '8px 18px',
                  border: '1px solid #EAE8E4',
                  background: 'white',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#666',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handlePrompt(promptState.value)}
                style={{
                  padding: '8px 18px',
                  border: 'none',
                  background: '#F2782E',
                  color: 'white',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
