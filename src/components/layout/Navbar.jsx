import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Shield, Code2, Cloud, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

const services = [
  { label: 'Cybersecurity', href: '/cybersecurity', icon: Shield, color: 'text-red-400' },
  { label: 'Software Development', href: '/software', icon: Code2, color: 'text-brand-400' },
  { label: 'Cloud Services', href: '/cloud', icon: Cloud, color: 'text-accent-400' },
];

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '#', hasDropdown: true },
  { label: 'VAPT Assessment', href: '/vapt' },
  { label: 'Portfolio', href: '/portfolio' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [location]);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-dark-800/90 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg rotate-45 group-hover:rotate-[55deg] transition-transform duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={18} className="text-white relative z-10" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">
                Kreatix<span className="text-brand-400"> Tech</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div key={link.label} className="relative">
                  <button
                    onClick={() => setServicesOpen((v) => !v)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      servicesOpen ? 'text-brand-400' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      className={cn('transition-transform', servicesOpen && 'rotate-180')}
                    />
                  </button>
                  {servicesOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 glass-card p-2 shadow-2xl shadow-black/40">
                      {services.map((s) => (
                        <Link
                          key={s.href}
                          to={s.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group/item"
                        >
                          <s.icon size={16} className={cn(s.color, 'group-hover/item:scale-110 transition-transform')} />
                          <span className="text-sm text-gray-200 group-hover/item:text-white">{s.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end
                  className={({ isActive }) =>
                    cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-brand-400 bg-brand-500/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/contact" className="btn-secondary text-sm px-5 py-2.5">
              Contact Us
            </Link>
            <Link to="/vapt" className="btn-primary text-sm px-5 py-2.5">
              Get Assessment
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-800/95 backdrop-blur-xl border-t border-white/5 px-4 py-4 space-y-1">
          {navLinks.map((link) =>
            link.hasDropdown ? (
              <div key={link.label}>
                <button
                  onClick={() => setServicesOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5"
                >
                  <span className="font-medium">{link.label}</span>
                  <ChevronDown size={14} className={cn('transition-transform', servicesOpen && 'rotate-180')} />
                </button>
                {servicesOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {services.map((s) => (
                      <Link
                        key={s.href}
                        to={s.href}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                      >
                        <s.icon size={15} className={s.color} />
                        <span className="text-sm">{s.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={link.href}
                to={link.href}
                end
                className={({ isActive }) =>
                  cn(
                    'block px-4 py-3 rounded-lg font-medium transition-colors',
                    isActive ? 'text-brand-400 bg-brand-500/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  )
                }
              >
                {link.label}
              </NavLink>
            )
          )}
          <div className="pt-3 flex flex-col gap-2">
            <Link to="/contact" className="btn-secondary justify-center">Contact Us</Link>
            <Link to="/vapt" className="btn-primary justify-center">Get Assessment</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
