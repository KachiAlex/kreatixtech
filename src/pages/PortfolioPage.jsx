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
    <div className="bg-surface-50 text-ink-900 min-h-screen">
      <section className="pt-32 pb-24 border-b border-surface-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-coral-500 text-xs font-semibold uppercase tracking-widest mb-6">Portfolio</p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-8">
            Our Work.
          </h1>
          <p className="text-ink-500 text-lg max-w-xl leading-relaxed">
            A selection of platforms, applications, and security architectures we have engineered
            for innovative organizations globally.
          </p>
        </div>
      </section>
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-5">
            {allProjects.map(({ id, title, desc, tags, href, external, featured }) => (
              <div key={id} className="card p-8 flex flex-col hover:shadow-lg transition-shadow bg-white">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-200 border border-surface-300 flex items-center justify-center">
                      <Code2 size={16} className="text-coral-500" />
                    </div>
                    {featured && <span className="tag-coral text-[10px]">Featured</span>}
                  </div>
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-coral-500 hover:text-coral-600 transition-colors">
                      View Live Platform <ArrowUpRight size={13} />
                    </a>
                  ) : href !== '#' ? (
                    <Link to={href} className="flex items-center gap-1.5 text-xs font-medium text-ink-400 hover:text-ink-900 transition-colors">
                      View Project <ArrowUpRight size={13} />
                    </Link>
                  ) : null}
                </div>
                <h3 className="text-ink-900 font-bold text-xl mb-3">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed flex-1 mb-6">{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => <span key={t} className="tag text-[11px]">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 border-t border-surface-300 bg-surface-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-black tracking-tight text-ink-900 mb-6">
            Ready to build something exceptional?
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary text-sm">Start a Project</Link>
            <Link to="/portal/vapt-request" className="btn-outline text-sm">Request VAPT</Link>
          </div>
        </div>
      </section>
    </div>
  );
}