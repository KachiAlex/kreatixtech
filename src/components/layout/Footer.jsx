import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      <footer className="py-20 px-14 flex justify-between flex-wrap gap-10">
        <div className="footer-brand">
          <Link to="/" className="flex items-center gap-3 mb-4">
            <div className="w-9.5 h-9.5 rounded-[9px] bg-orange flex items-center justify-center flex-shrink-0">
              <span className="text-white font-display font-extrabold text-lg leading-none">K</span>
            </div>
            <div className="flex flex-col leading-[1.15]">
              <span className="font-display font-extrabold text-base text-ink">Kreatix</span>
              <span className="text-[11px] text-grey font-medium tracking-[0.01em]">Technologies</span>
            </div>
          </Link>
          <p className="text-grey-dark text-[14px] max-w-[30ch] mt-4">Dynamic IT solutions — software, cybersecurity and cloud — built with innovation and creativity.</p>
        </div>
        <div className="footer-col">
          <h5 className="text-[12px] text-grey tracking-[0.1em] text-uppercase mb-[18px] font-extrabold">Services</h5>
          <Link to="/contact" className="block text-grey-dark text-[14px] mb-3 font-medium hover:text-ink transition-colors">Software development</Link>
          <Link to="/services/cybersecurity" className="block text-grey-dark text-[14px] mb-3 font-medium hover:text-ink transition-colors">Cybersecurity</Link>
          <Link to="/contact" className="block text-grey-dark text-[14px] mb-3 font-medium hover:text-ink transition-colors">Cloud services</Link>
        </div>
        <div className="footer-col">
          <h5 className="text-[12px] text-grey tracking-[0.1em] text-uppercase mb-[18px] font-extrabold">Company</h5>
          <Link to="/portfolio" className="block text-grey-dark text-[14px] mb-3 font-medium hover:text-ink transition-colors">Our work</Link>
          <Link to="/contact" className="block text-grey-dark text-[14px] mb-3 font-medium hover:text-ink transition-colors">Contact</Link>
          <Link to="/about" className="block text-grey-dark text-[14px] mb-3 font-medium hover:text-ink transition-colors">About</Link>
        </div>
        <div className="footer-col">
          <h5 className="text-[12px] text-grey tracking-[0.1em] text-uppercase mb-[18px] font-extrabold">Cybersecurity</h5>
          <Link to="/portal/vapt-request" className="block text-grey-dark text-[14px] mb-3 font-medium hover:text-ink transition-colors">VAPT request portal</Link>
          <Link to="/services/cybersecurity" className="block text-grey-dark text-[14px] mb-3 font-medium hover:text-ink transition-colors">Threat detection</Link>
          <Link to="/services/cybersecurity" className="block text-grey-dark text-[14px] mb-3 font-medium hover:text-ink transition-colors">API security</Link>
        </div>
      </footer>
      <div className="py-6 px-14 border-t border-border flex justify-between flex-wrap gap-4 text-[13px] text-grey font-medium">
        <span>© 2026 Kreatix Technologies</span>
        <span>Lagos, Nigeria</span>
      </div>
    </>
  );
}