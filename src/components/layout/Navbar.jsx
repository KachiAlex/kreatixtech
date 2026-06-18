import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Cybersecurity', href: '/services/cybersecurity' },
  { label: 'Work', href: '/portfolio' },
  { label: 'About', href: '/about' },
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
      <div className="flex items-center justify-between px-14 py-5">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9.5 h-9.5 rounded-[9px] bg-orange flex items-center justify-center flex-shrink-0">
            <span className="text-white font-display font-extrabold text-lg leading-none">K</span>
          </div>
          <div className="flex flex-col leading-[1.15]">
            <span className="font-display font-extrabold text-base text-ink">Kreatix</span>
            <span className="text-[11px] text-grey font-medium tracking-[0.01em]">Technologies</span>
          </div>
        </Link>

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
          <Link to="/portal/login" className="btn-dark">
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
          'md:hidden fixed top-0 right-0 h-screen w-60 bg-paper flex flex-col justify-start pt-24 px-8 gap-7 transition-transform duration-300 border-l border-border',
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
        </div>
      )}
    </nav>
  );
}