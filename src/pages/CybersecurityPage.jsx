import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Search, AlertTriangle, Monitor, Globe2, ArrowRight,
  CheckCircle2, ChevronDown, Zap, Lock, Eye, Network, Server,
  FileSearch, Wifi, Code, Database, Activity, Target, Bell
} from 'lucide-react';

const solutions = [
  {
    id: 'vapt',
    icon: FileSearch,
    label: 'VAPT',
    title: 'Vulnerability Assessment & Penetration Testing',
    tagline: 'Find your weaknesses before attackers do.',
    description:
      'Our comprehensive VAPT service combines automated scanning with manual expert-led penetration testing to uncover vulnerabilities across your entire attack surface — web apps, networks, APIs, mobile apps, and cloud infrastructure.',
    color: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    gradientFrom: 'from-red-500/10',
    features: [
      'Web Application Penetration Testing',
      'Network & Infrastructure Assessment',
      'API Security Testing',
      'Mobile Application Testing',
      'Cloud Configuration Review',
      'Social Engineering Assessments',
      'Red Team Exercises',
      'Detailed Remediation Reports',
    ],
    deliverables: ['Executive Summary Report', 'Technical Findings Report', 'Risk-Ranked Vulnerability List', 'Remediation Roadmap', 'Retest Verification'],
    cta: { label: 'Request VAPT Assessment', href: '/vapt' },
  },
  {
    id: 'xdr',
    icon: Eye,
    label: 'EDR / XDR / MDR',
    title: 'Threat Detection & Response',
    tagline: 'Detect, respond, and neutralize threats in real time.',
    description:
      'From Endpoint Detection & Response (EDR) to Extended Detection & Response (XDR) and fully Managed Detection & Response (MDR), we provide layered threat intelligence that covers your endpoints, cloud, email, and network.',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    gradientFrom: 'from-purple-500/10',
    features: [
      'Endpoint Detection & Response (EDR)',
      'Extended Detection & Response (XDR)',
      'Managed Detection & Response (MDR)',
      '24/7 Security Operations Center (SOC)',
      'SIEM Integration & Correlation',
      'Threat Intelligence Feeds',
      'Incident Response Playbooks',
      'Forensics & Root Cause Analysis',
    ],
    deliverables: ['Monthly Threat Reports', 'Real-time Alerting Dashboard', 'Incident Response SLA', 'Quarterly Security Reviews'],
    cta: { label: 'Learn About MDR', href: '/contact' },
  },
  {
    id: 'endpoint',
    icon: Monitor,
    label: 'Endpoint Management',
    title: 'Unified Endpoint Management (UEM)',
    tagline: 'Secure and manage every device across your organisation.',
    description:
      'Centrally manage, monitor, and secure all endpoints — laptops, desktops, mobile devices, and IoT — with our Unified Endpoint Management platform. Enforce policies, patch automatically, and maintain full visibility.',
    color: 'text-accent-400',
    border: 'border-accent-500/30',
    bg: 'bg-accent-500/10',
    gradientFrom: 'from-accent-500/10',
    features: [
      'Device Lifecycle Management',
      'Policy Enforcement & Compliance',
      'Automated Patch Management',
      'Remote Wipe & Lock',
      'Mobile Device Management (MDM)',
      'Application Control & Whitelisting',
      'Asset Inventory & Reporting',
      'Zero Trust Endpoint Access',
    ],
    deliverables: ['Device Compliance Dashboard', 'Patch Status Reports', 'Security Posture Score', 'Audit-Ready Logs'],
    cta: { label: 'Get Started', href: '/contact' },
  },
  {
    id: 'api',
    icon: Code,
    label: 'API Security',
    title: 'API Security Testing & Protection',
    tagline: 'Protect your most exposed attack surface.',
    description:
      'APIs are the backbone of modern applications — and the #1 target for attackers. Our API security service covers full lifecycle protection: discovery, testing, runtime protection, and continuous monitoring for REST, GraphQL, and gRPC APIs.',
    color: 'text-green-400',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    gradientFrom: 'from-green-500/10',
    features: [
      'API Discovery & Inventory',
      'OWASP API Top 10 Testing',
      'Authentication & Authorization Testing',
      'Rate Limiting & Input Validation',
      'Data Exposure Analysis',
      'API Gateway Configuration Review',
      'Runtime API Threat Protection',
      'Continuous API Monitoring',
    ],
    deliverables: ['API Security Assessment Report', 'Risk-Ranked Findings', 'Remediation Guidance', 'API Security Policy Template'],
    cta: { label: 'Secure Your APIs', href: '/vapt' },
  },
  {
    id: 'network',
    icon: Network,
    label: 'Network Security',
    title: 'Network Security & Monitoring',
    tagline: 'Build impenetrable network perimeters.',
    description:
      'Protect your network infrastructure with comprehensive security assessments, firewall reviews, IDS/IPS configuration, network segmentation, and continuous traffic monitoring to detect anomalies and lateral movement.',
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    gradientFrom: 'from-yellow-500/10',
    features: [
      'Firewall Rule Review & Hardening',
      'Network Segmentation Assessment',
      'IDS/IPS Deployment & Tuning',
      'VPN & Remote Access Security',
      'Wi-Fi Security Assessment',
      'Traffic Analysis & Anomaly Detection',
      'DNS Security',
      'DDoS Protection Strategy',
    ],
    deliverables: ['Network Security Audit Report', 'Firewall Policy Review', 'Network Topology Risk Map', 'Remediation Plan'],
    cta: { label: 'Assess My Network', href: '/vapt' },
  },
  {
    id: 'cloud-sec',
    icon: Server,
    label: 'Cloud Security',
    title: 'Cloud Security & Compliance',
    tagline: 'Secure your cloud workloads end to end.',
    description:
      'Cloud misconfigurations are the leading cause of data breaches. Our cloud security team audits your AWS, Azure, or GCP environments against CIS Benchmarks, NIST, and ISO 27001 to eliminate risk and achieve compliance.',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    gradientFrom: 'from-blue-500/10',
    features: [
      'Cloud Configuration Audit (CIS)',
      'IAM & Access Control Review',
      'S3/Blob/Storage Security Review',
      'Container & Kubernetes Security',
      'Serverless Security Assessment',
      'Compliance (ISO 27001, SOC 2, PCI DSS)',
      'Cloud Security Posture Management',
      'Continuous Cloud Monitoring',
    ],
    deliverables: ['Cloud Security Posture Report', 'Compliance Gap Analysis', 'Prioritized Remediation Plan', 'Policy Hardening Templates'],
    cta: { label: 'Audit My Cloud', href: '/contact' },
  },
];

