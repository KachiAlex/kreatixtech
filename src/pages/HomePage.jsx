import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Code2, Cloud, ArrowRight, CheckCircle2, Zap, Globe, Lock,
  TrendingUp, Users, Award, ChevronRight, Play, Star, Layers,
  Cpu, Database, GitBranch
} from 'lucide-react';

const services = [
  {
    icon: Shield,
    title: 'Cybersecurity',
    description: 'Comprehensive security solutions including VAPT, threat detection (EDR/XDR/MDR), endpoint management, and API security.',
    href: '/cybersecurity',
    color: 'from-red-500/20 to-orange-500/10',
    iconColor: 'text-red-400',
    border: 'hover:border-red-500/30',
    features: ['VAPT', 'EDR / XDR / MDR', 'Endpoint Management', 'API Security'],
  },
  {
    icon: Code2,
    title: 'Software Development',
    description: 'Custom web and mobile applications built with modern frameworks, delivering scalable, high-performance digital products.',
    href: '/software',
    color: 'from-brand-500/20 to-purple-500/10',
    iconColor: 'text-brand-400',
    border: 'hover:border-brand-500/30',
    features: ['Web Applications', 'Mobile Apps', 'SaaS Platforms', 'API Development'],
  },
  {
    icon: Cloud,
    title: 'Cloud Services',
    description: 'Multi-cloud architecture, DevOps automation, infrastructure management and optimization for your digital transformation.',
    href: '/cloud',
    color: 'from-accent-500/20 to-blue-500/10',
    iconColor: 'text-accent-400',
    border: 'hover:border-accent-500/30',
    features: ['Cloud Migration', 'DevOps & CI/CD', 'Infrastructure as Code', 'Cost Optimization'],
  },
];

const stats = [
  { value: '150+', label: 'Projects Delivered', icon: Award },
  { value: '80+', label: 'Happy Clients', icon: Users },
  { value: '99.9%', label: 'Uptime SLA', icon: TrendingUp },
  { value: '5+', label: 'Years Experience', icon: Star },
];

const techStack = [
  { name: 'React', icon: Layers },
  { name: 'Node.js', icon: Cpu },
  { name: 'Python', icon: Database },
  { name: 'AWS', icon: Cloud },
  { name: 'Kubernetes', icon: GitBranch },
  { name: 'PostgreSQL', icon: Database },
];

