import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ink-900 border-t border-ink-700">
      {/* CTA band */}
      <div className="border-b border-ink-700">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-4">Get in touch</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-8">
            Let&apos;s secure<br />the future.
          </h2>
          <Link to="/contact" className="btn-teal">
            Start a Conversation
          </Link>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center">
                <span className="text-ink-950 font-black text-xs">K</span>
              </div>
              <span className="font-bold text-white tracking-tight text-sm">Kreatix Technologies</span>
            </Link>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              Innovation via creativity. Building secure, scalable software for ambitious organisations.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Services</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Cybersecurity', href: '/services/cybersecurity' },
                  { label: 'Software Development', href: '/contact' },
                  { label: 'Cloud Architecture', href: '/contact' },
                ].map(l => (
                  <li key={l.href}>
                    <Link to={l.href} className="text-slate-400 hover:text-white text-sm transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Company</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'About Us',     href: '/about' },
                  { label: 'Our Work',     href: '/portfolio' },
                  { label: 'Contact',      href: '/contact' },
                  { label: 'Client Portal',href: '/portal/vapt-request' },
                ].map(l => (
                  <li key={l.href}>
                    <Link to={l.href} className="text-slate-400 hover:text-white text-sm transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-ink-700 flex flex-col sm:flex-row justify-between gap-3 items-center">
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Kreatix Technologies. All rights reserved.</p>
          <Link to="/admin" className="text-slate-700 hover:text-slate-500 text-xs transition-colors">Admin</Link>
        </div>
      </div>

    </footer>
  );
}
