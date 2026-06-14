import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Code2, Cloud, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-64 h-64 bg-accent-500/10 rounded-full blur-3xl bottom-10 right-10 pointer-events-none" />

      <div className="text-center max-w-lg relative">
        {/* Big 404 */}
        <div className="relative mb-6">
          <p className="text-[10rem] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.1) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-2xl shadow-brand-900/50">
              <Home size={36} className="text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-black text-white mb-3">Page Not Found</h1>
        <p className="text-gray-400 mb-10">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Shield, label: 'Cybersecurity', href: '/cybersecurity', color: 'text-red-400', bg: 'bg-red-500/10' },
            { icon: Code2, label: 'Software Dev', href: '/software', color: 'text-brand-400', bg: 'bg-brand-500/10' },
            { icon: Cloud, label: 'Cloud', href: '/cloud', color: 'text-accent-400', bg: 'bg-accent-500/10' },
          ].map(({ icon: Icon, label, href, color, bg }) => (
            <Link
              key={href}
              to={href}
              className="glass-card border border-white/5 hover:border-brand-500/30 p-4 flex flex-col items-center gap-2 transition-all hover:-translate-y-0.5 group"
            >
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon size={17} className={color} />
              </div>
              <span className="text-gray-400 text-xs group-hover:text-white transition-colors">{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <Link to="/contact" className="btn-secondary">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
