import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Code2, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

const API_BASE = import.meta.env.VITE_API_URL || 'https://kreatixtech.fly.dev';

export default function PortfolioPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/projects`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

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
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 text-coral-500 animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-24">
              <Code2 className="h-10 w-10 text-ink-300 mx-auto mb-4" />
              <p className="text-ink-400 text-lg">Projects coming soon.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {projects.map(p => (
                <div key={p.id} className="card flex flex-col hover:shadow-lg transition-shadow bg-white overflow-hidden">
                  {p.previewUrl && (
                    <div className="h-48 overflow-hidden border-b border-surface-200">
                      <img
                        src={p.previewUrl}
                        alt={p.title}
                        className="w-full h-full object-cover object-top"
                        onError={e => { e.target.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-200 border border-surface-300 flex items-center justify-center">
                          <Code2 size={16} className="text-coral-500" />
                        </div>
                        {p.featured && <span className="tag-coral text-[10px]">Featured</span>}
                        {p.category && <span className="tag text-[10px]">{p.category}</span>}
                      </div>
                      {p.liveUrl && (
                        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-medium text-coral-500 hover:text-coral-600 transition-colors">
                          View Live <ArrowUpRight size={13} />
                        </a>
                      )}
                    </div>
                    <h3 className="text-ink-900 font-bold text-xl mb-3">{p.title}</h3>
                    <p className="text-ink-500 text-sm leading-relaxed flex-1 mb-6">{p.description}</p>
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {(p.tags || []).map(t => (
                          <span key={t} className="tag text-[11px]">{t}</span>
                        ))}
                      </div>
                      {p.year && <span className="text-xs text-ink-400">{p.year}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 border-t border-surface-300 bg-surface-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-black tracking-tight text-ink-900 mb-6">
            Ready to build something exceptional?
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary text-sm">Start a Project</Link>
            <Link to="/portal/login" className="btn-outline text-sm">Client Portal</Link>
          </div>
        </div>
      </section>

      <SEO
        title="Portfolio"
        description="Explore our portfolio of custom software projects — SaaS platforms, healthcare systems, logistics dashboards, and enterprise solutions."
        keywords="software portfolio, case studies, SaaS projects, web applications, custom software examples"
        pathname="/portfolio"
      />
    </div>
  );
}