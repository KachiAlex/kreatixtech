import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, User } from 'lucide-react';

interface UserAccount {
  id: number;
  email: string;
  display_name: string;
  is_active: boolean;
}

interface LoginProps {
  onLogin: (user: UserAccount) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange rounded-2xl flex items-center justify-center mb-4 shadow-lg ring-4 ring-white">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-ink tracking-tighter uppercase">KREATIX <span className="text-orange">MAIL</span></h1>
          <p className="text-gray-500 mt-2 font-medium">Enterprise Communication Portal</p>
        </div>

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

          <div>
            <label className="block text-xs font-bold text-ink/50 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
            Secure enterprise email for<br/>
            Kreatix Technologies &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
