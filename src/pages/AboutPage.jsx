import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const values = [
  { title: 'Creative Rigor', body: 'We apply imaginative problem-solving to highly technical, structured environments.' },
  { title: 'Absolute Security', body: 'Trust is our currency. We build systems designed to withstand the most advanced threats.' },
  { title: 'Long-Term Partnership', body: "We don't just deliver code; we provide ongoing strategic support and evolution." },
];

const process = [
  { num: '01', title: 'Assess',    body: 'Deep analysis of your current architecture and security posture.' },
  { num: '02', title: 'Architect', body: 'Designing scalable, resilient systems with security built-in from day one.' },
  { num: '03', title: 'Execute',   body: 'Agile, precise development cycles with continuous integration.' },
  { num: '04', title: 'Evolve',    body: 'Ongoing monitoring, proactive threat hunting, and system scaling.' },
];

export default function AboutPage() {
  return (
    <div className="bg-surface-50 text-ink-900 min-h-screen">
      <section className="pt-32 pb-24 border-b border-surface-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-coral-500 text-xs font-semibold uppercase tracking-widest mb-6">About</p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-8">
            Innovation via<br />creativity.
          </h1>
          <p className="text-ink-500 text-lg max-w-2xl leading-relaxed">
            At Kreatix Technologies, we believe that the most secure and robust systems are born
            from unconventional thinking. We are addicted to innovation, blending the rigorous
            discipline of cybersecurity with the boundless creativity of software craftsmanship.
          </p>
        </div>
      </section>
      <section className="py-24 border-b border-surface-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-coral-500 text-xs font-semibold uppercase tracking-widest mb-10">Core Values.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {values.map(({ title, body }) => (
              <div key={title} className="card p-8 bg-white">
                <h3 className="text-ink-900 font-bold text-lg mb-3">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-coral-500 text-xs font-semibold uppercase tracking-widest mb-10">Our Process.</p>
          <div className="grid md:grid-cols-2 gap-px bg-surface-300">
            {process.map(({ num, title, body }) => (
              <div key={num} className="bg-surface-50 p-10 hover:bg-surface-100 transition-colors">
                <p className="text-surface-400 font-black text-5xl tracking-tighter mb-5">{num}.</p>
                <h3 className="text-ink-900 font-bold text-xl mb-3">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 border-t border-surface-300 bg-surface-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-black tracking-tight text-ink-900 mb-6">
            Work with us.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary text-sm">Start a Conversation <ArrowUpRight size={14} /></Link>
            <Link to="/portal/vapt-request" className="btn-outline text-sm">Request Assessment</Link>
          </div>
        </div>
      </section>
    </div>
  );
}