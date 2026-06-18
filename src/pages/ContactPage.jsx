import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending]     = useState(false);
  const [sendError, setSendError] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSending(true);
    setSendError('');
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setSubmitted(true);
        reset();
      } else {
        const err = await response.json();
        setSendError(err.error || 'Failed to send. Please email us directly at info@kreatixtech.com');
      }
    } catch (err) {
      setSendError('Failed to send. Please email us directly at info@kreatixtech.com');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-surface-50 text-ink-900 min-h-screen">
      <section className="pt-32 pb-24 border-b border-surface-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-coral-500 text-xs font-semibold uppercase tracking-widest mb-6">Contact</p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-8">
            Let&apos;s Talk.
          </h1>
          <p className="text-ink-500 text-lg max-w-xl leading-relaxed">
            Whether you need a comprehensive security assessment, a scalable cloud architecture,
            or a custom software solution, our team is ready to deliver.
          </p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid lg:grid-cols-5 gap-16">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-4">Email Us</p>
              <a href="mailto:info@kreatixtech.com" className="text-ink-900 font-semibold hover:text-coral-500 transition-colors">
                info@kreatixtech.com
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-4">Headquarters</p>
              <p className="text-ink-600 text-sm">Global Operations</p>
              <p className="text-ink-400 text-sm">Remote-First Agency</p>
            </div>
            <div className="card p-6 bg-white space-y-3">
              <p className="text-ink-900 font-semibold text-sm">Typical Response Time</p>
              <p className="text-ink-500 text-sm">We respond to all enquiries within <span className="text-coral-500 font-semibold">24 hours</span> on business days.</p>
            </div>
          </div>
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="card p-12 text-center bg-white">
                <div className="w-16 h-16 rounded-full bg-coral-500/10 border border-coral-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={28} className="text-coral-500" />
                </div>
                <h3 className="text-ink-900 font-bold text-xl mb-3">Message Sent</h3>
                <p className="text-ink-500 text-sm mb-6">We&apos;ll be in touch within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="btn-outline text-sm">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input {...register('name', { required: true })} placeholder="John Doe" className="input-field" />
                    {errors.name && <p className="text-coral-500 text-xs mt-1">Required</p>}
                  </div>
                  <div>
                    <label className="label">Company</label>
                    <input {...register('company')} placeholder="Acme Corp" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input {...register('email', { required: true })} type="email" placeholder="john@company.com" className="input-field" />
                  {errors.email && <p className="text-coral-500 text-xs mt-1">Required</p>}
                </div>
                <div>
                  <label className="label">Subject *</label>
                  <select {...register('subject', { required: true })} className="input-field">
                    <option value="">Select a subject...</option>
                    <option>Software Development</option>
                    <option>Cybersecurity / VAPT</option>
                    <option>Cloud Services</option>
                    <option>General Enquiry</option>
                  </select>
                  {errors.subject && <p className="text-coral-500 text-xs mt-1">Required</p>}
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea {...register('message', { required: true })} rows={6}
                    placeholder="Tell us about your project or requirements..."
                    className="input-field resize-none" />
                  {errors.message && <p className="text-coral-500 text-xs mt-1">Required</p>}
                </div>
                {sendError && (
                  <div className="flex items-start gap-2 text-coral-500 text-sm bg-coral-500/5 border border-coral-500/10 rounded-lg px-4 py-3">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    {sendError}
                  </div>
                )}
                <button type="submit" disabled={sending}
                  className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
                  {sending
                    ? <><Loader2 size={15} className="animate-spin" /> Sending...</>
                    : <><Send size={15} /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}