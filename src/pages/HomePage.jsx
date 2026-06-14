import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Shield, Code2, Cloud } from 'lucide-react';

const stats = [
  { value: '99.9%', label: 'Uptime Guaranteed' },
  { value: '24/7',  label: 'Active Threat Hunting' },
  { value: String.fromCharCode(8734), label: 'Vulnerability Patcher' },
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

function GlassSculpture() {
  return (
    <div className="relative w-full h-[480px] md:h-[560px]">
      <div className="absolute top-8 right-0 w-64 h-80 rounded-full bg-gradient-to-br from-orange-300/50 via-rose-300/30 to-amber-200/40 backdrop-blur-3xl" />
      <div className="absolute top-28 right-20 w-48 h-64 rounded-[40%] bg-gradient-to-tr from-rose-400/40 via-orange-300/30 to-pink-300/20 backdrop-blur-2xl rotate-12" />
      <div className="absolute top-12 right-40 w-36 h-52 rounded-full bg-gradient-to-bl from-amber-300/40 via-orange-200/30 to-rose-300/20 backdrop-blur-xl -rotate-6" />
      <div className="absolute bottom-8 right-8 w-44 h-44 rounded-[45%] bg-gradient-to-t from-orange-400/30 via-rose-300/25 to-amber-200/30 backdrop-blur-2xl rotate-45" />
      <div className="absolute top-36 right-28 w-28 h-40 rounded-full bg-gradient-to-br from-orange-200/30 to-rose-200/20 backdrop-blur-2xl" />
      <div className="absolute top-20 right-4 bg-white/80 backdrop-blur-md border border-white/60 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
        <span className="text-[11px] font-medium text-ink-700">Zero-Trust Architecture</span>
      </div>
      <div className="absolute top-1/2 right-36 bg-white/80 backdrop-blur-md border border-white/60 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
        <span className="text-[11px] font-medium text-ink-700">Custom Software</span>
      </div>
      <div className="absolute bottom-20 right-4 bg-white/80 backdrop-blur-md border border-white/60 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
        <span className="text-[11px] font-medium text-ink-700">Cloud Infrastructure</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-surface-50 text-ink-900 min-h-screen">
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <p className="text-coral-500 text-xs font-semibold tracking-widest uppercase mb-6">
                Innovation meets Creativity
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] mb-8">
                Dynamic solutions<br />
                through innovation<br />
                <span className="text-ink-300">with creativity.</span>
              </h1>
              <p className="text-ink-500 text-base max-w-md leading-relaxed mb-10">
                We architect software and secure infrastructure for organizations that demand both
                rigorous engineering and inventive design.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <Link to="/portal/vapt-request" className="btn-primary">
                  Request a VAPT Assessment
                </Link>
                <Link to="/portfolio" className="btn-outline">
                  View Our Work
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
                  ].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <div className="leading-none">
                  <p className="text-ink-900 text-xs font-semibold tracking-wider uppercase">Trusted Experts</p>
                  <p className="text-ink-400 text-[10px] tracking-wide">50+ Happy Clients Worldwide</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <GlassSculpture />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-surface-300 overflow-hidden py-8 bg-surface-50">
        <div className="flex animate-marquee">
          {[...Array(2)].map((_, set) => (
            <div key={set} className="flex gap-4 px-2 flex-shrink-0">
              {['Cloud Native Dev', 'Threat Intelligence', 'API Security', 'Custom Software', 'Zero-Trust', 'Vulnerability Assessment', 'Penetration Testing', 'Active Dev'].map((label) => (
                <span key={`${set}-${label}`} className="inline-flex items-center whitespace-nowrap px-6 py-3 border border-dashed border-surface-400 rounded-full text-xs font-medium text-ink-500 tracking-wide uppercase">
                  {label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-surface-300 bg-surface-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-black text-ink-900 tracking-tighter mb-1">{value}</p>
                <p className="text-ink-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-16">
            <p className="text-coral-500 text-xs font-semibold uppercase tracking-widest mb-4">What we do</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Our Disciplines.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mb-20">
            {disciplines.map(({ icon: Icon, title, body, href }) => (
              <div key={title} className="card p-8 hover:shadow-lg transition-shadow">
                <Icon size={22} className="text-coral-500 mb-5" />
                <h3 className="text-ink-900 font-bold text-lg mb-3">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed mb-5">{body}</p>
                <Link to={href} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-coral-500 transition-colors">
                  Learn More <ArrowUpRight size={13} />
                </Link>
              </div>
            ))}
          </div>
          {disciplines.map(({ icon: Icon, title, items, body, href }, i) => (
            <div key={title} className={'flex flex-col gap-10 py-12 border-t border-surface-300 ' + (i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row')}>
              <div className="md:w-1/3">
                <Icon size={18} className="text-coral-500 mb-4" />
                <h3 className="text-2xl font-black text-ink-900 tracking-tight mb-3">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{body}</p>
                <Link to={href} className="inline-flex items-center gap-1.5 mt-5 text-xs font-semibold text-coral-500 hover:text-coral-600 transition-colors">
                  Learn More <ArrowUpRight size={13} />
                </Link>
              </div>
              <ul className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map(item => (
                  <li key={item} className="flex items-start gap-3 bg-surface-100 border border-surface-300 rounded-xl p-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-coral-500 mt-1.5 flex-shrink-0" />
                    <span className="text-ink-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="py-28 border-t border-surface-300 bg-surface-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-16 gap-6 flex-wrap">
            <div>
              <p className="text-coral-500 text-xs font-semibold uppercase tracking-widest mb-4">Portfolio</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">Selected Work</h2>
              <p className="text-ink-500 mt-3 max-w-md text-sm leading-relaxed">
                Real results driven by deep technical expertise and inventive problem-solving.
              </p>
            </div>
            <Link to="/portfolio" className="btn-outline text-xs px-5 py-2.5 flex-shrink-0">
              View All Projects <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {work.map(({ title, desc, tags, href, external }) => (
              <div key={title} className="card p-8 flex flex-col hover:shadow-lg transition-shadow bg-white">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-surface-200 border border-surface-300 flex items-center justify-center">
                    <Code2 size={16} className="text-coral-500" />
                  </div>
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-ink-400 hover:text-ink-900 transition-colors">
                      <ArrowUpRight size={14} />
                    </a>
                  ) : (
                    <Link to={href} className="p-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-ink-400 hover:text-ink-900 transition-colors">
                      <ArrowUpRight size={14} />
                    </Link>
                  )}
                </div>
                <h3 className="text-ink-900 font-bold text-lg mb-2">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed flex-1 mb-5">{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => <span key={t} className="tag text-[11px]">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 border-t border-surface-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-coral-500 text-xs font-semibold uppercase tracking-widest mb-5">Client proof.</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-10">
              Trusted by organizations that take security seriously.
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link to="/portal/vapt-request" className="btn-primary">
                Request VAPT Assessment <ArrowUpRight size={15} />
              </Link>
              <Link to="/contact" className="btn-outline">
                Start a Project
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}