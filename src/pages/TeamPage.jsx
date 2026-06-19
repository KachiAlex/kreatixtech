import React from 'react';
import { Linkedin, Mail } from 'lucide-react';
import SEO from '../components/SEO';

const team = [
  {
    name: 'Chiemele Akoma',
    role: 'Chairman of the Board',
    image: '/images/team/chiemele.jpg',
    bio: 'Strategic visionary and founding leader of Kreatix Technologies. Chiemele drives the company\'s long-term growth, governance, and mission to deliver secure, innovative technology solutions across Africa and beyond.',
    linkedin: null,
  },
  {
    name: 'Onyedikachi Akoma',
    role: 'Business Head',
    image: '/images/team/onyedikachi.jpg',
    bio: 'Onyedikachi leads business development, client relations, and strategic partnerships. His deep understanding of enterprise needs ensures Kreatix consistently delivers tailored solutions that drive measurable results.',
    linkedin: null,
  },
  {
    name: 'Lukman Sanni',
    role: 'Chief Technology Officer',
    image: '/images/team/lukman.jpg',
    bio: 'Lukman architects the technical backbone of Kreatix Technologies. From secure cloud infrastructure to advanced penetration testing methodologies, he ensures every solution is built on a foundation of engineering excellence.',
    linkedin: null,
  },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-offwhite pt-24 pb-16">
      <SEO
        title="Our Team"
        description="Meet the leadership behind Kreatix Technologies — Chiemele Akoma, Onyedikachi Akoma, and Lukman Sanni. Experts in technology, business, and cybersecurity."
        keywords="Kreatix Technologies team, leadership, CTO, cybersecurity experts, software development team"
        pathname="/team"
      />

      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-ink mb-4">Our Team</h1>
          <p className="text-grey text-lg max-w-2xl mx-auto">
            The people behind Kreatix Technologies — driven by innovation, security, and a commitment to delivering exceptional results for every client.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/images/team/placeholder.jpg';
                  }}
                />
              </div>

              {/* Info */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-ink">{member.name}</h2>
                <p className="text-sm font-medium text-orange mt-1">{member.role}</p>
                <p className="text-sm text-grey-dark mt-4 leading-relaxed">{member.bio}</p>

                {/* Social */}
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-50 rounded-lg text-grey hover:text-orange hover:bg-orange/5 transition-colors"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  <a
                    href="mailto:info@kreatixtech.com"
                    className="p-2 bg-gray-50 rounded-lg text-grey hover:text-orange hover:bg-orange/5 transition-colors"
                    aria-label={`Contact ${member.name}`}
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Join CTA */}
        <div className="mt-16 text-center bg-white rounded-2xl border border-border p-10">
          <h2 className="text-2xl font-bold text-ink mb-3">Join Our Team</h2>
          <p className="text-grey max-w-xl mx-auto mb-6">
            We are always looking for exceptional talent in cybersecurity, cloud engineering, and software development.
          </p>
          <a
            href="mailto:info@kreatixtech.com?subject=Career Inquiry"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange text-white font-semibold rounded-xl hover:bg-orange-deep transition-colors"
          >
            <Mail className="h-4 w-4" />
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}
