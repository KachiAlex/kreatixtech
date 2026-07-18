import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { trackClick } from '../../services/analytics';
import Logo from '../Logo';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Cybersecurity', href: '/services/cybersecurity' },
  { label: 'Work', href: '/portfolio' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/team' },
  { label: 'Contact', href: '/contact' },
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
      scrolled ? 'bg-paper/85 backdrop-blur-[12px] border-b border-border shadow-sm' : 'bg-paper/85 backdrop-blur-[12px]'
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-14 py-5">
        {/* Brand */}
        <Logo size="md" />

        {/* Desktop nav */}
        <div className={cn(
          'hidden md:flex items-center gap-9 transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : 'translate-x-0'
        )}>
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === '/'}
              className={({ isActive }) => cn(
                'text-sm font-semibold transition-opacity',
                isActive ? 'text-ink opacity-100' : 'text-ink opacity-65 hover:opacity-100'
              )}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center">
          <Link to="/portal/login" className="btn-dark" onClick={() => trackClick('Request Assessment')}>
            Request Assessment
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="md:hidden text-ink text-2xl bg-transparent border-none cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={cn(
          'md:hidden fixed top-0 right-0 h-screen w-64 bg-paper flex flex-col justify-start pt-24 px-8 pb-8 gap-6 border-l border-border shadow-xl',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}>
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                'text-sm font-semibold transition-colors',
                isActive ? 'text-ink' : 'text-ink opacity-65 hover:opacity-100'
              )}
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/portal/login"
            className="btn-dark text-center mt-2"
            onClick={() => { trackClick('Request Assessment'); setMobileOpen(false); }}
          >
            Request Assessment
          </Link>
        </div>
      )}
    </nav>
  );
}