function SolutionCard({ solution, isOpen, onToggle }) {
  return (
    <div
      id={solution.id}
      className={`glass-card border ${isOpen ? solution.border : 'border-white/5'} transition-all duration-300 overflow-hidden`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left group"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${solution.bg} flex items-center justify-center flex-shrink-0`}>
            <solution.icon size={22} className={solution.color} />
          </div>
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${solution.color} mb-0.5 block`}>
              {solution.label}
            </span>
            <h3 className="text-lg font-bold text-white">{solution.title}</h3>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className={`px-6 pb-8 bg-gradient-to-b ${solution.gradientFrom} to-transparent`}>
          <p className="text-gray-400 leading-relaxed mb-8">{solution.description}</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">What's Included</h4>
              <ul className="space-y-2.5">
                {solution.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 size={15} className={`${solution.color} flex-shrink-0 mt-0.5`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Deliverables</h4>
              <ul className="space-y-2.5 mb-8">
                {solution.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Target size={14} className={`${solution.color} flex-shrink-0 mt-0.5`} />
                    {d}
                  </li>
                ))}
              </ul>
              <Link to={solution.cta.href} className="btn-primary text-sm">
                {solution.cta.label}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CybersecurityPage() {
  const [openId, setOpenId] = useState('vapt');

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-purple-900/10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 text-sm font-medium mb-6">
              <Shield size={14} />
              Cybersecurity Services
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Comprehensive{' '}
              <span className="text-red-400">Cyber</span>
              <br />
              Protection
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mb-10">
              From proactive vulnerability discovery to real-time threat response, our cybersecurity 
              services defend your digital infrastructure across every layer — endpoints, networks, 
              APIs, and cloud.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/vapt" className="btn-primary">
                Get VAPT Assessment <ArrowRight size={16} />
              </Link>
              <a
                href="#solutions"
                className="btn-secondary"
                onClick={(e) => { e.preventDefault(); document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Explore Solutions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick nav pills */}
      <section className="py-8 bg-dark-800/60 border-y border-white/5 sticky top-16 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {solutions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setOpenId(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  openId === s.id
                    ? `${s.bg} ${s.color} border ${s.border}`
                    : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                <s.icon size={13} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {solutions.map((solution) => (
            <SolutionCard
              key={solution.id}
              solution={solution}
              isOpen={openId === solution.id}
              onToggle={() => setOpenId(openId === solution.id ? null : solution.id)}
            />
          ))}
        </div>
      </section>

      {/* Why trust us */}
      <section className="py-20 bg-dark-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">
              Why Choose <span className="gradient-text">Kreatix Security</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Activity, title: 'Real-Time Response', desc: 'Sub-15-minute threat detection and escalation via our 24/7 SOC.', color: 'text-red-400', bg: 'bg-red-500/10' },
              { icon: Bell, title: 'Zero False Positives', desc: 'AI-enhanced correlation reduces noise so your team focuses on real threats.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { icon: Lock, title: 'Compliance Ready', desc: 'Assessments aligned to OWASP, NIST, ISO 27001, PCI DSS, GDPR.', color: 'text-accent-400', bg: 'bg-accent-500/10' },
              { icon: Globe2, title: 'Global Threat Intel', desc: 'Enriched with global threat feeds from leading threat intelligence platforms.', color: 'text-green-400', bg: 'bg-green-500/10' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="glass-card p-6 border border-white/5 text-center">
                <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon size={24} className={color} />
                </div>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card border border-red-500/20 p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-purple-500/5" />
            <div className="relative">
              <Shield size={40} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-4">
                Uncover Your Vulnerabilities <span className="text-red-400">Before Attackers Do</span>
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Submit a VAPT request and our security experts will reach out within 24 hours with a 
                tailored assessment plan.
              </p>
              <Link to="/vapt" className="btn-primary text-base px-10 py-4">
                Start VAPT Assessment <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
