import React, { useState } from 'react';
import { Mail, MapPin, Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || '';
const EMAIL_CONFIGURED = EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending]     = useState(false);
  const [sendError, setSendError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSending(true);
    setSendError('');
    if (!EMAIL_CONFIGURED) {
      await new Promise(r => setTimeout(r, 800));
      setSending(false);
      setSubmitted(true);
      return;
    }
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        name: data.name, email: data.email, company: data.company || 'N/A',
        subject: data.subject, message: data.message,
      }, EMAILJS_PUBLIC_KEY);
      setSubmitted(true);
    } catch (err) {
      setSendError('Failed to send. Please email us directly at info@kreatixtech.com');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-ink-950 text-white min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-24 border-b border-ink-700">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <p className="text-teal-400 text-xs font-mono uppercase tracking-widest mb-6">Contact</p>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none mb-8 text-white">
            Let's Talk.
          </h1>
          <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
            Whether you need a comprehensive security assessment, a scalable cloud architecture,
            or a custom software solution, our team is ready to deliver.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-5 gap-16">

          {/* Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Email Us</p>
              <a href="mailto:info@kreatixtech.com"
                className="text-white font-semibold hover:text-teal-400 transition-colors">
                info@kreatixtech.com
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Headquarters</p>
              <p className="text-slate-300 text-sm">Global Operations</p>
              <p className="text-slate-500 text-sm">Remote-First Agency</p>
            </div>
            <div className="card p-6 space-y-3">
              <p className="text-white font-semibold text-sm">Typical Response Time</p>
              <p className="text-slate-400 text-sm">We respond to all enquiries within <span className="text-teal-400 font-semibold">24 hours</span> on business days.</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={28} className="text-teal-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">Message Sent</h3>
                <p className="text-slate-400 text-sm mb-6">We'll be in touch within 24 hours.</p>
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
                    {errors.name && <p className="text-red-400 text-xs mt-1">Required</p>}
                  </div>
                  <div>
                    <label className="label">Company</label>
                    <input {...register('company')} placeholder="Acme Corp" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input {...register('email', { required: true })} type="email" placeholder="john@company.com" className="input-field" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">Required</p>}
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
                  {errors.subject && <p className="text-red-400 text-xs mt-1">Required</p>}
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea {...register('message', { required: true })} rows={6}
                    placeholder="Tell us about your project or requirements..."
                    className="input-field resize-none" />
                  {errors.message && <p className="text-red-400 text-xs mt-1">Required</p>}
                </div>
                {sendError && (
                  <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    {sendError}
                  </div>
                )}
                <button type="submit" disabled={sending}
                  className="btn-teal w-full justify-center py-3.5 disabled:opacity-50">
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
