import React, { useState, useEffect } from 'react';
import { Quote, TrendingUp, Star, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${API_URL}/api/testimonials?featured=true`);
      const data = await response.json();
      setTestimonials(data);
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="h-6 w-6 text-orange animate-spin mx-auto" />
      </div>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-offwhite">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-ink mb-3">What Our Clients Say</h2>
          <p className="text-grey max-w-xl mx-auto">
            Trusted by enterprises and startups alike to deliver secure, scalable solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <Quote className="h-6 w-6 text-orange/20 mb-3" />
              <p className="text-ink-dark text-sm leading-relaxed mb-5">{t.quote}</p>

              {t.metricValue && t.metricLabel && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-5">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 text-sm font-bold">{t.metricValue}</span>
                  <span className="text-green-600 text-xs">{t.metricLabel}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                  {t.clientName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{t.clientName}</p>
                  <p className="text-xs text-grey">
                    {t.clientRole}{t.clientCompany && `, ${t.clientCompany}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
