import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Target, Heart, Users, Award, TrendingUp, ArrowRight, CheckCircle2, Star
} from 'lucide-react';

const team = [
  { name: 'Emeka Obi', role: 'CEO & Co-Founder', bio: 'Visionary technologist with 12+ years driving digital transformation across Africa and Europe.', initials: 'EO', gradient: 'from-brand-500 to-purple-600' },
  { name: 'Chidinma Adeyemi', role: 'CTO & Co-Founder', bio: 'Full-stack architect and cloud infrastructure expert who leads our engineering excellence.', initials: 'CA', gradient: 'from-accent-500 to-brand-600' },
  { name: 'Tunde Fashola', role: 'Head of Cybersecurity', bio: 'OSCP-certified penetration tester and security architect with a decade of VAPT experience.', initials: 'TF', gradient: 'from-red-500 to-orange-500' },
  { name: 'Ngozi Eze', role: 'Head of Cloud Services', bio: 'AWS Solutions Architect and DevOps practitioner specialising in cloud-native transformations.', initials: 'NE', gradient: 'from-green-500 to-accent-600' },
];

const values = [
  { icon: Zap, title: 'Innovation', desc: 'We embrace emerging technologies and creative thinking to solve problems in new ways.' },
  { icon: Heart, title: 'Client-Centric', desc: 'Your success is our success. We align our goals with yours and go the extra mile.' },
  { icon: Target, title: 'Excellence', desc: 'We hold ourselves to the highest standards of quality, security, and reliability.' },
  { icon: Users, title: 'Collaboration', desc: 'We work as true partners — transparent, communicative, and genuinely invested.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/10 via-transparent to-accent-900/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6">
              <Zap size={14} />
              About Kreatix Technologies
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Building the Future,<br />
              <span className="gradient-text">One Solution at a Time</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
              Kreatix Technologies is a dynamic IT company based in Lagos, Nigeria, 
              committed to delivering innovative software development, cybersecurity, 
              and cloud solutions that empower businesses to thrive in the digital age.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-dark-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6">Our <span className="gradient-text">Story</span></h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Founded in 2019, Kreatix Technologies was born from a simple belief: 
                  that world-class technology solutions shouldn't be the exclusive domain 
                  of large corporations. We set out to bring enterprise-grade software, 
                  security, and cloud capabilities to businesses of all sizes.
                </p>
                <p>
                  What started as a small web development agency quickly evolved into a 
                  comprehensive IT solutions provider. As we helped our clients grow digitally, 
                  we recognized a glaring gap — businesses were building great products but 
                  leaving themselves dangerously exposed to cyber threats.
                </p>
                <p>
                  Today, Kreatix Technologies stands as a full-spectrum technology partner, 
                  uniquely combining creative software development with rigorous cybersecurity 
                  and scalable cloud infrastructure. We don't just build it — we secure it and scale it.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '2019', label: 'Founded', icon: Award },
                { value: '150+', label: 'Projects Delivered', icon: TrendingUp },
                { value: '80+', label: 'Happy Clients', icon: Users },
                { value: '5+', label: 'Years Experience', icon: Star },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="glass-card border border-white/5 p-6 text-center">
                  <Icon size={24} className="text-brand-400 mx-auto mb-3" />
                  <p className="text-3xl font-black gradient-text">{value}</p>
                  <p className="text-gray-400 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">Our <span className="gradient-text">Values</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card border border-white/5 p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-brand-400" />
                </div>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-dark-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">Meet the <span className="gradient-text">Team</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto">The brilliant minds driving Kreatix Technologies forward.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="glass-card border border-white/5 p-6 text-center hover:border-brand-500/20 transition-colors">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg`}>
                  {member.initials}
                </div>
                <h3 className="text-white font-bold mb-0.5">{member.name}</h3>
                <p className="text-brand-400 text-xs font-medium mb-3">{member.role}</p>
                <p className="text-gray-400 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black mb-4">
            Ready to <span className="gradient-text">Work Together?</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Let's talk about how Kreatix Technologies can help your business innovate and grow.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="btn-primary text-base px-10 py-4">
              Get in Touch <ArrowRight size={16} />
            </Link>
            <Link to="/portfolio" className="btn-secondary text-base px-10 py-4">
              View Our Work
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
