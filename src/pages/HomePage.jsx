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

      {/* Stats — with decorative coral glow */}
      <section className="border-y border-surface-300 bg-surface-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-br from-coral-500/5 via-amber-300/5 to-rose-300/5 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map(({ value, label }, i) => (
              <div key={label} className="text-center md:text-left group">
                <p className="text-4xl md:text-5xl font-black tracking-tighter mb-2 group-hover:text-coral-500 transition-colors duration-300">{value}</p>
                <div className="h-0.5 w-8 bg-gradient-to-r from-coral-500 to-amber-300 rounded-full mb-3 mx-auto md:mx-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-ink-400 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disciplines — with coral card accents and icon circles */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-coral-500/3 via-amber-300/3 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          <div className="mb-16">
            <p className="text-coral-500 text-xs font-semibold uppercase tracking-widest mb-4">What we do</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Our Disciplines.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mb-20">
            {disciplines.map(({ icon: Icon, title, body, href }) => (
              <div key={title} className="group card p-8 bg-white relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-coral-500 via-amber-400 to-coral-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-500/10 to-amber-400/10 border border-coral-500/15 flex items-center justify-center mb-6">
                  <Icon size={20} className="text-coral-500" />
                </div>
                <h3 className="text-ink-900 font-bold text-lg mb-3 group-hover:text-coral-500 transition-colors">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed mb-5">{body}</p>
                <Link to={href} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-400 group-hover:text-coral-500 transition-colors">
                  Learn More <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

          {disciplines.map(({ icon: Icon, title, items, body, href }, i) => (
            <div key={title} className={'flex flex-col gap-10 py-16 border-t border-surface-300 relative ' + (i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row')}>
              {/* Decorative floating shape */}
              <div className={'absolute top-8 ' + (i % 2 === 1 ? 'left-0' : 'right-0') + ' w-32 h-32 rounded-full bg-gradient-to-br from-coral-500/8 to-amber-300/8 blur-2xl pointer-events-none hidden lg:block'} />
              <div className="md:w-1/3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-coral-500/10 to-amber-400/10 border border-coral-500/15 flex items-center justify-center mb-5">
                  <Icon size={18} className="text-coral-500" />
                </div>
                <h3 className="text-2xl font-black text-ink-900 tracking-tight mb-3">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{body}</p>
                <Link to={href} className="inline-flex items-center gap-1.5 mt-5 text-xs font-semibold text-coral-500 hover:text-coral-600 transition-colors">
                  Learn More <ArrowUpRight size={13} />
                </Link>
              </div>
              <ul className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map(item => (
                  <li key={item} className="group flex items-start gap-3 bg-white border border-surface-300 rounded-xl p-4 hover:border-coral-500/30 hover:shadow-sm transition-all duration-200">
                    <span className="w-5 h-5 rounded-lg bg-coral-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
                    </span>
                    <span className="text-ink-600 text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio — with image headers and gradient hover cards */}
      <section className="py-28 border-t border-surface-300 bg-surface-100 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] rounded-full bg-gradient-to-tr from-amber-300/5 via-coral-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
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
            {work.map(({ title, desc, tags, href, external }, i) => (
              <div key={title} className="group card p-0 flex flex-col overflow-hidden bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Card header gradient */}
                <div className={'h-32 relative overflow-hidden ' + (i === 0 ? 'bg-gradient-to-br from-coral-500/20 via-rose-400/20 to-amber-300/20' : i === 1 ? 'bg-gradient-to-br from-amber-300/20 via-orange-300/20 to-coral-500/20' : 'bg-gradient-to-br from-rose-300/20 via-coral-500/20 to-amber-300/20')}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <Code2 size={22} className="text-coral-500" />
                    </div>
                  </div>
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm text-ink-400 hover:text-coral-500 transition-colors shadow-sm">
                      <ArrowUpRight size={13} />
                    </a>
                  ) : (
                    <Link to={href} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm text-ink-400 hover:text-coral-500 transition-colors shadow-sm">
                      <ArrowUpRight size={13} />
                    </Link>
                  )}
                </div>
                <div className="p-7 flex-1 flex flex-col">
                  <h3 className="text-ink-900 font-bold text-lg mb-2 group-hover:text-coral-500 transition-colors">{title}</h3>
                  <p className="text-ink-500 text-sm leading-relaxed flex-1 mb-5">{desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(t => <span key={t} className="tag text-[11px]">{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Trust Quote */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-100 via-white to-surface-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-r from-coral-500/5 via-amber-300/5 to-rose-300/5 blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 lg:px-10 relative text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral-500 to-amber-400 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-coral-500/10">
            <Shield size={28} className="text-white" />
          </div>
          <blockquote className="text-3xl md:text-4xl font-black tracking-tight text-ink-900 leading-snug mb-8">
            &ldquo;Kreatix Technologies transformed our security posture. Their VAPT assessment uncovered critical vulnerabilities we never knew existed.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-500/20 to-amber-400/20 border border-coral-500/20 flex items-center justify-center">
              <span className="text-coral-600 font-bold text-xs">CT</span>
            </div>
            <div className="text-left">
              <p className="text-ink-900 font-semibold text-sm">Caremaster Technologies</p>
              <p className="text-ink-400 text-xs">Healthcare SaaS Platform</p>
            </div>
          </div>
          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {['SOC 2 Compliant', 'ISO 27001 Ready', 'NIST Aligned'].map(badge => (
              <span key={badge} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-surface-300 text-xs font-medium text-ink-500 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-coral-500" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — bold coral gradient section */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-950 to-ink-900" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-coral-500/15 via-amber-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-400/10 via-rose-400/8 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-coral-400 text-xs font-semibold uppercase tracking-widest mb-5">Ready to secure your business?</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6 text-white">
                Let&apos;s build something secure and exceptional.
              </h2>
              <p className="text-ink-400 text-sm leading-relaxed mb-8 max-w-md">
                Trusted by organizations that take security seriously. Start with a free VAPT assessment or tell us about your project.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/portal/vapt-request" className="btn-coral">
                  Request VAPT Assessment <ArrowUpRight size={15} />
                </Link>
                <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-ink-600 text-ink-300 font-semibold text-sm rounded-full transition-all duration-200 hover:bg-white hover:text-ink-900 hover:border-white">
                  Start a Project
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[340px]">
                <div className="absolute top-4 right-12 w-48 h-48 rounded-full bg-gradient-to-br from-coral-500/25 via-rose-400/20 to-amber-300/15 backdrop-blur-2xl" />
                <div className="absolute top-16 right-4 w-36 h-36 rounded-[40%] bg-gradient-to-tr from-amber-300/20 via-orange-300/15 to-pink-300/10 backdrop-blur-xl rotate-12" />
                <div className="absolute bottom-4 right-24 w-32 h-32 rounded-full bg-gradient-to-bl from-rose-400/15 via-coral-500/10 to-amber-200/10 backdrop-blur-xl" />
                <div className="absolute top-1/2 right-0 w-40 h-40 rounded-full bg-gradient-to-t from-coral-500/10 to-rose-300/5 backdrop-blur-2xl -rotate-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}