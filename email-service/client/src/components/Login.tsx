import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, Shield, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../auth-context';
import { ForgotPassword } from './PasswordReset';

const SAVED_KEY = 'kreatix_saved_accounts';
const SKIP_KEY = 'kreatix_skip_autologin';

const getSavedAccounts = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return {};
    return JSON.parse(atob(raw));
  } catch { return {}; }
};

const saveCred = (email: string, password: string) => {
  try {
    const saved = getSavedAccounts();
    saved[email.toLowerCase()] = btoa(password);
    localStorage.setItem(SAVED_KEY, btoa(JSON.stringify(saved)));
  } catch { /* ignore */ }
};

const removeCred = (email: string) => {
  try {
    const saved = getSavedAccounts();
    delete saved[email.toLowerCase()];
    localStorage.setItem(SAVED_KEY, btoa(JSON.stringify(saved)));
  } catch { /* ignore */ }
};

const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const [picker, setPicker] = useState(false);

  const autoLogin = async (savedEmail: string) => {
    const saved = getSavedAccounts();
    const savedPassword = saved[savedEmail];
    if (!savedPassword) { setPicker(false); return; }
    setEmail(savedEmail);
    setLoading(true);
    setError('');
    try {
      await login(savedEmail, atob(savedPassword), undefined, true);
    } catch {
      // Saved credential is stale — drop it so it stops failing silently
      removeCred(savedEmail);
      setSavedEmails(prev => {
        const next = prev.filter(e => e !== savedEmail);
        if (next.length === 0) setPicker(false);
        return next;
      });
      setLoading(false);
    }
  };

  // On mount: seamless sign-in when possible
  useEffect(() => {
    const emails = Object.keys(getSavedAccounts());
    setSavedEmails(emails);
    if (emails.length === 0) return;

    // Explicit logout → don't bounce back in; offer the picker instead
    if (localStorage.getItem(SKIP_KEY) === '1') {
      setPicker(true);
      return;
    }
    if (emails.length === 1) {
      autoLogin(emails[0]);
    } else {
      setPicker(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (mode === 'login') {
        await login(normalizedEmail, password, totpCode || undefined, rememberMe);
        if (rememberMe) {
          saveCred(normalizedEmail, password);
        } else {
          removeCred(normalizedEmail);
        }
      } else {
        await register(normalizedEmail, password, displayName);
      }
    } catch (err: any) {
      if (err.message === '2FA_REQUIRED') {
        setNeeds2FA(true);
        setError('');
      } else if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Cannot connect to the server. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = (em: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeCred(em);
    setSavedEmails(prev => {
      const next = prev.filter(x => x !== em);
      if (next.length === 0) setPicker(false);
      return next;
    });
  };

  return (
    <>
    {showForgot && <ForgotPassword onBack={() => { setShowForgot(false); setError(''); }} />}
    {!showForgot && (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #FFF7F1 0%, #FAF8F5 50%, #FDF1E8 100%)' }}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange rounded-2xl flex items-center justify-center mb-4 shadow-lg ring-4 ring-white">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-ink tracking-tighter uppercase">KREATIX <span className="text-orange">MAIL</span></h1>
          <p className="text-gray-500 mt-2 font-medium">Enterprise Communication Portal</p>
        </div>

        {/* ── Saved account picker ─────────────────────────────────────────── */}
        {picker && savedEmails.length > 0 && mode === 'login' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-ink text-center mb-4">Choose an account</h2>
            {savedEmails.map(em => (
              <div
                key={em}
                onClick={() => !loading && autoLogin(em)}
                className="group flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-border bg-offwhite hover:border-orange hover:bg-orange/5 cursor-pointer transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-orange/10 text-orange flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {em.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 text-sm font-semibold text-ink truncate">{em}</span>
                {loading && email === em && (
                  <div className="w-4 h-4 border-2 border-orange/30 border-t-orange rounded-full animate-spin"></div>
                )}
                <button
                  type="button"
                  onClick={(e) => handleRemoveSaved(em, e)}
                  className="p-1 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  title={`Remove ${em}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={() => { setPicker(false); setError(''); }}
              className="w-full text-center text-sm text-orange hover:text-orange-deep font-bold transition-colors pt-2"
            >
              Use another account
            </button>
          </div>
        )}

        {(!picker || savedEmails.length === 0 || mode === 'register') && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-ink/50 uppercase tracking-widest mb-1.5 ml-1">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-offwhite border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all font-medium text-ink"
              />
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

          <div>
            <label className="block text-xs font-bold text-ink/50 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 bg-offwhite border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all font-medium text-ink"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-ink transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <label className="flex items-center gap-2 cursor-pointer select-none ml-1">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-orange cursor-pointer"
              />
              <span className="text-sm text-gray-600 font-medium">Keep me signed in on this device</span>
            </label>
          )}

          {mode === 'login' && (
            <div className="text-right -mt-2">
              <button
                type="button"
                onClick={() => { setShowForgot(true); setError(''); }}
                className="text-sm text-orange hover:text-orange-deep font-bold transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-orange text-white rounded-xl font-bold hover:bg-orange-deep transition-all shadow-md hover:shadow-lg disabled:opacity-50 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
        )}

        {needs2FA && (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 text-xs font-bold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Enter your 6-digit authenticator code
            </div>
            <div>
              <label className="block text-xs font-bold text-ink/50 uppercase tracking-widest mb-1.5 ml-1">2FA Code</label>
              <input
                type="text"
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 bg-offwhite border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all font-medium text-ink text-center text-2xl tracking-widest"
              />
            </div>
            <button
              type="submit"
              disabled={loading || totpCode.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-4 bg-orange text-white rounded-xl font-bold hover:bg-orange-deep transition-all shadow-md hover:shadow-lg disabled:opacity-50 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Verify & Sign In</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-sm text-gray-500 hover:text-orange font-medium transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
            Secure enterprise email for<br/>
            Kreatix Technologies &copy; 2026
          </p>
        </div>
      </div>
    </div>
    )}
    </>
  );
};

export default Login;
