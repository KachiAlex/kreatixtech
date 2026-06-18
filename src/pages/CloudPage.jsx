import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cloud, Server, GitBranch, Shield, TrendingUp, Zap,
  ArrowRight, CheckCircle2, Database, RefreshCw,
  BarChart2, Lock, Cpu
} from 'lucide-react';

const services = [
  {
    icon: Cloud,
    title: 'Cloud Migration',
    description: 'Seamless migration of your on-premises workloads, legacy systems, and databases to AWS, GCP, or Azure with minimal downtime.',
    color: 'text-accent-400',
    bg: 'bg-accent-500/10',
    points: ['Lift-and-shift migrations', 'Re-platforming & re-architecting', 'Database migration', 'Zero-downtime cutover'],
  },
  {
    icon: GitBranch,
    title: 'DevOps & CI/CD',
    description: 'Accelerate your release cycles with robust CI/CD pipelines, GitOps workflows, containerization, and automated testing.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    points: ['GitHub Actions / GitLab CI', 'Jenkins & CircleCI', 'Docker & Kubernetes', 'GitOps with ArgoCD / Flux'],
  },
  {
    icon: Server,
    title: 'Infrastructure as Code',
    description: 'Manage and provision cloud infrastructure reproducibly and at scale using Terraform, Ansible, Pulumi, and CloudFormation.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    points: ['Terraform modules', 'Ansible automation', 'CloudFormation templates', 'Multi-environment IaC'],
  },
  {
    icon: Database,
    title: 'Managed Databases',
    description: 'Expert setup, tuning, and management of cloud-native databases with automated backups, HA clusters, and performance optimization.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    points: ['RDS / Aurora / Cloud SQL', 'Redis & ElastiCache', 'MongoDB Atlas', 'Database performance tuning'],
  },
  {
    icon: TrendingUp,
    title: 'Cost Optimization',
    description: 'FinOps consulting to right-size your cloud spend, identify waste, implement Reserved Instances, and maximize ROI.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    points: ['Cloud spend analysis', 'Reserved & Spot instances', 'Auto-scaling policies', 'Cost anomaly detection'],
  },
  {
    icon: BarChart2,
    title: 'Monitoring & Observability',
    description: 'Full-stack observability with logs, metrics, traces, and alerting — ensuring you know about issues before your users do.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    points: ['Prometheus & Grafana', 'ELK / OpenSearch Stack', 'Datadog / New Relic', 'Custom alerting & runbooks'],
  },
];

const providers = ['Amazon Web Services', 'Google Cloud Platform', 'Microsoft Azure', 'DigitalOcean', 'Cloudflare'];

export default function CloudPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-900/10 via-transparent to-brand-900/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-500/30 bg-accent-500/10 text-accent-300 text-sm font-medium mb-6">
              <Cloud size={14} />
              Cloud Services
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Cloud Infrastructure
              <br />
              <span className="text-accent-400">Built to Scale</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mb-10">
              From cloud migration to DevOps automation and cost optimization, 
              we help you harness the full power of the cloud — securely and efficiently.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact" className="btn-primary">
                Get Cloud Assessment <ArrowRight size={16} />
              </Link>
              <Link to="/cybersecurity" className="btn-secondary">
                Cloud Security →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Provider logos */}
      <section className="py-10 border-y border-white/5 bg-dark-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm mb-6 uppercase tracking-widest">Cloud Platforms We Support</p>
          <div className="flex flex-wrap justify-center gap-4">
            {providers.map((p) => (
              <div key={p} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-medium">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">
              Our Cloud <span className="gradient-text">Capabilities</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="glass-card border border-white/5 hover:border-accent-500/20 p-6 transition-all hover:shadow-xl group">
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <s.icon size={22} className={s.color} />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{s.description}</p>
                <ul className="space-y-2">
                  {s.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 size={13} className={s.color} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why cloud section */}
      <section className="py-16 bg-dark-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6">
                Cloud-Native by <span className="gradient-text">Design</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                We design cloud architectures that are inherently resilient, auto-scaling, 
                and cost-efficient. Whether you're a startup launching your first product 
                or an enterprise modernising legacy infrastructure, we tailor solutions 
                to your exact needs.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, title: 'Security First', desc: 'Every architecture follows zero-trust and least-privilege principles.' },
                  { icon: Zap, title: 'High Performance', desc: 'CDNs, edge computing, and auto-scaling for global performance.' },
                  { icon: RefreshCw, title: 'High Availability', desc: 'Multi-AZ deployments and failover for 99.99% uptime.' },
                  { icon: Lock, title: 'Compliance Ready', desc: 'GDPR, PCI DSS, ISO 27001 aligned configurations.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="glass-card border border-white/5 p-4">
                    <Icon size={18} className="text-accent-400 mb-2" />
                    <p className="text-white font-semibold text-sm mb-1">{title}</p>
                    <p className="text-gray-500 text-xs">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card border border-accent-500/20 p-8">
              <h3 className="text-white font-bold text-xl mb-6">Free Cloud Assessment</h3>
              <p className="text-gray-400 text-sm mb-6">
                Not sure where to start? We offer a free 30-minute cloud readiness assessment 
                to identify quick wins, cost savings, and a clear migration path.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Current infrastructure review',
                  'Cost optimization opportunities',
                  'Security posture evaluation',
                  'Cloud readiness scoring',
                  'Recommended roadmap',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 size={14} className="text-accent-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="btn-primary w-full justify-center">
                Book Free Assessment <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
