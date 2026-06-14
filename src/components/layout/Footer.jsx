import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ink-950 text-white">
      {/* CTA band */}
      <div className="border-b border-ink-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <p className="text-xs font-medium text-ink-500 uppercase tracking-widest mb-4">Get in touch</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-8">
            Let&apos;s secure<br />the future.
          </h2>
          <Link to="/contact" className="btn-coral">
            Start a Conversation
          </Link>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-coral-500 flex items-center justify-center">
                <span className="text-white font-black text-xs">K</span>
              </div>
              <span className="font-bold text-white tracking-tight text-sm">Kreatix Technologies</span>
            </Link>
            <p className="text-ink-500 text-sm max-w-xs leading-relaxed">
              Innovation via creativity. Building secure, scalable software for ambitious organisations.
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4">Services</p>
              <ul className="space-y-2.5">
                <li><Link to="/services/cybersecurity" className="text-ink-400 hover:text-white text-sm transition-colors">Cybersecurity</Link></li>
                <li><Link to="/contact" className="text-ink-400 hover:text-white text-sm transition-colors">Software Development</Link></li>
                <li><Link to="/contact" className="text-ink-400 hover:text-white text-sm transition-colors">Cloud Architecture</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4">Company</p>
              <ul className="space-y-2.5">
                <li><Link to="/about" className="text-ink-400 hover:text-white text-sm transition-colors">About Us</Link></li>
                <li><Link to="/portfolio" className="text-ink-400 hover:text-white text-sm transition-colors">Our Work</Link></li>
                <li><Link to="/contact" className="text-ink-400 hover:text-white text-sm transition-colors">Contact</Link></li>
                <li><Link to="/portal/vapt-request" className="text-ink-400 hover:text-white text-sm transition-colors">Client Portal</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-ink-800 flex flex-col sm:flex-row justify-between gap-3 items-center">
          <p className="text-ink-700 text-xs">{String.fromCharCode(169)} {new Date().getFullYear()} Kreatix Technologies. All rights reserved.</p>
          <Link to="/admin" className="text-ink-700 hover:text-ink-500 text-xs transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}