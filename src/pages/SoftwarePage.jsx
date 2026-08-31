import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2, Monitor, Smartphone, Server, Database, GitBranch,
  Zap, CheckCircle2, ArrowRight, Layers, RefreshCw,
  Shield, Cpu, BarChart3
} from 'lucide-react';
import SEO from '../components/SEO';

const services = [
  {
    icon: Monitor,
    title: 'Web Application Development',
    description: 'Custom, responsive web applications built with React, Vue, Angular, and modern backend frameworks — designed for performance, scalability, and great user experience.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    stack: ['React / Next.js', 'Vue / Nuxt', 'Node.js / Express', 'Django / FastAPI', 'PostgreSQL / MongoDB'],
  },
  {
    icon: Smartphone,
    title: 'Mobile App Development',
    description: 'Cross-platform and native iOS/Android applications with seamless UX, offline capability, push notifications, and deep integration with your backend systems.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    stack: ['React Native', 'Flutter', 'Swift (iOS)', 'Kotlin (Android)', 'Firebase'],
  },
  {
    icon: Server,
    title: 'API & Backend Development',
    description: 'Robust, secure REST and GraphQL APIs, microservices architectures, and backend systems that power your applications with reliability and speed.',
    color: 'text-accent-400',
    bg: 'bg-accent-500/10',
    stack: ['Node.js', 'Python / FastAPI', 'Go', 'GraphQL', 'gRPC'],
  },
  {
    icon: Database,
    title: 'SaaS Platform Development',
    description: 'Full-stack SaaS products built with multi-tenancy, subscription billing, analytics dashboards, and the infrastructure to scale from 10 to 10 million users.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    stack: ['Multi-tenant Architecture', 'Stripe Billing', 'Analytics', 'SSO / Auth', 'Kubernetes'],
  },
  {
    icon: BarChart3,
    title: 'Data & Analytics Platforms',
    description: 'Business intelligence dashboards, data pipelines, and analytics platforms that transform raw data into actionable insights for smarter decision-making.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    stack: ['Python / Pandas', 'Apache Kafka', 'Elasticsearch', 'Power BI', 'Grafana'],
  },
  {
    icon: RefreshCw,
    title: 'Legacy Modernisation',
    description: 'Migrate, refactor, and modernise legacy applications with minimal disruption. We bring outdated systems up to modern standards without losing business continuity.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    stack: ['Microservices Migration', 'Database Migration', 'API-first Refactor', 'CI/CD Setup', 'Testing & QA'],
  },
];

const process = [
  { step: '01', title: 'Discovery & Planning', desc: 'Requirements gathering, technical feasibility, architecture planning, and project roadmap.' },
  { step: '02', title: 'Design & Prototype', desc: 'UI/UX wireframes, interactive prototypes, and design system alignment before development begins.' },
  { step: '03', title: 'Agile Development', desc: 'Sprint-based development with bi-weekly demos, transparent progress tracking, and iterative delivery.' },
  { step: '04', title: 'Testing & QA', desc: 'Automated testing, manual QA, security scanning, and performance testing before any release.' },
  { step: '05', title: 'Deployment & Launch', desc: 'CI/CD pipeline setup, containerized deployments, monitoring, and smooth production launch.' },
  { step: '06', title: 'Support & Growth', desc: 'Post-launch support, feature iteration, performance optimization, and long-term partnership.' },
];

export default function SoftwarePage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/15 via-transparent to-purple-900/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6">
              <Code2 size={14} />
              Software Development
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              We Build Software
              <br />
              <span className="gradient-text">That Scales</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mb-10">
              From MVPs to enterprise platforms, our engineering team delivers clean, 
              performant, and secure software — on time and on budget.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/portfolio" className="btn-primary">
                View Our Portfolio <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn-secondary">
                Start a Project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">
              What We <span className="gradient-text">Build</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Full-spectrum software development capabilities — from frontend to infrastructure.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="glass-card border border-white/5 hover:border-brand-500/20 p-6 transition-all hover:shadow-xl group">
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <s.icon size={22} className={s.color} />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{s.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.stack.map((tech) => (
                    <span key={tech} className={`text-xs px-2 py-0.5 rounded-md ${s.bg} ${s.color} border border-current border-opacity-20`}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-dark-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">
              Our <span className="gradient-text">Process</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A proven six-step process that keeps projects on track and delivers quality consistently.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((item) => (
              <div key={item.step} className="glass-card border border-white/5 p-6 relative">
                <span className="text-5xl font-black text-white/5 absolute top-4 right-5 leading-none">{item.step}</span>
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
                  <span className="text-brand-400 font-bold text-sm">{item.step}</span>
                </div>
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack badges */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm mb-6 uppercase tracking-widest">Technologies We Work With</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'React', 'Next.js', 'Vue.js', 'Node.js', 'Python', 'Go', 'TypeScript',
              'React Native', 'Flutter', 'PostgreSQL', 'MongoDB', 'Redis',
              'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform',
              'GraphQL', 'REST', 'gRPC', 'WebSockets'
            ].map((tech) => (
              <span key={tech} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:border-brand-500/40 hover:text-brand-300 transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card border border-brand-500/20 p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-accent-500/5" />
            <div className="relative">
              <Zap size={36} className="text-brand-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-4">
                Have a Project in Mind?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Tell us about your idea and we'll help you turn it into a polished, production-ready product.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/contact" className="btn-primary text-base px-10 py-4">
                  Start a Project <ArrowRight size={16} />
                </Link>
                <Link to="/portfolio" className="btn-secondary text-base px-10 py-4">
                  View Portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SEO
        title="Software Development"
        description="Custom web applications, mobile apps, enterprise SaaS platforms, and legacy modernization from Kreatix Technologies."
        keywords="software development, web applications, mobile apps, SaaS, React, Next.js, Node.js, custom software"
        pathname="/services/software"
      />
    </div>
  );
}
