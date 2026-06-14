import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin, Linkedin, Twitter, Github, ArrowRight } from 'lucide-react';

const footerLinks = {
  Services: [
    { label: 'Cybersecurity', href: '/cybersecurity' },
    { label: 'VAPT Assessment', href: '/vapt' },
    { label: 'Software Development', href: '/software' },
    { label: 'Cloud Services', href: '/cloud' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Contact', href: '/contact' },
    { label: 'Admin', href: '/admin' },
  ],
  Security: [
    { label: 'VAPT', href: '/cybersecurity#vapt' },
    { label: 'Threat Detection (XDR)', href: '/cybersecurity#xdr' },
    { label: 'Endpoint Management', href: '/cybersecurity#endpoint' },
    { label: 'API Security', href: '/cybersecurity#api' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg rotate-45" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap size={18} className="text-white relative z-10" />
                </div>
              </div>
              <span className="font-bold text-lg text-white">
                Kreatix<span className="text-brand-400"> Technologies</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
              Building dynamic solutions that bring innovation with creativity. 
              Your trusted partner for Software Development, Cybersecurity, and Cloud Services.
            </p>
            <div className="space-y-2.5">
              <a href="mailto:info@kreatixtech.com" className="flex items-center gap-2.5 text-gray-400 hover:text-brand-400 transition-colors text-sm">
                <Mail size={14} />
                info@kreatixtech.com
              </a>
              <a href="tel:+2348012345678" className="flex items-center gap-2.5 text-gray-400 hover:text-brand-400 transition-colors text-sm">
                <Phone size={14} />
                +234 801 234 5678
              </a>
              <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                <MapPin size={14} className="flex-shrink-0" />
                Lagos, Nigeria
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              {[
                { Icon: Linkedin, href: '#' },
                { Icon: Twitter, href: '#' },
                { Icon: Github, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-500/20 hover:text-brand-400 flex items-center justify-center text-gray-400 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-white font-semibold mb-4 text-sm">{group}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-brand-400 transition-colors text-sm flex items-center gap-1 group"
                    >
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Kreatix Technologies. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
