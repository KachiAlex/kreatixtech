import React, { useState, useEffect } from 'react';
import { Shield, Key, CheckCircle, AlertCircle, X } from 'lucide-react';
import { twoFactorApi } from '../api';

const TwoFactorPanel: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await twoFactorApi.status();
      setEnabled(data.enabled);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSetup = async () => {
    try {
      setError('');
      const data = await twoFactorApi.setup();
      setSetupData(data);
    } catch (e: any) { setError(e.message); }
  };

  const handleVerify = async () => {
    try {
      setError('');
      await twoFactorApi.verify(code);
      setEnabled(true);
      setSetupData(null);
      setCode('');
      setSuccess('Two-factor authentication enabled successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) { setError(e.message); }
  };

  const handleDisable = async () => {
    try {
      setError('');
      await twoFactorApi.disable(code);
      setEnabled(false);
      setCode('');
      setSuccess('Two-factor authentication disabled.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>Loading...</div>;

  return (
    <div className="space-y-4">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Shield style={{ width: 20, height: 20, color: '#F2782E' }} />
        <strong style={{ fontSize: 15 }}>Two-Factor Authentication (2FA)</strong>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>
          <AlertCircle style={{ width: 16, height: 16 }} /> {error}
        </div>
      )}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, color: '#16a34a', fontSize: 13 }}>
          <CheckCircle style={{ width: 16, height: 16 }} /> {success}
        </div>
      )}

      {enabled ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', marginBottom: 12 }}>
            <CheckCircle style={{ width: 18, height: 18, color: '#16a34a' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>2FA is enabled</span>
          </div>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>Enter your current 6-digit code to disable 2FA.</p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
            placeholder="6-digit code"
            style={{ width: 180, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, letterSpacing: 2, marginBottom: 8 }}
          />
          <div>
            <button
              onClick={handleDisable}
              disabled={code.length !== 6}
              style={{ padding: '8px 16px', background: code.length === 6 ? '#dc2626' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, cursor: code.length === 6 ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600 }}
            >
              Disable 2FA
            </button>
          </div>
        </div>
      ) : setupData ? (
        <div>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.) or enter the secret manually.
          </p>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ background: '#fff', padding: 12, borderRadius: 10, border: '1px solid #e8e5e0' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(setupData.otpauthUrl)}`} alt="QR Code" style={{ width: 180, height: 180 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Secret key:</label>
              <code style={{ display: 'block', padding: '8px 12px', background: '#f5f5f5', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: 200 }}>{setupData.secret}</code>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Enter the 6-digit code from your authenticator app:</p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
            placeholder="000000"
            style={{ width: 180, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 18, letterSpacing: 4, textAlign: 'center', marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleVerify}
              disabled={code.length !== 6}
              style={{ padding: '8px 16px', background: code.length === 6 ? '#F2782E' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, cursor: code.length === 6 ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600 }}
            >
              Verify & Enable
            </button>
            <button
              onClick={() => { setSetupData(null); setCode(''); setError(''); }}
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
            Add an extra layer of security to your account. When 2FA is enabled, you'll need to enter a code from your authenticator app in addition to your password.
          </p>
          <button
            onClick={handleSetup}
            style={{ padding: '10px 20px', background: '#F2782E', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Key style={{ width: 16, height: 16 }} /> Set up 2FA
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorPanel;
