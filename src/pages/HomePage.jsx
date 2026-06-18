import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Shield, Code2, Cloud } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

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

function DevIllustration() {
  return (
    <div className="relative w-full h-[320px] md:h-[380px]">
      <div className="absolute top-6 left-6 right-6 h-48 rounded-2xl bg-white border border-surface-300 shadow-lg shadow-surface-200/50 overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-surface-200">
          <span className="w-2.5 h-2.5 rounded-full bg-coral-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-coral-500 text-xs font-mono font-bold">&lt;App /&gt;</span>
            <span className="text-ink-300 text-xs font-mono">=</span>
            <span className="text-amber-500 text-xs font-mono">{'{...}'}</span>
          </div>
          <div className="w-3/4 h-2 rounded-full bg-surface-200" />
          <div className="w-1/2 h-2 rounded-full bg-surface-200" />
          <div className="w-5/6 h-2 rounded-full bg-surface-200" />
          <div className="w-2/3 h-2 rounded-full bg-surface-200" />
        </div>
      </div>
      <div className="absolute bottom-6 left-4 bg-white border border-surface-300 rounded-xl p-3 shadow-lg shadow-surface-200/40 w-36">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-coral-500/20 to-amber-400/20 flex items-center justify-center">
            <span className="text-coral-600 font-bold text-[8px]">S</span>
          </span>
          <span className="text-ink-700 text-[10px] font-semibold">SaaS</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-surface-200 mb-1" />
        <div className="w-2/3 h-1.5 rounded-full bg-surface-200" />
      </div>
      <div className="absolute bottom-10 right-4 bg-white border border-surface-300 rounded-xl p-3 shadow-lg shadow-surface-200/40 w-36">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400/20 to-coral-500/20 flex items-center justify-center">
            <span className="text-amber-600 font-bold text-[8px]">M</span>
          </span>
          <span className="text-ink-700 text-[10px] font-semibold">Mobile</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-surface-200 mb-1" />
        <div className="w-3/4 h-1.5 rounded-full bg-surface-200" />
      </div>
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-bl from-coral-500/8 to-amber-300/8 blur-2xl pointer-events-none" />
    </div>
  );
}

function SecurityIllustration() {
  return (
    <div className="relative w-full h-[320px] md:h-[380px]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-coral-500/10 via-rose-400/10 to-amber-300/10 border border-coral-500/20 flex items-center justify-center shadow-lg shadow-coral-500/5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral-500 to-amber-400 flex items-center justify-center">
            <Shield size={28} className="text-white" />
          </div>
        </div>
      </div>
      <div className="absolute top-8 left-8 bg-white border border-surface-300 rounded-xl p-2.5 shadow-sm">
        <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
          <span className="text-rose-600 font-bold text-[9px]">W</span>
        </div>
        <p className="text-[9px] text-ink-400 mt-1 text-center font-medium">Web</p>
      </div>
      <div className="absolute top-6 right-10 bg-white border border-surface-300 rounded-xl p-2.5 shadow-sm">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <span className="text-amber-600 font-bold text-[9px]">N</span>
        </div>
        <p className="text-[9px] text-ink-400 mt-1 text-center font-medium">Net</p>
      </div>
      <div className="absolute bottom-12 left-6 bg-white border border-surface-300 rounded-xl p-2.5 shadow-sm">
        <div className="w-7 h-7 rounded-lg bg-coral-500/10 flex items-center justify-center">
          <span className="text-coral-600 font-bold text-[9px]">A</span>
        </div>
        <p className="text-[9px] text-ink-400 mt-1 text-center font-medium">API</p>
      </div>
      <div className="absolute bottom-10 right-6 bg-white border border-surface-300 rounded-xl p-2.5 shadow-sm">
        <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <span className="text-orange-600 font-bold text-[9px]">Z</span>
        </div>
        <p className="text-[9px] text-ink-400 mt-1 text-center font-medium">Zero</p>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full bg-gradient-to-t from-coral-500/5 to-transparent blur-2xl pointer-events-none" />
    </div>
  );
}

