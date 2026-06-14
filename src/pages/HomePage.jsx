import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Shield, Code2, Cloud } from 'lucide-react';

const stats = [
  { value: '99.9%', label: 'Uptime Guaranteed' },
  { value: '24/7',  label: 'Active Threat Hunting' },
  { value: '∞',     label: 'Vulnerability Patcher' },
  { value: '50+',   label: 'Enterprise Clients' },
];

const disciplines = [
  {
    icon: Code2,
    title: 'Software Development',
    body: 'We build scalable, custom software solutions designed from the ground up to be secure, fast, and adaptable to your business needs.',
    items: ['Custom Web Applications', 'Enterprise SaaS Platforms', 'Mobile App Development', 'Legacy System Modernization'],
    href: '/contact',
  },
  {
    icon: Shield,
    title: 'Cybersecurity',
    body: 'Rigorous defense strategies and offensive testing to ensure your infrastructure remains impenetrable against modern threats.',
    items: ['VAPT Assessments', 'Threat Detection & Response', 'API Security Audits', 'Zero-Trust Architecture'],
    href: '/services/cybersecurity',
  },
  {
    icon: Cloud,
    title: 'Cloud Services',
    body: 'Resilient, high-availability cloud environments engineered for massive scale, automated deployments, and cost optimization.',
    items: ['Cloud Migration', 'Infrastructure as Code', 'DevSecOps Pipelines', 'Serverless Architecture'],
    href: '/contact',
  },
];

const work = [
  {
    title: 'Caremaster',
    desc: 'A multi-tenant SaaS solution helping numerous care agencies manage operations, staff scheduling, and compliance securely.',
    tags: ['SaaS', 'Multi-tenant', 'Healthcare'],
    href: 'https://getcaremaster.com',
    external: true,
  },
  {
    title: 'PropertyArk',
    desc: 'A multivendor Real Estate platform providing a secure ecosystem for property businesses and buyers globally.',
    tags: ['Marketplace', 'Real Estate', 'Security'],
    href: '/portfolio',
    external: false,
  },
  {
    title: 'Ojawa Africa',
    desc: 'A multivendor eCommerce application that guarantees secure transactions via an integrated escrow system.',
    tags: ['eCommerce', 'Escrow', 'Fintech'],
    href: '/portfolio',
    external: false,
  },
];

export default function HomePage() {
  return (
    <div className="bg-ink-950 text-white min-h-screen">

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-ink-700" />
          <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        </div>

        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 relative">
          <div className="max-w-4xl">
            <p className="text-teal-400 text-sm font-mono tracking-widest uppercase mb-6">
              Innovation meets Creativity
            </p>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-white">
              Dynamic solutions<br />
              through innovation<br />
              <span className="text-slate-400">with creativity.</span>
            </h1>

            <p className="text-slate-400 text-lg max-w-xl leading-relaxed mb-12">
              We architect software and secure infrastructure for organizations that demand both
              rigorous engineering and inventive design.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/portal/vapt-request" className="btn-teal text-sm px-8 py-3.5">
                Request a VAPT Assessment
              </Link>
              <Link to="/portfolio" className="btn-outline text-sm px-8 py-3.5">
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-ink-700 bg-ink-900">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-black text-white tracking-tighter mb-1">{value}</p>
                <p className="text-slate-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disciplines ── */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-teal-400 text-xs font-mono uppercase tracking-widest mb-4">What we do</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">Our Disciplines.</h2>
          </div>

          {/* Overview row */}
          <div className="grid md:grid-cols-3 gap-4 mb-20">
            {disciplines.map(({ icon: Icon, title, body, href }) => (
              <div key={title} className="card p-7 hover:border-ink-500 transition-colors group">
                <Icon size={22} className="text-teal-400 mb-5" />
                <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{body}</p>
                <Link to={href} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors group-hover:text-teal-400">
                  Learn More <ArrowUpRight size={13} />
                </Link>
              </div>
            ))}
          </div>

          {/* Detail rows */}
          {disciplines.map(({ icon: Icon, title, items, body, href }, i) => (
            <div key={title} className={lex flex-col md:flex-row gap-10 py-12 border-t border-ink-700 }>
              <div className="md:w-1/3">
                <Icon size={18} className="text-teal-400 mb-4" />
                <h3 className="text-2xl font-black text-white tracking-tight mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                <Link to={href} className="inline-flex items-center gap-1.5 mt-5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors">
                  Learn More <ArrowUpRight size={13} />
                </Link>
              </div>
              <ul className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map(item => (
                  <li key={item} className="flex items-start gap-3 card-subtle p-4 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Selected Work ── */}
      <section className="py-28 border-t border-ink-700 bg-ink-900">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16 gap-6 flex-wrap">
            <div>
              <p className="text-teal-400 text-xs font-mono uppercase tracking-widest mb-4">Portfolio</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">Selected Work</h2>
              <p className="text-slate-400 mt-3 max-w-md text-sm leading-relaxed">
                Real results driven by deep technical expertise and inventive problem-solving.
              </p>
            </div>
            <Link to="/portfolio" className="btn-outline text-xs px-5 py-2.5 flex-shrink-0">
              View All Projects <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {work.map(({ title, desc, tags, href, external }) => (
              <div key={title} className="card p-7 flex flex-col hover:border-ink-500 transition-colors group">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-ink-700 border border-ink-600 flex items-center justify-center">
                    <Code2 size={16} className="text-teal-400" />
                  </div>
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-ink-700 hover:bg-ink-600 text-slate-400 hover:text-white transition-colors">
                      <ArrowUpRight size={14} />
                    </a>
                  ) : (
                    <Link to={href} className="p-1.5 rounded-lg bg-ink-700 hover:bg-ink-600 text-slate-400 hover:text-white transition-colors">
                      <ArrowUpRight size={14} />
                    </Link>
                  )}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-5">{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => <span key={t} className="tag text-[11px]">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 border-t border-ink-700">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-teal-400 text-xs font-mono uppercase tracking-widest mb-5">Client proof.</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight mb-10">
              Trusted by organizations that take security seriously.
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/portal/vapt-request" className="btn-teal text-sm px-8 py-3.5">
                Request VAPT Assessment <ArrowUpRight size={15} />
              </Link>
              <Link to="/contact" className="btn-outline text-sm px-8 py-3.5">
                Start a Project
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
