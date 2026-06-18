import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

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
    <div className="bg-surface-50 text-ink-900 min-h-screen">
      <section className="pt-32 pb-24 border-b border-surface-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-coral-500 text-xs font-semibold uppercase tracking-widest mb-6">Cybersecurity</p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-8">
            Uncompromising<br />Security.
          </h1>
          <p className="text-ink-500 text-lg max-w-xl leading-relaxed">
            We protect your digital assets with rigorous, proactive defense strategies,
            ensuring your operations remain resilient against evolving threats.
          </p>
        </div>
      </section>
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-px bg-surface-300">
            {services.map(({ title, body, items }) => (
              <div key={title} className="bg-surface-50 p-10 hover:bg-surface-100 transition-colors">
                <h3 className="text-xl font-bold text-ink-900 mb-4">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed mb-6">{body}</p>
                <ul className="space-y-2.5">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-ink-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-coral-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 border-t border-surface-300 bg-surface-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight text-ink-900 mb-4">
              Secure Your Infrastructure Today
            </h2>
            <p className="text-ink-500 text-sm leading-relaxed mb-8">
              Identify vulnerabilities before they are exploited. Partner with Kreatix Technologies
              for a comprehensive security assessment.
            </p>
            <Link to="/portal/login" className="btn-primary">
              Request a VAPT Assessment <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}