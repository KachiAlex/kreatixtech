import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Code2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const defaultProjects = [
  {
    id: 'caremaster',
    title: 'Caremaster',
    desc: 'A multi-tenant SaaS solution helping numerous care agencies manage operations, staff scheduling, and compliance securely.',
    tags: ['SaaS', 'Multi-tenant', 'Healthcare', 'React', 'Node.js'],
    href: 'https://getcaremaster.com',
    external: true,
    featured: true,
  },
  {
    id: 'propertyark',
    title: 'PropertyArk',
    desc: 'A multivendor Real Estate platform providing a secure ecosystem for property businesses and buyers globally.',
    tags: ['Marketplace', 'Real Estate', 'Security'],
    href: '#',
    external: false,
    featured: false,
  },
  {
    id: 'ojawa',
    title: 'Ojawa Africa',
    desc: 'A multivendor eCommerce application that guarantees secure transactions for buyers and sellers via an integrated escrow system.',
    tags: ['eCommerce', 'Escrow', 'Fintech'],
    href: '#',
    external: false,
    featured: false,
  },
  {
    id: 'checkoutpos',
    title: 'CheckoutPOS',
    desc: 'A smart Point of Sale application designed for Supermarkets, Restaurants, Pharmaceutical shops, and Retail Warehouses.',
    tags: ['POS', 'Retail', 'Desktop App'],
    href: '#',
    external: false,
    featured: false,
  },
];

export default function PortfolioPage() {
  const { projects } = useApp();

  const allProjects = [
    ...defaultProjects,
    ...projects.filter(p => !defaultProjects.find(d => d.id === p.id)),
  ];

  return (
    <div className="bg-ink-950 text-white min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-24 border-b border-ink-700">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <p className="text-teal-400 text-xs font-mono uppercase tracking-widest mb-6">Portfolio</p>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none mb-8 text-white">
            Our Work.
          </h1>
          <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
            A selection of platforms, applications, and security architectures we have engineered
            for innovative organizations globally.
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-4">
            {allProjects.map(({ id, title, desc, tags, href, external, featured }) => (
              <div key={id} className="card p-8 flex flex-col hover:border-ink-500 transition-colors group">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-ink-700 border border-ink-600 flex items-center justify-center">
                      <Code2 size={16} className="text-teal-400" />
                    </div>
                    {featured && (
                      <span className="tag-teal text-[10px]">Featured</span>
                    )}
                  </div>
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors">
                      View Live Platform <ArrowUpRight size={13} />
                    </a>
                  ) : href !== '#' ? (
                    <Link to={href} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors">
                      View Project <ArrowUpRight size={13} />
                    </Link>
                  ) : null}
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-6">{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => <span key={t} className="tag text-[11px]">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-ink-700 bg-ink-900">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight text-white mb-6">
            Ready to build something exceptional?
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/contact" className="btn-teal text-sm">Start a Project</Link>
            <Link to="/portal/vapt-request" className="btn-outline text-sm">Request VAPT</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
