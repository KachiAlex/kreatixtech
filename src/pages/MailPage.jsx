import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Monitor, Shield, Globe, Download, ArrowUpRight, Cloud, Users, HardDrive } from 'lucide-react';
import SEO from '../components/SEO';
import { trackClick } from '../services/analytics';

const FEATURES = [
  {
    icon: Globe,
    title: 'Custom domain email',
    body: 'Use your own domain. Create accounts like team@yourcompany.com and manage them from a single admin panel.',
  },
  {
    icon: Monitor,
    title: 'Web + desktop apps',
    body: 'Access mail from any browser or download the Kreatix Mail desktop app for Windows.',
  },
  {
    icon: Shield,
    title: 'Spam & abuse filtering',
    body: 'Cloudflare Email Routing and local filtering keep unwanted mail out of your inbox.',
  },
  {
    icon: Cloud,
    title: 'Cloud-synced storage',
    body: 'Inbound mail is stored in Cloudflare D1 and synchronized to the local mail server for fast, reliable access.',
  },
  {
    icon: HardDrive,
    title: 'Attachment handling',
    body: 'Large attachments are stored securely in R2 object storage with signed download links.',
  },
  {
    icon: Users,
    title: 'Admin management',
    body: 'Admins can create, deactivate, reset passwords and search accounts from the dashboard.',
  },
];

export default function MailPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <SEO
        title="Kreatix Mail"
        description="Secure business email with custom domains, web and desktop apps, and admin controls from Kreatix Technologies."
        keywords="business email, custom domain email, secure mail, Kreatix Mail, email hosting"
        pathname="/mail"
      />

      {/* Hero */}
      <section className="relative bg-[#0E0E0F] text-white pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 md:px-12 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(ellipse,rgba(242,120,46,0.15),transparent 70%)' }} />
        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-widest text-[#F2782E] mb-6">
              <Mail className="h-3.5 w-3.5" /> Service
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
              Business email <br />
              <span className="text-[#F2782E]">done right.</span>
            </h1>
            <p className="text-[17px] leading-[1.7] mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Kreatix Mail gives your team secure, custom-domain email with web and desktop access, admin controls and cloud-backed reliability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://mail.kreatixtech.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('mail_open_webmail')}
                className="inline-flex items-center justify-center gap-2.5 bg-[#F2782E] text-white px-8 py-4 rounded-full font-bold text-[15px] transition-all hover:bg-[#D9601A] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(242,120,46,0.35)]"
              >
                Open Mail <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link
                to="/download"
                onClick={() => trackClick('mail_download_desktop')}
                className="inline-flex items-center justify-center gap-2.5 text-white px-8 py-4 rounded-full font-bold text-[15px] transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <Download className="h-4 w-4" /> Download desktop app
              </Link>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#F2782E] flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white">info@kreatixtech.com</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Inbox — 12 unread</p>
                </div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 mb-4 last:mb-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-2.5 w-24 bg-white/20 rounded mb-2" />
                    <div className="h-2 w-full bg-white/10 rounded mb-1.5" />
                    <div className="h-2 w-4/5 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-6 md:px-12 bg-[#F7F5F2]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-end mb-14">
            <div>
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#F2782E] block mb-4">Capabilities</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
                Everything you need in a business inbox
              </h2>
            </div>
            <p className="text-[17px] text-grey-dark leading-[1.75]">
              Kreatix Mail combines familiar email workflows with the security and control modern teams expect.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white border border-border rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="h-5 w-5 text-orange" />
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-2">{f.title}</h3>
                  <p className="text-sm text-grey-dark leading-relaxed">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-6 md:px-12 bg-white border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-ink mb-5">
            Get Kreatix Mail for your domain
          </h2>
          <p className="text-[17px] text-grey-dark leading-relaxed mb-8 max-w-2xl mx-auto">
            Contact us to set up custom-domain email for your business, or open the webmail if you already have an account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" onClick={() => trackClick('mail_contact_sales')} className="btn-primary text-sm">
              Talk to sales →
            </Link>
            <Link to="/download" onClick={() => trackClick('mail_download_page')} className="btn-outline text-sm">
              Download desktop app
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
