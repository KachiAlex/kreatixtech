import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Server, Eye, Lock, Globe, FileText, Activity, Radar, ArrowUpRight } from 'lucide-react';
import SEO from '../components/SEO';
import { trackClick } from '../services/analytics';

const FEATURES = [
  {
    icon: Server,
    title: 'VPS security monitoring',
    body: 'Continuous event monitoring across your VPS with alerts for SSH attempts, unauthorized access and suspicious activity.',
  },
  {
    icon: Globe,
    title: 'IP intelligence & enrichment',
    body: 'Every threatening IP is enriched with reputation data, geolocation and abuse history so you can decide fast.',
  },
  {
    icon: Lock,
    title: 'Banned-IP management',
    body: 'Track, ban and unban IPs directly from the dashboard. Banned addresses are pushed to UFW automatically.',
  },
  {
    icon: Shield,
    title: 'UFW firewall control',
    body: 'View and manage UFW rules, open or close ports and apply changes without touching the command line.',
  },
  {
    icon: Radar,
    title: 'Vulnerability scanning',
    body: 'Run network and domain scans, schedule recurring checks and compare results over time.',
  },
  {
    icon: Activity,
    title: 'Auto-remediation',
    body: 'Trigger firewall blocks, alerts and response workflows automatically when threats are detected.',
  },
  {
    icon: FileText,
    title: 'DOCX security reports',
    body: 'Generate professional Word reports with findings, risk ratings and remediation guidance for stakeholders.',
  },
  {
    icon: Eye,
    title: 'Security event dashboard',
    body: 'A single pane of glass for events, scans, banned IPs and system status across your infrastructure.',
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <SEO
        title="Kreatix Security"
        description="VPS security monitoring, firewall management, vulnerability scanning and automated response from Kreatix Technologies."
        keywords="VPS security, firewall management, vulnerability scanning, UFW, security monitoring, Kreatix Security"
        pathname="/security"
      />

      {/* Hero */}
      <section className="relative bg-[#0E0E0F] text-white pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 md:px-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(242,120,46,0.12),transparent 60%)' }} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-widest text-[#F2782E] mb-6">
            <Shield className="h-3.5 w-3.5" /> Service
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6 max-w-3xl">
            Security that watches your <span className="text-[#F2782E]">infrastructure</span>.
          </h1>
          <p className="text-[17px] leading-[1.7] mb-8 max-w-2xl" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Kreatix Security combines monitoring, IP intelligence, firewall management and vulnerability scanning into one platform for your VPS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/contact"
              onClick={() => trackClick('security_contact')}
              className="inline-flex items-center justify-center gap-2.5 bg-[#F2782E] text-white px-8 py-4 rounded-full font-bold text-[15px] transition-all hover:bg-[#D9601A] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(242,120,46,0.35)]"
            >
              Talk to our security team <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/services/cybersecurity"
              onClick={() => trackClick('security_cyber_page')}
              className="inline-flex items-center justify-center gap-2.5 text-white px-8 py-4 rounded-full font-bold text-[15px] transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Explore cybersecurity →
            </Link>
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
                One platform for proactive protection
              </h2>
            </div>
            <p className="text-[17px] text-grey-dark leading-[1.75]">
              From scanning to response, Kreatix Security gives you the visibility and control to protect your servers.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white border border-border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="h-5 w-5 text-orange" />
                  </div>
                  <h3 className="text-base font-bold text-ink mb-2">{f.title}</h3>
                  <p className="text-sm text-grey-dark leading-relaxed">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="py-16 sm:py-24 px-6 md:px-12 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#F2782E] block mb-4">How it works</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.1] mb-6">
                Monitor. Detect. Respond. Report.
              </h2>
              <p className="text-[17px] text-grey-dark leading-relaxed mb-8">
                Install the lightweight security agent on your VPS, point it at the Kreatix Security API and start receiving events, scans and firewall updates through the dashboard.
              </p>
              <Link
                to="/contact"
                onClick={() => trackClick('security_get_started')}
                className="btn-primary text-sm"
              >
                Get started →
              </Link>
            </div>
            <div className="grid gap-4">
              {[
                { n: '01', title: 'Deploy the agent', body: 'A small service on your VPS streams security events to the API.' },
                { n: '02', title: 'Ingest & enrich', body: 'Events are stored, linked to IP intelligence and scored by risk.' },
                { n: '03', title: 'Block & remediate', body: 'Threat IPs are banned automatically and UFW rules are updated.' },
                { n: '04', title: 'Export reports', body: 'Generate DOCX reports and monthly digests for your team.' },
              ].map((s) => (
                <div key={s.n} className="flex gap-4 p-5 border border-border rounded-2xl bg-offwhite">
                  <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                    {s.n}
                  </div>
                  <div>
                    <h4 className="font-bold text-ink mb-1">{s.title}</h4>
                    <p className="text-sm text-grey-dark">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
