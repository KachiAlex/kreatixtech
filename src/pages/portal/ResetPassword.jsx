import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import Logo from '../../components/Logo';

const API_URL = import.meta.env.VITE_API_URL || 'https://kreatixtech.fly.dev';

export default function ResetPassword() {
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
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to reset password');
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
          <h2 className="text-xl font-bold text-ink">Invalid Reset Link</h2>
          <p className="mt-2 text-sm text-grey">This password reset link is missing or invalid.</p>
          <Link to="/portal/forgot-password" className="mt-4 inline-block text-sm text-orange hover:text-orange-deep font-medium">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-border">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" linkTo="/" className="text-[#0E0E0F]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">New Password</h2>
          <p className="mt-2 text-sm text-grey-dark">
            Enter your new password below
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Password Updated</h3>
              <p className="mt-2 text-sm text-grey">
                Your password has been reset successfully.
              </p>
            </div>
            <Link
              to="/portal/login"
              className="inline-flex items-center text-sm text-orange hover:text-orange-deep font-medium"
            >
              Sign in with new password
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-ink">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-border rounded-xl placeholder-grey focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                    placeholder="••••••••"
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-border rounded-xl placeholder-grey focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-orange hover:bg-orange-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Updating...
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>

            <div className="text-center">
              <Link
                to="/portal/login"
                className="inline-flex items-center text-sm text-orange hover:text-orange-deep font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