function FloatingOrb({ className }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 animate-pulse-slow pointer-events-none ${className}`}
    />
  );
}

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20">
        <FloatingOrb className="w-[600px] h-[600px] bg-brand-600 -top-32 -left-32" />
        <FloatingOrb className="w-[400px] h-[400px] bg-accent-500 top-1/2 right-0" />
        <FloatingOrb className="w-[300px] h-[300px] bg-purple-600 bottom-0 left-1/3" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6">
                <Zap size={14} className="text-brand-400" />
                Innovation meets Creativity
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
                We Build{' '}
                <span className="relative">
                  <span className="gradient-text">Dynamic</span>
                </span>
                <br />
                Digital Solutions
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">
                Kreatix Technologies delivers cutting-edge Software Development, Cybersecurity, 
                and Cloud Services — empowering businesses to innovate fearlessly.
              </p>
              <div className="flex flex-wrap gap-4 mb-12">
                <Link to="/vapt" className="btn-primary text-base px-8 py-4">
                  Get Security Assessment
                  <ArrowRight size={18} />
                </Link>
                <Link to="/portfolio" className="btn-secondary text-base px-8 py-4">
                  <Play size={16} className="text-brand-400" />
                  View Our Work
                </Link>
              </div>
              <div className="flex flex-wrap gap-6">
                {['ISO 27001 Aligned', 'OWASP Standards', '24/7 Support'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle2 size={15} className="text-green-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating card cluster */}
            <div className="relative hidden lg:flex items-center justify-center h-[520px]">
              {/* Central card */}
              <div className="absolute glass-card p-6 w-72 shadow-2xl shadow-brand-900/30 glow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                    <Shield size={20} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Security Scan Complete</p>
                    <p className="text-gray-500 text-xs">2 minutes ago</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Vulnerabilities Found', value: '0 Critical', color: 'text-green-400' },
                    { label: 'Endpoints Secured', value: '247 / 247', color: 'text-accent-400' },
                    { label: 'Threat Level', value: 'Low', color: 'text-green-400' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-xs">
                      <span className="text-gray-400">{item.label}</span>
                      <span className={`font-semibold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-1.5 bg-dark-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-accent-400 rounded-full" style={{ width: '92%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">Security Score: 92/100</p>
              </div>

              {/* Top-right card */}
              <div className="absolute top-8 right-4 glass-card p-4 w-52 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Code2 size={16} className="text-brand-400" />
                  <span className="text-sm font-semibold text-white">App Deployed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400">Production Live</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">99.99% uptime last 30d</p>
              </div>

              {/* Bottom-left card */}
              <div className="absolute bottom-12 left-0 glass-card p-4 w-56 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud size={16} className="text-accent-400" />
                  <span className="text-sm font-semibold text-white">Cloud Infra</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-2">
                  {['AWS', 'GCP', 'Azure'].map((c) => (
                    <div key={c} className="text-center py-1 rounded bg-white/5 text-xs text-gray-400">{c}</div>
                  ))}
                </div>
              </div>

              {/* Decorative orbit */}
              <div className="absolute w-80 h-80 border border-brand-500/10 rounded-full animate-spin-slow" />
              <div className="absolute w-96 h-96 border border-accent-500/5 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5 bg-dark-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                    <Icon size={22} className="text-brand-400" />
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-black gradient-text mb-1">{value}</p>
                <p className="text-gray-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-4">
              <Globe size={14} />
              What We Do
            </div>
            <h2 className="section-title">
              Our <span className="gradient-text">Services</span>
            </h2>
            <p className="section-subtitle mx-auto">
              End-to-end technology solutions crafted to secure, scale, and accelerate your business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.href}
                to={service.href}
                className={`glass-card p-8 border border-white/5 ${service.border} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-dark-500 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <service.icon size={26} className={service.iconColor} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                        <ChevronRight size={14} className={service.iconColor} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className={`flex items-center gap-2 text-sm font-semibold ${service.iconColor} group-hover:gap-3 transition-all`}>
                    Learn More <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About / Why Us */}
      <section className="py-24 bg-dark-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-500/30 bg-accent-500/10 text-accent-300 text-sm font-medium mb-6">
                <Zap size={14} />
                Why Kreatix Technologies
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Innovation{' '}
                <span className="gradient-text">Meets</span>
                <br />
                Expertise
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                We're not just a tech company — we're your strategic partner. Our multidisciplinary 
                team combines deep technical expertise with creative thinking to deliver solutions 
                that don't just work today, but scale for tomorrow.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Security-First Approach', desc: 'Every solution we build is designed with security as a foundation, not an afterthought.' },
                  { title: 'Agile & Transparent', desc: 'Regular updates, collaborative tools, and clear communication at every step.' },
                  { title: 'Proven Track Record', desc: '150+ successful projects across industries, from startups to enterprise.' },
                  { title: 'Dedicated Support', desc: '24/7 monitoring and support to keep your systems running at peak performance.' },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex gap-4 p-4 glass-card border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 size={16} className="text-brand-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm mb-0.5">{title}</p>
                      <p className="text-gray-400 text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-6 border border-white/5">
                <p className="text-gray-300 italic text-lg leading-relaxed mb-4">
                  "Kreatix Technologies transformed our security posture completely. Their VAPT 
                  assessment uncovered critical vulnerabilities we never knew existed, and their 
                  team guided us through every remediation step."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center font-bold text-white">A</div>
                  <div>
                    <p className="text-white font-semibold text-sm">Adaeze Okonkwo</p>
                    <p className="text-gray-500 text-xs">CTO, FinTech Nigeria Ltd</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {techStack.slice(0, 4).map(({ name, icon: Icon }) => (
                  <div key={name} className="glass-card p-4 border border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
                      <Icon size={16} className="text-brand-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-300">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative glass-card border border-brand-500/20 p-12 md:p-16 text-center overflow-hidden">
            <FloatingOrb className="w-96 h-96 bg-brand-600 -top-20 left-1/4 opacity-10" />
            <FloatingOrb className="w-64 h-64 bg-accent-500 -bottom-10 right-1/4 opacity-10" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6">
                <Lock size={14} />
                Start Your Security Journey
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Ready to{' '}
                <span className="gradient-text">Secure & Scale</span>
                <br />
                Your Business?
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
                Get a free consultation with our experts. We'll assess your needs and propose 
                a tailored roadmap to elevate your digital capabilities.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/vapt" className="btn-primary text-base px-10 py-4">
                  Request VAPT Assessment
                  <ArrowRight size={18} />
                </Link>
                <Link to="/contact" className="btn-secondary text-base px-10 py-4">
                  Talk to an Expert
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
