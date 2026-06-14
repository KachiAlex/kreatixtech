import React, { useState } from 'react';
import {
  Code2, ExternalLink, ChevronLeft, ChevronRight, X, Play,
  Tag, Calendar, ArrowRight, Layers, Star, Monitor, Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const categories = ['All', 'Web Application', 'Mobile Application', 'SaaS Platform'];

function DemoModal({ project, onClose }) {
  const [slide, setSlide] = useState(0);
  const images = project.demoImages || [];

  const prev = () => setSlide((s) => (s - 1 + images.length) % images.length);
  const next = () => setSlide((s) => (s + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-700 rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h3 className="text-white font-bold text-lg">{project.title}</h3>
            <span className="text-xs text-gray-500">{project.category}</span>
          </div>
          <div className="flex items-center gap-3">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs px-4 py-2"
              >
                <ExternalLink size={12} />
                Live Demo
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Demo content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {images.length > 0 && (
            <div className="relative bg-black">
              <img
                src={images[slide]}
                alt={`${project.title} screenshot ${slide + 1}`}
                className="w-full object-cover max-h-[480px]"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSlide(i)}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all',
                          i === slide ? 'bg-white w-6' : 'bg-white/40'
                        )}
                      />
                    ))}
                  </div>
                  <span className="absolute top-3 right-3 bg-black/50 rounded-full px-2.5 py-1 text-xs text-white">
                    {slide + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
          )}

          <div className="p-6">
            <p className="text-gray-300 leading-relaxed mb-6">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {(project.tags || []).map((tag) => (
                <span key={tag} className="badge bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, onClick }) {
  return (
    <div
      className="glass-card border border-white/5 hover:border-brand-500/30 overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
        {project.featured && (
          <div className="absolute top-3 left-3 badge bg-brand-500/20 text-brand-300 border border-brand-500/30">
            <Star size={10} className="fill-brand-400 text-brand-400" />
            Featured
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Play size={20} className="text-white fill-white ml-1" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-brand-400 font-medium">{project.category}</span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar size={10} />
            {project.year}
          </span>
        </div>
        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-brand-300 transition-colors">{project.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {(project.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/15">
              {tag}
            </span>
          ))}
          {(project.tags || []).length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-500">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const { projects } = useApp();
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);

  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/10 via-transparent to-accent-900/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6">
            <Code2 size={14} />
            Software Development Portfolio
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Our <span className="gradient-text">Work</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            From concept to deployment — explore the web apps, mobile applications, and platforms 
            we've built for clients across industries.
          </p>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-all',
                  filter === cat
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-900/40'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Layers size={40} className="mx-auto mb-4 opacity-50" />
              <p>No projects in this category yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services CTA */}
      <section className="py-16 bg-dark-800/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass-card border border-white/5 p-6">
              <Monitor size={28} className="text-brand-400 mb-3" />
              <h3 className="text-white font-bold mb-2">Web Development</h3>
              <p className="text-gray-400 text-sm mb-4">Custom web apps, portals, and platforms built with modern stacks.</p>
              <Link to="/software" className="btn-secondary text-sm justify-center">
                Learn More <ArrowRight size={14} />
              </Link>
            </div>
            <div className="glass-card border border-white/5 p-6">
              <Smartphone size={28} className="text-accent-400 mb-3" />
              <h3 className="text-white font-bold mb-2">Mobile Development</h3>
              <p className="text-gray-400 text-sm mb-4">iOS and Android apps with seamless UX and robust backends.</p>
              <Link to="/software" className="btn-secondary text-sm justify-center">
                Learn More <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      {selectedProject && (
        <DemoModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