function HeroBlobs() {
  return (
    <div className="absolute top-0 -right-[6%] w-[780px] h-[780px] z-0 pointer-events-none">
      <svg viewBox="0 0 780 780" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCE3CF" />
            <stop offset="100%" stopColor="#F8C9A8" />
          </linearGradient>
          <linearGradient id="g2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDEFE3" />
            <stop offset="100%" stopColor="#F6D6BC" />
          </linearGradient>
          <linearGradient id="g3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBE8DA" />
            <stop offset="100%" stopColor="#F2C8AC" />
          </linearGradient>
        </defs>
        <path d="M520 60 C660 40 760 170 740 320 C720 470 600 540 480 530 C360 520 300 420 320 300 C340 180 400 80 520 60 Z" fill="url(#g1)" />
        <path d="M300 320 C420 300 520 380 510 500 C500 620 380 690 270 660 C160 630 110 510 150 410 C190 310 230 335 300 320 Z" fill="url(#g2)" opacity="0.9" />
        <path d="M430 480 C540 470 620 560 600 660 C580 750 460 780 380 740 C300 700 280 600 320 540 C360 480 360 488 430 480 Z" fill="url(#g3)" opacity="0.85" />
      </svg>
    </div>
  );
}

export default function HomePage() {
  const [heroRef, heroVisible] = useScrollAnimation();
  const [servicesRef, servicesVisible] = useScrollAnimation();
  const [cyberRef, cyberVisible] = useScrollAnimation();
  const [portfolioRef, portfolioVisible] = useScrollAnimation();
  const [ctaRef, ctaVisible] = useScrollAnimation();

  return (
    <div className="bg-paper text-ink min-h-screen">
      <header ref={heroRef} className="relative grid grid-cols-[1.1fr_0.9fr] gap-10 items-center py-[200px] px-14 overflow-hidden">
        <HeroBlobs />
        <div className={`relative z-2 ${heroVisible ? 'visible' : ''} fade-in-up`}>
          <span className="inline-flex items-center gap-2 text-[13px] font-bold text-orange tracking-[0.12em] uppercase mb-6">
            <span className="w-2 h-2 rounded-full bg-orange" />
            Innovation meets creativity
          </span>
          <h1 className="text-[clamp(48px,7vw,84px)] font-extrabold leading-[1.04] mb-7 tracking-tight">
            Dynamic solutions through innovation, built with <span className="text-grey">creativity.</span>
          </h1>
          <p className="text-[18px] text-grey-dark max-w-[46ch] mb-10 font-normal">
            Kreatix Technologies architects software and secures infrastructure for organizations that demand both rigorous engineering and inventive design — across software development, cybersecurity and cloud services.
          </p>
          <div className="flex gap-3.5 flex-wrap mb-14">
            <Link to="/portal/login" className="btn-primary">
              Request a VAPT assessment →
            </Link>
            <Link to="/portfolio" className="btn-outline">
              View our work
            </Link>
          </div>
          <div className="flex gap-12 pt-8 border-t border-border">
            <div>
              <div className="font-display font-extrabold text-[30px] text-ink">120+</div>
              <div className="text-[13px] text-grey font-semibold mt-1">Projects delivered</div>
            </div>
            <div>
              <div className="font-display font-extrabold text-[30px] text-ink">40+</div>
              <div className="text-[13px] text-grey font-semibold mt-1">Security assessments</div>
            </div>
            <div>
              <div className="font-display font-extrabold text-[30px] text-ink">99.9%</div>
              <div className="text-[13px] text-grey font-semibold mt-1">Client uptime SLA</div>
            </div>
          </div>
        </div>
        <div className={`relative z-2 h-[560px] ${heroVisible ? 'visible' : ''} scale-in`}>
          <div className="pill top-[18%] right-[4%] animate-float" style={{ animationDelay: '0s' }}>
            <span className="w-2 h-2 rounded-full bg-orange flex-shrink-0" />
            Zero-trust architecture
          </div>
          <div className="pill top-[52%] left-[6%] animate-float" style={{ animationDelay: '1.5s' }}>
            <span className="w-2 h-2 rounded-full bg-orange flex-shrink-0" />
            Custom software
          </div>
          <div className="pill bottom-[8%] right-[14%] animate-float" style={{ animationDelay: '3s' }}>
            <span className="w-2 h-2 rounded-full bg-orange flex-shrink-0" />
            Cloud infrastructure
          </div>
        </div>
      </header>

      <div className="border-t border-b border-border overflow-hidden py-7 bg-paper">
        <div className="flex gap-5 animate-scroll-left" style={{ width: 'max-content', animation: 'scroll-left 80s linear infinite' }}>
          {[
            'Vulnerability assessment', 'Penetration testing', 'Threat intelligence',
            'Endpoint detection & response', 'Extended detection & response',
            'Managed detection & response', 'API security', 'Cloud native security',
            'Endpoint management', 'Zero-trust architecture', 'Incident response', 'Security audits',
            'Vulnerability assessment', 'Penetration testing', 'Threat intelligence',
            'Endpoint detection & response', 'Extended detection & response',
            'Managed detection & response', 'API security', 'Cloud native security',
            'Endpoint management', 'Zero-trust architecture', 'Incident response', 'Security audits',
            'Vulnerability assessment', 'Penetration testing', 'Threat intelligence',
            'Endpoint detection & response', 'Extended detection & response',
            'Managed detection & response', 'API security', 'Cloud native security',
            'Endpoint management', 'Zero-trust architecture', 'Incident response', 'Security audits',
          ].map((label, i) => (
            <div key={i} className="marquee-item">{label}</div>
          ))}
        </div>
      </div>

      <section ref={servicesRef} className="py-[100px] px-14 bg-offwhite">
        <div className={`max-w-[680px] mb-16 ${servicesVisible ? 'visible' : ''} fade-in-up`}>
          <span className="text-[13px] font-bold text-orange tracking-[0.12em] uppercase block mb-4">What we do</span>
          <h2 className="text-[clamp(30px,4.2vw,48px)] leading-[1.12] font-extrabold">Three disciplines, one team</h2>
          <p className="text-grey-dark text-[17px] mt-4 max-w-[50ch]">From the first line of code to the systems that keep it safe and running — we cover the full lifecycle.</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className={`service-card ${servicesVisible ? 'visible' : ''} fade-in-up`} style={{ transitionDelay: '0.1s' }}>
            <div className="w-11 h-11 rounded-[12px] bg-ink text-white flex items-center justify-center font-extrabold text-[15px] mb-7">01</div>
            <h3 className="text-[22px] mb-3 font-extrabold">Software development</h3>
            <p className="text-grey-dark text-[15px] mb-6">Custom web and mobile applications, internal tools and platforms — designed with creativity and built to scale.</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[12px] font-semibold text-ink bg-offwhite border border-border rounded-full px-3.5 py-1.5">Web apps</span>
              <span className="text-[12px] font-semibold text-ink bg-offwhite border border-border rounded-full px-3.5 py-1.5">Mobile apps</span>
              <span className="text-[12px] font-semibold text-ink bg-offwhite border border-border rounded-full px-3.5 py-1.5">APIs</span>
              <span className="text-[12px] font-semibold text-ink bg-offwhite border border-border rounded-full px-3.5 py-1.5">Product design</span>
            </div>
          </div>
          <div className={`service-card featured shadow-lg ${servicesVisible ? 'visible' : ''} fade-in-up`} style={{ transitionDelay: '0.2s' }}>
            <div className="w-11 h-11 rounded-[12px] bg-orange text-white flex items-center justify-center font-extrabold text-[15px] mb-7">02</div>
            <h3 className="text-[22px] mb-3 font-extrabold">Cybersecurity</h3>
            <p className="text-grey-dark text-[15px] mb-6">Assessments, monitoring and protection that find weaknesses before attackers do — and respond fast when it matters.</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[12px] font-semibold text-ink bg-paper border border-border rounded-full px-3.5 py-1.5">VAPT</span>
              <span className="text-[12px] font-semibold text-ink bg-paper border border-border rounded-full px-3.5 py-1.5">EDR / XDR / MDR</span>
              <span className="text-[12px] font-semibold text-ink bg-paper border border-border rounded-full px-3.5 py-1.5">Endpoint mgmt</span>
              <span className="text-[12px] font-semibold text-ink bg-paper border border-border rounded-full px-3.5 py-1.5">API security</span>
            </div>
          </div>
          <div className={`service-card ${servicesVisible ? 'visible' : ''} fade-in-up`} style={{ transitionDelay: '0.3s' }}>
            <div className="w-11 h-11 rounded-[12px] bg-ink text-white flex items-center justify-center font-extrabold text-[15px] mb-7">03</div>
            <h3 className="text-[22px] mb-3 font-extrabold">Cloud services</h3>
            <p className="text-grey-dark text-[15px] mb-6">Architecture, migration and managed operations across major cloud platforms — built for cost, performance and uptime.</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[12px] font-semibold text-ink bg-offwhite border border-border rounded-full px-3.5 py-1.5">Migration</span>
              <span className="text-[12px] font-semibold text-ink bg-offwhite border border-border rounded-full px-3.5 py-1.5">IaC</span>
              <span className="text-[12px] font-semibold text-ink bg-offwhite border border-border rounded-full px-3.5 py-1.5">Managed ops</span>
              <span className="text-[12px] font-semibold text-ink bg-offwhite border border-border rounded-full px-3.5 py-1.5">Cost optimisation</span>
            </div>
          </div>
        </div>
      </section>

      <section ref={cyberRef} className="py-[100px] px-14">
        <div className={`max-w-[680px] mb-16 ${cyberVisible ? 'visible' : ''} fade-in-up`}>
          <span className="text-[13px] font-bold text-orange tracking-[0.12em] uppercase block mb-4">Cybersecurity services</span>
          <h2 className="text-[clamp(30px,4.2vw,48px)] leading-[1.12] font-extrabold">Find the gaps. Close them. Watch what's left.</h2>
          <p className="text-grey-dark text-[17px] mt-4 max-w-[50ch]">A layered set of services covering assessment, detection and ongoing protection — tailored to your environment.</p>
        </div>
        <div className="grid grid-cols-4 gap-5">
          <div className={`cyber-card ${cyberVisible ? 'visible' : ''} fade-in-up`} style={{ transitionDelay: '0.1s' }}>
            <div className="w-10 h-10 rounded-[10px] bg-offwhite flex items-center justify-center mb-5 font-extrabold text-[14px] text-orange">VA</div>
            <h4 className="text-[17px] mb-2.5 font-extrabold">Vulnerability assessment & pen testing</h4>
            <p className="text-grey-dark text-[14px]">Scoped, methodical testing of your systems with clear, actionable reporting.</p>
          </div>
          <div className={`cyber-card ${cyberVisible ? 'visible' : ''} fade-in-up`} style={{ transitionDelay: '0.2s' }}>
            <div className="w-10 h-10 rounded-[10px] bg-offwhite flex items-center justify-center mb-5 font-extrabold text-[14px] text-orange">TD</div>
            <h4 className="text-[17px] mb-2.5 font-extrabold">Threat detection & response</h4>
            <p className="text-grey-dark text-[14px]">EDR, XDR and MDR services that monitor and respond around the clock.</p>
          </div>
          <div className={`cyber-card ${cyberVisible ? 'visible' : ''} fade-in-up`} style={{ transitionDelay: '0.3s' }}>
            <div className="w-10 h-10 rounded-[10px] bg-offwhite flex items-center justify-center mb-5 font-extrabold text-[14px] text-orange">EM</div>
            <h4 className="text-[17px] mb-2.5 font-extrabold">Endpoint management</h4>
            <p className="text-grey-dark text-[14px]">Centralised visibility and control across laptops, servers and devices.</p>
          </div>
          <div className={`cyber-card ${cyberVisible ? 'visible' : ''} fade-in-up`} style={{ transitionDelay: '0.4s' }}>
            <div className="w-10 h-10 rounded-[10px] bg-offwhite flex items-center justify-center mb-5 font-extrabold text-[14px] text-orange">AS</div>
            <h4 className="text-[17px] mb-2.5 font-extrabold">API security</h4>
            <p className="text-grey-dark text-[14px]">Discovery, testing and continuous protection for your APIs and integrations.</p>
          </div>
        </div>

        <div className={`bg-ink rounded-[24px] p-14 grid grid-cols-[1.4fr_1fr] gap-10 items-center mt-8 text-white relative overflow-hidden ${cyberVisible ? 'visible' : ''} scale-in`} style={{ transitionDelay: '0.5s' }}>
          <div className="absolute top-[-40%] right-[-15%] w-[380px] h-[380px] rounded-full bg-[radial-gradient(circle,rgba(242,120,46,0.35),transparent_70%)]" />
          <div className="relative">
            <h3 className="text-[clamp(24px,3vw,32px)] mb-3.5 font-extrabold relative">Submit your VAPT scope in one guided flow</h3>
            <p className="text-[#C7C9CC] text-[15px] max-w-[48ch] relative">Tell us what you need assessed and upload supporting documents — network diagrams, IP ranges, NDAs. Our team reviews, scopes and responds, with every update and deliverable shared back through the same thread.</p>
            <div className="flex gap-3.5 mt-7 mb-0">
              <Link to="/portal/login" className="btn-orange">Start a VAPT request →</Link>
            </div>
          </div>
          <div className="flex flex-col gap-3 relative">
            <div className="flex items-center gap-3.5 bg-white/6 border border-white/10 rounded-[14px] p-3.5 text-[14px] font-semibold">
              <span className="w-6.5 h-6.5 rounded-full bg-orange flex items-center justify-center font-extrabold text-[12px] flex-shrink-0">1</span>
              Submit scope & documents
            </div>
            <div className="flex items-center gap-3.5 bg-white/6 border border-white/10 rounded-[14px] p-3.5 text-[14px] font-semibold">
              <span className="w-6.5 h-6.5 rounded-full bg-orange flex items-center justify-center font-extrabold text-[12px] flex-shrink-0">2</span>
              Team reviews & scopes engagement
            </div>
            <div className="flex items-center gap-3.5 bg-white/6 border border-white/10 rounded-[14px] p-3.5 text-[14px] font-semibold">
              <span className="w-6.5 h-6.5 rounded-full bg-orange flex items-center justify-center font-extrabold text-[12px] flex-shrink-0">3</span>
              Testing & live status updates
            </div>
            <div className="flex items-center gap-3.5 bg-white/6 border border-white/10 rounded-[14px] p-3.5 text-[14px] font-semibold">
              <span className="w-6.5 h-6.5 rounded-full bg-orange flex items-center justify-center font-extrabold text-[12px] flex-shrink-0">4</span>
              Report & remediation guidance delivered
            </div>
          </div>
        </div>
      </section>

      <section ref={portfolioRef} className="py-[100px] px-14">
        <div className={`max-w-[680px] mb-16 ${portfolioVisible ? 'visible' : ''} fade-in-up`}>
          <span className="text-[13px] font-bold text-orange tracking-[0.12em] uppercase block mb-4">Selected work</span>
          <h2 className="text-[clamp(30px,4.2vw,48px)] leading-[1.12] font-extrabold">Things we've shipped</h2>
          <p className="text-grey-dark text-[17px] mt-4 max-w-[50ch]">A look at recent apps and websites we've built — each with a short walkthrough of how it works.</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className={`work-card ${portfolioVisible ? 'visible' : ''} fade-in-up`} style={{ transitionDelay: '0.1s' }}>
            <div className="h-[200px] bg-offwhite flex items-center justify-center text-grey text-[13px] font-semibold relative">
              <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center text-[16px] text-orange shadow-lg">▶</div>
            </div>
            <div className="p-6">
              <h4 className="text-[17px] mb-2 font-extrabold">Fintech onboarding app</h4>
              <p className="text-grey-dark text-[14px] mb-4">A mobile-first KYC and onboarding flow for a digital lender, cutting signup time from 12 minutes to 3.</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-[12px] font-semibold text-orange-deep bg-orange-light rounded-full px-3 py-1.5">React Native</span>
                <span className="text-[12px] font-semibold text-orange-deep bg-orange-light rounded-full px-3 py-1.5">Node.js</span>
                <span className="text-[12px] font-semibold text-orange-deep bg-orange-light rounded-full px-3 py-1.5">AWS</span>
              </div>
            </div>
          </div>
          <div className={`work-card ${portfolioVisible ? 'visible' : ''} fade-in-up`} style={{ transitionDelay: '0.2s' }}>
            <div className="h-[200px] bg-offwhite flex items-center justify-center text-grey text-[13px] font-semibold relative">
              <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center text-[16px] text-orange shadow-lg">▶</div>
            </div>
            <div className="p-6">
              <h4 className="text-[17px] mb-2 font-extrabold">Logistics dashboard</h4>
              <p className="text-grey-dark text-[14px] mb-4">Real-time fleet tracking and reporting platform used across three regional hubs.</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-[12px] font-semibold text-orange-deep bg-orange-light rounded-full px-3 py-1.5">Next.js</span>
                <span className="text-[12px] font-semibold text-orange-deep bg-orange-light rounded-full px-3 py-1.5">PostgreSQL</span>
                <span className="text-[12px] font-semibold text-orange-deep bg-orange-light rounded-full px-3 py-1.5">Mapbox</span>
              </div>
            </div>
          </div>
          <div className={`work-card ${portfolioVisible ? 'visible' : ''} fade-in-up`} style={{ transitionDelay: '0.3s' }}>
            <div className="h-[200px] bg-offwhite flex items-center justify-center text-grey text-[13px] font-semibold relative">
              <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center text-[16px] text-orange shadow-lg">▶</div>
            </div>
            <div className="p-6">
              <h4 className="text-[17px] mb-2 font-extrabold">Healthcare booking platform</h4>
              <p className="text-grey-dark text-[14px] mb-4">Appointment scheduling and patient records system for a multi-branch clinic group.</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-[12px] font-semibold text-orange-deep bg-orange-light rounded-full px-3 py-1.5">Django</span>
                <span className="text-[12px] font-semibold text-orange-deep bg-orange-light rounded-full px-3 py-1.5">React</span>
                <span className="text-[12px] font-semibold text-orange-deep bg-orange-light rounded-full px-3 py-1.5">Azure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={ctaRef} className={`bg-offwhite text-center rounded-[28px] mx-14 mb-0 py-20 px-10 ${ctaVisible ? 'visible' : ''} scale-in`}>
        <h2 className="text-[clamp(28px,5vw,52px)] mb-5 font-extrabold max-w-[18ch] mx-auto">Tell us what you're protecting — or building next.</h2>
        <p className="text-grey-dark max-w-[50ch] mx-auto mb-9 text-[16px]">Whether it's a new product, a cloud migration, or a security assessment, our team replies within one business day.</p>
        <div className="flex gap-3.5 justify-center flex-wrap">
          <Link to="/portal/login" className="btn-primary">Start a VAPT request →</Link>
          <Link to="/contact" className="btn-outline">Talk to our team</Link>
        </div>
      </section>
    </div>
  );
}