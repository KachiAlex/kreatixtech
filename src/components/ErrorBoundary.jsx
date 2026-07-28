import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const isPortal = typeof window !== 'undefined' && window.location.pathname.includes('/portal');

      return (
        <div className="min-h-screen bg-[#0E0E0F] text-white flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-[#F2782E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-3">
              {isPortal ? 'Portal Error' : 'Something went wrong'}
            </h1>
            <p className="text-white/60 text-sm mb-8">
              An unexpected error occurred. You can try reloading the page or return to the {isPortal ? 'portal login' : 'home page'}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[#F2782E] text-white font-semibold text-sm rounded-full hover:bg-[#e06d20] transition-colors"
              >
                Reload Page
              </button>
              <a
                href={isPortal ? '/#/portal/login' : '/'}
                className="px-6 py-3 border border-white/20 text-white font-semibold text-sm rounded-full hover:bg-white/5 transition-colors"
              >
                {isPortal ? 'Go to Login' : 'Go Home'}
              </a>
            </div>
            {this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-white/40 text-xs cursor-pointer hover:text-white/60">
                  Error details
                </summary>
                <pre className="mt-2 text-xs text-white/40 overflow-auto p-4 bg-white/5 rounded-lg">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
