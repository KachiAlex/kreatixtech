import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '../api';

const cardStyle: React.CSSProperties = { background: 'linear-gradient(135deg, #FFF7F1 0%, #FAF8F5 50%, #FDF1E8 100%)' };

// ── Forgot Password ───────────────────────────────────────────────────────
export const ForgotPassword: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={cardStyle}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange rounded-2xl flex items-center justify-center mb-4 shadow-lg ring-4 ring-white">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-ink tracking-tighter uppercase">KREATIX <span className="text-orange">MAIL</span></h1>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-ink">Check your email</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              If an account exists for <span className="font-bold text-ink">{email}</span>, you'll receive a password reset link shortly. The link expires in 30 minutes.
            </p>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-orange hover:text-orange-deep font-bold transition-colors mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-ink mb-2">Forgot password?</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your email address and we'll send you a link to reset your password.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink/50 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@kreatixtech.com"
                  className="w-full px-4 py-3 bg-offwhite border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all font-medium text-ink"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-orange text-white rounded-xl font-bold hover:bg-orange-deep transition-all shadow-md hover:shadow-lg disabled:opacity-50 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Reset Password ────────────────────────────────────────────────────────
export const ResetPassword: React.FC<{ token: string; onDone: () => void }> = ({ token, onDone }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(onDone, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={cardStyle}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange rounded-2xl flex items-center justify-center mb-4 shadow-lg ring-4 ring-white">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-ink tracking-tighter uppercase">KREATIX <span className="text-orange">MAIL</span></h1>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-ink">Password reset!</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your password has been updated. You'll be redirected to the login page shortly.
            </p>
            <button
              onClick={onDone}
              className="text-sm text-orange hover:text-orange-deep font-bold transition-colors"
            >
              Go to login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-ink mb-2">Set a new password</h2>
            <p className="text-sm text-gray-500 mb-6">Choose a new password for your Kreatix Mail account.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink/50 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-offwhite border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all font-medium text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink/50 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-offwhite border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all font-medium text-ink"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-orange text-white rounded-xl font-bold hover:bg-orange-deep transition-all shadow-md hover:shadow-lg disabled:opacity-50 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
