import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import Logo from '../../components/Logo';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send reset link');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-border">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" linkTo="/" className="text-[#0E0E0F]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">Reset Password</h2>
          <p className="mt-2 text-sm text-grey-dark">
            Enter your email and we will send you a reset link
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Check your email</h3>
              <p className="mt-2 text-sm text-grey">
                If an account exists for {email}, we have sent a password reset link.
              </p>
            </div>
            <Link
              to="/portal/login"
              className="inline-flex items-center text-sm text-orange hover:text-orange-deep font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
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
                <label htmlFor="email" className="block text-sm font-medium text-ink">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-border rounded-xl placeholder-grey focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                    placeholder="you@company.com"
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
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="text-center">
              <Link
                to="/portal/login"
                className="text-sm text-orange hover:text-orange-deep font-medium"
              >
                Back to login
              </Link>
            </div>
          </>
        )}

        <div className="text-center pt-4 border-t border-border">
          <Link to="/" className="text-sm text-grey hover:text-ink">
            ← Back to main website
          </Link>
        </div>
      </div>
    </div>
  );
}
