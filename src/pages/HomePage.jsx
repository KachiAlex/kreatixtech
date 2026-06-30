import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO, { organizationSchema, websiteSchema } from '../components/SEO';
import Testimonials from '../components/Testimonials';

// ── Kinetic headline words ──────────────────────────────────────────────────
const KINETIC_WORDS = ['build', 'secure', 'scale', 'ship', 'protect'];

function useKineticWord() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('in'); // 'in' | 'out'
  useEffect(() => {
    const tick = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setIdx(i => (i + 1) % KINETIC_WORDS.length);
        setPhase('in');
      }, 300);
    }, 2200);
    return () => clearInterval(tick);
  }, []);
  return { word: KINETIC_WORDS[idx], phase };
}

// ── Animated counter ────────────────────────────────────────────────────────
function Counter({ target, suffix = '+', duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          setVal(Math.round(p * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Scroll-triggered visibility ─────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── API_URL (same pattern as portal) ─────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || '';

// ── Marquee items ────────────────────────────────────────────────────────────
const MARQUEE = [
  { label: 'VAPT', hi: true }, { label: 'Threat intelligence' },
  { label: 'Penetration testing', hi: true }, { label: 'Endpoint detection & response' },
  { label: 'API security', hi: true }, { label: 'Extended detection & response' },
  { label: 'Zero-trust architecture', hi: true }, { label: 'Managed detection & response' },
  { label: 'Vulnerability assessment', hi: true }, { label: 'Endpoint management' },
  { label: 'Incident response', hi: true }, { label: 'Security audits' },
  { label: 'Cloud native security', hi: true },
];
const MARQUEE_DOUBLED = [...MARQUEE, ...MARQUEE];

// ── Work cards — fetched from API, fallback to static ────────────────────────
const STATIC_WORK = [
  { id:'caremaster', title:'Caremaster', description:'A multi-tenant SaaS solution helping care agencies manage operations, staff scheduling, and compliance securely.', tags:['SaaS','Multi-tenant','Healthcare'], liveUrl:'https://getcaremaster.com', previewUrl:null },
  { id:'propertyark', title:'PropertyArk', description:'A multivendor Real Estate platform providing a secure ecosystem for property businesses and buyers globally.', tags:['Marketplace','Real Estate','Security'], liveUrl:null, previewUrl:null },
  { id:'ojawa', title:'Ojawa Africa', description:'A multivendor eCommerce application that guarantees secure transactions via an integrated escrow system.', tags:['eCommerce','Escrow','Fintech'], liveUrl:null, previewUrl:null },
  { id:'fintech', title:'Fintech onboarding app', description:'A mobile-first KYC and onboarding flow for a digital lender, cutting signup time from 12 minutes to 3.', tags:['React Native','Node.js','AWS'], liveUrl:null, previewUrl:null },
];

function useProjects(limit = 6) {
  const [projects, setProjects] = useState(STATIC_WORK);
  useEffect(() => {
    fetch(`${API_URL}/api/projects?limit=${limit}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.length) setProjects(data); })
      .catch(() => {});
  }, [limit]);
  return projects;
}

// ── Service tab data ─────────────────────────────────────────────────────────
const TABS = [
  { key: 'software', label: 'Software development' },
  { key: 'cyber',    label: 'Cybersecurity' },
  { key: 'cloud',    label: 'Cloud services' },
];

const SERVICE_PANELS = {
  software: {
    title: 'Software development',
    desc: 'Custom web and mobile applications, internal tools and platforms — designed with creativity and engineered to scale reliably.',
    features: ['Web applications & portals', 'Mobile apps (iOS & Android)', 'API design & integrations', 'Product design & UX', 'Internal tools & dashboards'],
    ctaLabel: 'See what we\'ve shipped →', ctaHref: '/portfolio',
    cards: [
      { label: 'Process', title: 'Discovery → Design → Build → Ship', body: 'We run structured discovery sprints before writing a line of code, so what we build always solves the right problem.' },
      { label: 'Delivery', title: 'Agile, with clear milestones', body: 'Weekly check-ins, living documentation and deployments you can see — not a black box you open six months later.' },
      { label: 'Stack', title: 'Next.js, React Native, Node, Django', body: 'We choose the right tool for your context — not the one we find most comfortable.' },
    ],
  },
  cyber: {
    title: 'Cybersecurity',
    desc: 'Assessments, monitoring and protection that find weaknesses before attackers do — and respond fast when it matters most.',
    features: ['Vulnerability Assessment & Pen Testing (VAPT)', 'Endpoint Detection & Response (EDR)', 'Extended & Managed Detection (XDR / MDR)', 'Endpoint management', 'API security & testing'],
    ctaLabel: 'Explore cybersecurity →', ctaHref: '/services/cybersecurity',
    cards: [
      { label: 'Assessment', title: 'Scoped, methodical, clear', body: 'Every VAPT engagement starts with a defined scope and ends with an actionable report — not just a CVE list.' },
      { label: 'Monitoring', title: '24/7 threat visibility', body: 'Our MDR service keeps eyes on your environment around the clock, with escalation paths that actually work.' },
    ],
  },
  cloud: {
    title: 'Cloud services',
    desc: 'Architecture, migration and managed operations across AWS, Azure and GCP — built for cost efficiency, performance and uptime.',
    features: ['Cloud architecture & design', 'Migration & lift-and-shift', 'Infrastructure as code (Terraform)', 'Managed cloud operations', 'Cost optimisation & FinOps'],
    ctaLabel: 'Talk to our cloud team →', ctaHref: '/contact',
    cards: [
      { label: 'Platforms', title: 'AWS · Azure · GCP', body: 'We\'re platform-agnostic. We recommend what fits your workload, compliance requirements and team.' },
      { label: 'Operations', title: 'We run it so you don\'t have to', body: 'From monitoring and patching to incident response — our managed ops team keeps your infrastructure healthy.' },
    ],
  },
};

// ── WorkCard ─────────────────────────────────────────────────────────────────
function WorkCard({ title, description, desc, tags, liveUrl, href, external, previewUrl }) {
  // Support both old shape (desc/href/external) and new API shape (description/liveUrl/previewUrl)
  const text = description || desc || '';
  const target = liveUrl || href || '/portfolio';
  const isExternal = !!(liveUrl || external);
  const Tag = isExternal ? 'a' : Link;
  const props = isExternal
    ? { href: target, target: '_blank', rel: 'noopener noreferrer' }
    : { to: target };

  return (
    <Tag {...props} className="flex-none w-[340px] border border-[#E8E5E0] rounded-[20px] overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group">
      <div className="h-[200px] bg-[#F7F5F2] relative overflow-hidden">
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={`${title} preview`}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {isExternal && (
              <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-[#F2782E] flex items-center justify-center text-white text-xs shadow-lg shadow-orange-400/40 opacity-90">▶</div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-[250px] h-[145px] rounded-xl bg-white border border-[#E8E5E0] shadow-lg overflow-hidden p-3">
              <div className="flex items-center gap-1 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-300" />
                <div className="w-2 h-2 rounded-full bg-yellow-300" />
                <div className="w-2 h-2 rounded-full bg-green-300" />
              </div>
              <div className="h-1.5 bg-[#F7F5F2] rounded mb-2 w-3/5" />
              <div className="flex gap-2 mb-2">
                <div className="h-8 bg-[#F7F5F2] rounded flex-1" />
                <div className="h-8 bg-[rgba(242,120,46,0.15)] rounded flex-1" />
              </div>
              <div className="h-1.5 bg-[#F7F5F2] rounded mb-1.5 w-4/5" />
              <div className="h-1.5 bg-[#F7F5F2] rounded w-1/2" />
            </div>
            {isExternal && (
              <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-[#F2782E] flex items-center justify-center text-white text-xs shadow-lg shadow-orange-400/40">▶</div>
            )}
          </div>
        )}
      </div>
      <div className="p-5">
        <h4 className="text-[17px] font-extrabold mb-2 group-hover:text-[#F2782E] transition-colors">{title}</h4>
        <p className="text-sm text-[#6B6F76] mb-3 leading-relaxed line-clamp-3">{text}</p>
        <div className="flex gap-1.5 flex-wrap">
          {(tags || []).map(t => (
            <span key={t} className="text-[11px] font-bold text-[#F2782E] bg-[#FDF1E8] rounded-full px-2.5 py-1">{t}</span>
          ))}
        </div>
      </div>
    </Tag>
  );
}

// ── ServicePanel ─────────────────────────────────────────────────────────────
function ServicePanel({ data, active }) {
  return (
    <div className={`${active ? 'grid' : 'hidden'} grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start`}>
      <div className="bg-white rounded-3xl p-10 border border-[#E8E5E0]">
        <h3 className="text-3xl font-extrabold mb-4">{data.title}</h3>
        <p className="text-[#6B6F76] text-base leading-relaxed mb-8">{data.desc}</p>
        <div className="flex flex-col gap-3.5 mb-8">
          {data.features.map(f => (
            <div key={f} className="flex items-center gap-3.5 bg-[#F7F5F2] rounded-xl px-4 py-3.5 text-sm font-semibold">
              <span className="w-6 h-6 rounded-full bg-[#F2782E] flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>
              {f}
            </div>
          ))}
        </div>
        <Link to={data.ctaHref} className="inline-flex items-center gap-2 font-bold text-sm text-[#F2782E] hover:gap-4 transition-all">
          {data.ctaLabel}
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {data.cards.map(c => (
          <div key={c.label} className="bg-white border border-[#E8E5E0] rounded-2xl p-7 hover:border-[#F2782E] hover:-translate-y-1 transition-all duration-200">
            <div className="text-[11px] font-bold tracking-widest text-[#F2782E] uppercase mb-2.5">{c.label}</div>
            <h4 className="text-base font-bold mb-2">{c.title}</h4>
            <p className="text-sm text-[#6B6F76]">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HomePage() {
  const { word, phase } = useKineticWord();
  const [activeTab, setActiveTab] = useState('software');
  const projects = useProjects(6);
  const [heroRef, heroVisible] = useInView(0.1);
  const [statsRef, statsVisible] = useInView(0.2);
  const [servicesRef, servicesVisible] = useInView(0.1);
  const [cyberRef, cyberVisible] = useInView(0.1);
  const [workRef, workVisible] = useInView(0.1);
  const [ctaRef, ctaVisible] = useInView(0.1);

  return (
    <div className="bg-white text-[#0E0E0F] overflow-x-hidden">
      <SEO
        title="Kreatix Technologies — Software, Cybersecurity & Cloud"
        description="Kreatix Technologies architects software and secures infrastructure for organisations that demand rigorous engineering and inventive design."
        schemas={[organizationSchema, websiteSchema]}
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="min-h-screen bg-[#0E0E0F] text-white flex flex-col justify-center px-6 md:px-12 pt-28 pb-24 relative overflow-hidden"
      >
        {/* grid bg */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%,black,transparent)',
          }}
        />
        {/* glows */}
        <div className="absolute -top-32 -right-20 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(242,120,46,0.18) 0%,transparent 65%)' }} />
        <div className="absolute -bottom-40 -left-10 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(242,120,46,0.08) 0%,transparent 65%)' }} />

        <div className={`relative z-10 max-w-6xl mx-auto w-full fade-in-up ${heroVisible ? 'visible' : ''}`}>
          {/* eyebrow */}
          <div className="inline-flex items-center gap-2.5 text-[#F2782E] text-xs font-bold tracking-[0.14em] uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2782E] shadow-[0_0_10px_#F2782E]" />
            Innovation meets creativity
          </div>

          {/* headline */}
          <h1 className="text-[clamp(52px,8vw,96px)] font-extrabold leading-[1.0] tracking-tight mb-0">
            <span className="block">
              We{' '}
              <span
                className="text-[#F2782E] inline-block transition-all duration-300"
                style={{ opacity: phase === 'out' ? 0 : 1, transform: phase === 'out' ? 'translateY(-20px)' : 'translateY(0)' }}
              >{word}</span>
            </span>
            <span className="block">software that</span>
            <span className="block">moves <em className="not-italic text-[#F2782E]">business</em></span>
            <span className="block">forward.</span>
          </h1>

          {/* body row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-14 items-end">
            <p className="text-[18px] leading-[1.75]" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Kreatix Technologies architects software and secures infrastructure for organisations that demand both rigorous engineering and inventive design — across software development, cybersecurity and cloud.
            </p>
            <div className="flex flex-col gap-4 md:items-end">
              <Link to="/portal/login"
                className="inline-flex items-center gap-2.5 bg-[#F2782E] text-white px-9 py-[18px] rounded-full font-bold text-[15px] transition-all hover:bg-[#D9601A] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(242,120,46,0.35)] whitespace-nowrap">
                Request a VAPT assessment →
              </Link>
              <Link to="/portfolio"
                className="inline-flex items-center gap-2.5 border text-white px-9 py-[18px] rounded-full font-bold text-[15px] transition-all hover:bg-white/5 whitespace-nowrap"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                View our work
              </Link>
            </div>
          </div>
        </div>

        {/* pills row */}
        <div className="absolute bottom-10 left-6 md:left-12 right-6 md:right-12 flex gap-3 flex-wrap z-10">
          {['Zero-trust architecture', 'Custom software', 'Cloud infrastructure', 'Penetration testing', 'API security'].map(p => (
            <div key={p} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2782E]" />{p}
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2.5 text-[11px] font-bold tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.3)' }}>Scroll ↓</div>
        </div>
      </section>

      {/* ── MARQUEE ────────────────────────────────────────────────────────── */}
      <div className="border-b border-[#E8E5E0] overflow-hidden py-[22px] bg-white">
        <div className="flex gap-4 w-max" style={{ animation: 'marquee-scroll 35s linear infinite' }}
          onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
          onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}>
          {MARQUEE_DOUBLED.map((item, i) => (
            <div key={i}
              className="flex-none rounded-[10px] px-7 py-3.5 text-[11px] font-bold tracking-widest uppercase whitespace-nowrap"
              style={{
                border: `1.5px dashed ${item.hi ? '#F2782E' : '#E8E5E0'}`,
                color: item.hi ? '#F2782E' : '#0E0E0F',
                background: 'white',
              }}>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS STRIP ────────────────────────────────────────────────────── */}
      <div ref={statsRef} className="bg-[#F2782E] py-14 px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { target: 120, suffix: '+', label: 'Projects delivered' },
          { target: 40,  suffix: '+', label: 'Security assessments' },
          { target: null, display: '99.9%', label: 'Client uptime SLA' },
          { target: 5,   suffix: '+', label: 'Years of excellence' },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <div className="font-extrabold text-white leading-none" style={{ fontSize: 'clamp(40px,5vw,60px)' }}>
              {statsVisible
                ? s.target != null
                  ? <Counter target={s.target} suffix={s.suffix} />
                  : s.display
                : s.target != null ? `0${s.suffix}` : s.display}
            </div>
            <div className="text-sm font-semibold mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── SERVICES ───────────────────────────────────────────────────────── */}
      <section ref={servicesRef} className="py-24 px-6 md:px-12 bg-[#F7F5F2]" id="services">
        <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#F2782E] block mb-5">What we do</span>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-start mb-14 fade-in-up ${servicesVisible ? 'visible' : ''}`}>
          <h2 className="font-extrabold leading-[1.1]" style={{ fontSize: 'clamp(34px,5vw,56px)' }}>
            Three disciplines,<br />one team
          </h2>
          <p className="text-[17px] text-[#6B6F76] leading-[1.75] pt-2 max-w-[44ch]">
            From the first line of code to the systems that keep it safe and running — we cover the full lifecycle. Pick a discipline to explore.
          </p>
        </div>

        {/* tabs */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-7 py-3 rounded-full font-bold text-sm border-[1.5px] transition-all duration-200 cursor-pointer"
              style={{
                background: activeTab === t.key ? '#0E0E0F' : 'transparent',
                color: activeTab === t.key ? '#fff' : '#6B6F76',
                borderColor: activeTab === t.key ? '#0E0E0F' : '#E8E5E0',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {Object.entries(SERVICE_PANELS).map(([key, data]) => (
          <ServicePanel key={key} data={data} active={activeTab === key} />
        ))}
      </section>

      {/* ── CYBERSECURITY ──────────────────────────────────────────────────── */}
      <section ref={cyberRef} className="py-24 px-6 md:px-12 bg-[#0E0E0F] text-white" id="cyber">
        <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#F2782E] block mb-5">Cybersecurity services</span>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-start mb-14 fade-in-up ${cyberVisible ? 'visible' : ''}`}>
          <h2 className="font-extrabold leading-[1.1]" style={{ fontSize: 'clamp(34px,5vw,56px)' }}>
            Find the gaps.<br />Close them.<br />Watch what's left.
          </h2>
          <p className="text-[17px] leading-[1.75] pt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
            A layered set of services covering assessment, detection and ongoing protection — tailored to your environment and threat profile.
          </p>
        </div>

        {/* cyber cards 2×2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {[
            { abbr: 'VA', title: 'Vulnerability assessment & pen testing', body: 'Scoped, methodical testing of your systems — web apps, APIs, networks, cloud — with clear, actionable reporting you can act on immediately.' },
            { abbr: 'TD', title: 'Threat detection & response',            body: 'EDR, XDR and MDR services that monitor your environment around the clock and respond to threats as they emerge — not after the damage is done.' },
            { abbr: 'EM', title: 'Endpoint management',                    body: 'Centralised visibility and control across laptops, servers and devices — patched, configured and compliant with your policies.' },
            { abbr: 'AS', title: 'API security',                           body: 'Discovery, testing and continuous protection for the APIs connecting your services, partners and customers.' },
          ].map(c => (
            <div key={c.abbr}
              className="rounded-[20px] p-8 border transition-all duration-200 hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(242,120,46,0.08)'; e.currentTarget.style.borderColor = 'rgba(242,120,46,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center font-extrabold text-[12px] text-[#F2782E] mb-5"
                style={{ background: 'rgba(242,120,46,0.15)', border: '1px solid rgba(242,120,46,0.25)' }}>
                {c.abbr}
              </div>
              <h4 className="text-lg font-bold mb-2.5">{c.title}</h4>
              <p className="text-sm leading-[1.65]" style={{ color: 'rgba(255,255,255,0.45)' }}>{c.body}</p>
            </div>
          ))}
        </div>

        {/* VAPT flow */}
        <div className="rounded-3xl p-10 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
          style={{ background: 'linear-gradient(135deg,rgba(242,120,46,0.12),rgba(242,120,46,0.03))', border: '1px solid rgba(242,120,46,0.25)' }}>
          <div>
            <h3 className="font-extrabold leading-[1.2] mb-3.5" style={{ fontSize: 'clamp(22px,3vw,30px)' }}>
              Submit your VAPT scope in one guided flow
            </h3>
            <p className="text-[15px] leading-[1.7] mb-7" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Tell us what you need assessed and upload supporting documents — network diagrams, IP ranges, NDAs. Our team reviews, scopes and responds, with every update and deliverable shared back through the same thread.
            </p>
            <Link to="/portal/login"
              className="inline-flex items-center gap-2.5 bg-[#F2782E] text-white px-8 py-4 rounded-full font-bold text-[15px] transition-all hover:bg-[#D9601A] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(242,120,46,0.35)]">
              Start a VAPT request →
            </Link>
          </div>
          <div className="flex flex-col">
            {[
              { n: 1, title: 'Submit scope & documents',              sub: 'Target IPs, domains, environment details, NDAs' },
              { n: 2, title: 'Team reviews & scopes engagement',      sub: 'We confirm scope, timeline and rules of engagement' },
              { n: 3, title: 'Testing & live status updates',         sub: 'Active testing with real-time progress in your portal' },
              { n: 4, title: 'Report & remediation guidance delivered', sub: 'Full findings with risk ratings and fix recommendations' },
            ].map((s, i, arr) => (
              <div key={s.n} className="flex items-start gap-4 py-4.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div className="w-7 h-7 rounded-full bg-[#F2782E] flex items-center justify-center font-extrabold text-xs text-white flex-shrink-0 mt-0.5">{s.n}</div>
                <div>
                  <strong className="block text-[15px] font-bold mb-1">{s.title}</strong>
                  <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORK ───────────────────────────────────────────────────────────── */}
      <section ref={workRef} className="py-24 pl-6 md:pl-12 pr-0 bg-white overflow-hidden" id="work">
        <div className={`flex justify-between items-end mb-12 pr-6 md:pr-12 fade-in-up ${workVisible ? 'visible' : ''}`}>
          <div>
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#F2782E] block mb-4">Selected work</span>
            <h2 className="font-extrabold" style={{ fontSize: 'clamp(34px,5vw,56px)' }}>Things we've shipped</h2>
          </div>
          <Link to="/portfolio" className="text-sm font-bold text-[#F2782E] flex items-center gap-1.5 flex-shrink-0 hover:gap-3 transition-all">
            View all →
          </Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 pr-6 md:pr-12" style={{ scrollbarWidth: 'none' }}>
          {projects.map(p => <WorkCard key={p.id || p.title} {...p} />)}
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <Testimonials />

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section ref={ctaRef} className="bg-[#0E0E0F] py-28 px-6 md:px-12 text-center relative overflow-hidden" id="contact">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(ellipse,rgba(242,120,46,0.2),transparent 70%)' }} />
        <div className={`relative z-10 fade-in-up ${ctaVisible ? 'visible' : ''}`}>
          <h2 className="font-extrabold text-white leading-[1.05] max-w-[16ch] mx-auto mb-6"
            style={{ fontSize: 'clamp(36px,6vw,72px)' }}>
            Ready to build <em className="not-italic text-[#F2782E]">something</em> great?
          </h2>
          <p className="text-[17px] max-w-[44ch] mx-auto mb-11 leading-[1.7]"
            style={{ color: 'rgba(255,255,255,0.45)' }}>
            Whether you need a new product built, your infrastructure secured, or your cloud optimised — let's talk.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/contact"
              className="inline-flex items-center gap-2.5 bg-[#F2782E] text-white px-9 py-[18px] rounded-full font-bold text-[15px] transition-all hover:bg-[#D9601A] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(242,120,46,0.35)]">
              Start a project →
            </Link>
            <Link to="/portal/login"
              className="inline-flex items-center gap-2.5 text-white px-9 py-[18px] rounded-full font-bold text-[15px] transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              Request VAPT assessment
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
