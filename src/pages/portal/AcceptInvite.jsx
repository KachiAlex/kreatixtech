import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import Logo from '../../components/Logo';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/invitations/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to accept invitation');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-border text-center">
          <div className="flex justify-center mb-4"><Logo size="lg" linkTo="/" className="text-[#0E0E0F]" /></div>
          <h2 className="text-xl font-bold text-ink">Invalid Invitation</h2>
          <p className="mt-2 text-sm text-grey">This invitation link is missing or invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-border">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" linkTo="/" className="text-[#0E0E0F]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">Join Organization</h2>
          <p className="mt-2 text-sm text-grey-dark">
            Set your password to accept the invitation
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-ink">Invitation Accepted</h3>
              <p className="mt-2 text-sm text-grey">
                Your account has been created. Sign in to access the portal.
              </p>
            </div>
            <Link to="/portal/login" className="text-sm text-orange hover:text-orange-deep font-medium">
              Sign In
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-ink">Password</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-border rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink">Confirm Password</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-orange text-white rounded-xl font-bold hover:bg-orange-deep disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Accept & Create Account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
