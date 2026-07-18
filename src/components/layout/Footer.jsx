import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import Logo from '../Logo';

export default function Footer() {
  const social = [
    { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/Kreatixtech' },
    { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/kreatixtech/' },
    { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/kreatixtechnologies' },
  ];

  return (
    <>
      <footer className="py-16 lg:py-20 px-6 lg:px-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="footer-brand sm:col-span-2 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <Logo size="md" />
            </Link>
            <p className="text-grey-dark text-sm max-w-[30ch] mt-4">Dynamic IT solutions — software, cybersecurity and cloud — built with innovation and creativity.</p>
          </div>
          <div className="footer-col">
            <h5 className="text-xs text-grey tracking-widest uppercase mb-4 font-extrabold">Services</h5>
            <Link to="/contact" className="block text-grey-dark text-sm mb-3 font-medium hover:text-ink transition-colors">Software development</Link>
            <Link to="/services/cybersecurity" className="block text-grey-dark text-sm mb-3 font-medium hover:text-ink transition-colors">Cybersecurity</Link>
            <Link to="/contact" className="block text-grey-dark text-sm mb-3 font-medium hover:text-ink transition-colors">Cloud services</Link>
          </div>
          <div className="footer-col">
            <h5 className="text-xs text-grey tracking-widest uppercase mb-4 font-extrabold">Company</h5>
            <Link to="/portfolio" className="block text-grey-dark text-sm mb-3 font-medium hover:text-ink transition-colors">Our work</Link>
            <Link to="/contact" className="block text-grey-dark text-sm mb-3 font-medium hover:text-ink transition-colors">Contact</Link>
            <Link to="/about" className="block text-grey-dark text-sm mb-3 font-medium hover:text-ink transition-colors">About</Link>
          </div>
          <div className="footer-col">
            <h5 className="text-xs text-grey tracking-widest uppercase mb-4 font-extrabold">Connect</h5>
            <div className="flex flex-wrap items-center gap-3">
              {social.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2.5 bg-gray-50 rounded-lg text-grey hover:text-orange hover:bg-orange/5 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <div className="py-6 px-6 lg:px-14 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between flex-wrap gap-4 text-sm text-grey font-medium">
          <span>© 2026 Kreatix Technologies</span>
          <span>Lagos, Nigeria</span>
        </div>
      </div>
    </>
  );
}