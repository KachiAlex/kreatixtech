import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Shield, Lock, Cpu, Globe } from 'lucide-react';

const services = [
  {
    title: 'VAPT Assessments',
    body: 'Comprehensive Vulnerability Assessment and Penetration Testing. We simulate real-world attacks to identify and patch security gaps before malicious actors exploit them.',
    items: ['Web & Mobile App Testing', 'Network Infrastructure Review', 'Actionable Remediation Reports'],
  },
  {
    title: 'Threat Detection & Response',
    body: 'Continuous monitoring utilizing EDR, XDR, and MDR technologies to proactively hunt, detect, and neutralize threats within your environment.',
    items: ['24/7 Active Monitoring', 'Automated Incident Response', 'Behavioral Anomaly Detection'],
  },
  {
    title: 'Endpoint Management',
    body: 'Secure every device connected to your corporate network. We deploy rigorous access controls and encryption to prevent lateral movement.',
    items: ['Zero-Trust Implementation', 'Remote Device Wiping', 'Patch Management'],
  },
  {
    title: 'API Security',
    body: 'Your APIs are the backbone of your software. We audit authentication, authorization, and data exposure flaws to secure your critical integrations.',
    items: ['OAuth/JWT Flaw Analysis', 'Rate Limiting & WAF Rules', 'Data Encryption Standards'],
  },
];

export default function CybersecurityPage() {
  return (
    <div className="bg-ink-950 text-white min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-24 border-b border-ink-700">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <p className="text-teal-400 text-xs font-mono uppercase tracking-widest mb-6">Cybersecurity</p>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none mb-8 text-white">
            Uncompromising<br />Security.
          </h1>
          <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
            We protect your digital assets with rigorous, proactive defense strategies,
            ensuring your operations remain resilient against evolving threats.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-px bg-ink-700">
            {services.map(({ title, body, items }) => (
              <div key={title} className="bg-ink-950 p-10 hover:bg-ink-900 transition-colors">
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{body}</p>
                <ul className="space-y-2.5">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-ink-700 bg-ink-900">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black tracking-tight text-white mb-4">
              Secure Your Infrastructure Today
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Identify vulnerabilities before they are exploited. Partner with Kreatix Technologies
              for a comprehensive security assessment.
            </p>
            <Link to="/portal/vapt-request" className="btn-teal">
              Request a VAPT Assessment <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
