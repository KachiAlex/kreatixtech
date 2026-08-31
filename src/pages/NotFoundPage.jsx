import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Code2, Cloud } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-6 pt-16">
      <div className="text-center max-w-lg">
        <p className="text-8xl font-black text-surface-300 tracking-tighter mb-4 select-none">404</p>
        <h1 className="text-3xl font-black text-ink-900 tracking-tight mb-4">Page Not Found</h1>
        <p className="text-ink-500 text-sm mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Shield, label: 'Cybersecurity', href: '/services/cybersecurity' },
            { icon: Code2,  label: 'Portfolio',     href: '/portfolio' },
            { icon: Cloud,  label: 'Contact',       href: '/contact' },
          ].map(({ icon: Icon, label, href }) => (
            <Link key={href} to={href}
              className="card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow bg-white">
              <Icon size={16} className="text-coral-500" />
              <span className="text-ink-500 text-xs">{label}</span>
            </Link>
          ))}
        </div>
        <Link to="/" className="btn-primary text-sm">
          <ArrowLeft size={15} /> Back to Home
        </Link>
      </div>
    </div>
  );
}