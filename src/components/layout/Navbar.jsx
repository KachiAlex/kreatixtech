import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Cybersecurity', href: '/services/cybersecurity' },
  { label: 'Work', href: '/portfolio' },
  { label: 'About', href: '/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/90 backdrop-blur-md border-b border-surface-300' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-coral-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm leading-none">K</span>
            </div>
            <div className="leading-none">
              <span className="font-bold text-ink-900 text-sm tracking-tight">Kreatix</span>
              <span className="block text-ink-400 text-[10px] tracking-wide -mt-0.5">Technologies</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === '/'}
                className={({ isActive }) => cn(
                  'text-xs font-semibold uppercase tracking-widest transition-colors',
                  isActive ? 'text-ink-900' : 'text-ink-400 hover:text-ink-900'
                )}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/contact" className="text-xs font-semibold text-ink-500 hover:text-ink-900 transition-colors">
              Contact
            </Link>
            <Link to="/portal/vapt-request" className="btn-outline py-2 px-5 text-xs">
              Request Assessment
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-surface-200 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-surface-300 px-6 py-4 space-y-1 shadow-xl">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === '/'}
              className={({ isActive }) => cn(
                'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'text-ink-900 bg-surface-100' : 'text-ink-400 hover:text-ink-900 hover:bg-surface-100'
              )}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-surface-300 mt-3">
            <Link to="/contact" className="btn-ghost justify-center py-2.5 text-sm">Contact</Link>
            <Link to="/portal/vapt-request" className="btn-outline justify-center py-2.5 text-sm">Request Assessment</Link>
          </div>
        </div>
      )}
    </nav>
  );
}