import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const navLinks = [
  { label: 'Home',          href: '/' },
  { label: 'Cybersecurity', href: '/services/cybersecurity' },
  { label: 'Work',          href: '/portfolio' },
  { label: 'About',         href: '/about' },
  { label: 'Client Portal', href: '/portal/vapt-request' },
];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
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
      scrolled ? 'bg-ink-950/95 backdrop-blur-md border-b border-ink-700' : 'bg-transparent'
    )}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center flex-shrink-0">
              <span className="text-ink-950 font-black text-xs leading-none">K</span>
            </div>
            <span className="font-bold text-white tracking-tight">Kreatix Technologies</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === '/'}
                className={({ isActive }) => cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'text-white bg-ink-700'
                    : 'text-slate-400 hover:text-white hover:bg-ink-800'
                )}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/contact" className="btn-outline py-2 px-4 text-xs">
              Contact
            </Link>
            <Link to="/portal/vapt-request" className="btn-teal py-2 px-4 text-xs">
              Request Assessment
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-ink-700 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-ink-900 border-t border-ink-700 px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === '/'}
              className={({ isActive }) => cn(
                'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'text-white bg-ink-700' : 'text-slate-400 hover:text-white hover:bg-ink-800'
              )}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-ink-700 mt-3">
            <Link to="/contact" className="btn-outline justify-center py-2.5">Contact</Link>
            <Link to="/portal/vapt-request" className="btn-teal justify-center py-2.5">Request Assessment</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
