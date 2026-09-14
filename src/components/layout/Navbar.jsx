import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { trackClick } from '../../services/analytics';
import Logo from '../Logo';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/portfolio' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/team' },
  { label: 'Contact', href: '/contact' },
  { label: 'Download', href: '/download' },
];

// Dropdown menus — external product links open in a new tab
const productLinks = [
  { label: 'Kreatix Mail', href: 'https://mail.kreatixtech.com', external: true },
  { label: 'Kreatix VAPT', href: 'https://security.kreatixtech.com', external: true },
  { label: 'CheckoutPOS', href: 'https://checkoutpos.online', external: true },
  { label: 'Xsta360', href: 'https://xsta360.com.ng', external: true },
];

const serviceLinks = [
  { label: 'Software Development', href: '/contact' },
  { label: 'VAPT', href: '/services/cybersecurity' },
  { label: 'IT Consultancy', href: '/contact' },
  { label: 'Cloud Services', href: '/contact' },
];


function DropdownItem({ label, links, onClose }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-1 text-sm font-semibold transition-opacity text-ink opacity-65 hover:opacity-100',
          open && 'opacity-100'
        )}
        aria-expanded={open}
      >
        {label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-56"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="bg-paper border border-border rounded-xl shadow-lg py-2">
            {links.map((link) => {
              const cls = 'block px-4 py-2.5 text-sm font-medium text-ink opacity-75 hover:opacity-100 hover:bg-orange/5 transition-colors';
              if (link.external) {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cls}
                    onClick={onClose}
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <Link key={link.label} to={link.href} className={cls} onClick={onClose}>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileAccordion({ label, links, onClose }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between text-sm font-semibold text-ink opacity-65 hover:opacity-100 transition-opacity"
        aria-expanded={open}
      >
        {label}
        <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="flex flex-col gap-1 mt-2 pl-3 border-l border-border">
          {links.map((link) => {
            const cls = 'text-sm font-medium text-ink opacity-65 hover:opacity-100 py-1.5 transition-opacity';
            if (link.external) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cls}
                  onClick={onClose}
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link key={link.label} to={link.href} className={cls} onClick={onClose}>
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-ink focus:text-white focus:rounded-lg focus:text-sm"
      >
        Skip to content
      </a>
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-paper/85 backdrop-blur-[12px] border-b border-border shadow-sm' : 'bg-paper/85 backdrop-blur-[12px]'
      )} role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-14 py-4 sm:py-5">
        {/* Brand */}
        <Logo size="md" />

        {/* Desktop nav */}
        <div className={cn(
          'hidden md:flex items-center gap-7 transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : 'translate-x-0'
        )}>
          <DropdownItem label="Products" links={productLinks} />
          <DropdownItem label="Services" links={serviceLinks} />
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
          <Link to="/assessment" className="btn-dark" onClick={() => trackClick('Request Assessment')}>
            Request Assessment
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="md:hidden text-ink text-2xl bg-transparent border-none cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          role="menu"
          className={cn(
          'md:hidden fixed top-0 right-0 h-screen w-64 bg-paper flex flex-col justify-start pt-24 px-8 pb-8 gap-6 border-l border-border shadow-xl',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}>
          <MobileAccordion label="Products" links={productLinks} onClose={() => setMobileOpen(false)} />
          <MobileAccordion label="Services" links={serviceLinks} onClose={() => setMobileOpen(false)} />
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
            to="/assessment"
            className="btn-dark text-center mt-2"
            onClick={() => { trackClick('Request Assessment'); setMobileOpen(false); }}
          >
            Request Assessment
          </Link>
        </div>
      )}
    </nav>
    </>
  );
}