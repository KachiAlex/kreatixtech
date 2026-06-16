import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, Building2, User } from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';

export default function PortalLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    orgName: '',
    subdomain: ''
  });

  const { login, register, isAuthenticated } = usePortal();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/portal/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let result;
      
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          orgName: formData.orgName,
          subdomain: formData.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '')
        });
      }

      if (result.success) {
        navigate('/portal/dashboard');
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-border">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-orange/10 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-orange" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-ink">
            {isLogin ? 'VAPT Portal Login' : 'Request VAPT Assessment'}
          </h2>
          <p className="mt-2 text-sm text-grey-dark">
            {isLogin 
              ? 'Access your security assessment dashboard' 
              : 'Create an account to submit your scope'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-ink">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-border rounded-xl placeholder-grey focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-ink">
                  Organization Name
                </label>
                <div className="mt-1 relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey" />
                  <input
                    id="orgName"
                    name="orgName"
                    type="text"
                    required={!isLogin}
                    value={formData.orgName}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-border rounded-xl placeholder-grey focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                    placeholder="Acme Inc."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subdomain" className="block text-sm font-medium text-ink">
                  Portal Subdomain
                </label>
                <div className="mt-1 relative">
                  <input
                    id="subdomain"
                    name="subdomain"
                    type="text"
                    required={!isLogin}
                    value={formData.subdomain}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-3 border border-border rounded-xl placeholder-grey focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                    placeholder="your-company"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-grey text-sm">
                    .portal.kreatixtech.com
                  </span>
                </div>
                <p className="mt-1 text-xs text-grey">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink">
              Email Address
            </label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-border rounded-xl placeholder-grey focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              Password
            </label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
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
            {!isLogin && (
              <p className="mt-1 text-xs text-grey">
                Must be at least 6 characters
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-orange hover:bg-orange-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-orange hover:text-orange-deep font-medium"
          >
            {isLogin 
              ? "Don't have an account? Request assessment" 
              : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="text-center pt-4 border-t border-border">
          <Link to="/" className="text-sm text-grey hover:text-ink">
            ← Back to main website
          </Link>
        </div>
      </div>
    </div>
  );
}
