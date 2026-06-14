import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Linkedin, Twitter, Github, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import emailjs from '@emailjs/browser';

// ─────────────────────────────────────────────────────────────
// EmailJS config — set these in a .env file at the project root:
//   VITE_EMAILJS_SERVICE_ID=your_service_id
//   VITE_EMAILJS_TEMPLATE_ID=your_template_id
//   VITE_EMAILJS_PUBLIC_KEY=your_public_key
//
// Sign up free at https://www.emailjs.com and create a service +
// template. Map template variables to: {{name}}, {{email}},
// {{company}}, {{subject}}, {{message}}
// ─────────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || '';
const EMAIL_CONFIGURED = EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSending(true);
    setSendError('');

    if (!EMAIL_CONFIGURED) {
      // Dev fallback — simulate success when EmailJS isn't configured yet
      await new Promise((r) => setTimeout(r, 800));
      setSending(false);
      setSubmitted(true);
      return;
    }

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name:    data.name,
          email:   data.email,
          company: data.company || 'N/A',
          subject: data.subject,
          message: data.message,
        },
        EMAILJS_PUBLIC_KEY
      );
      setSubmitted(true);
    } catch (err) {
      console.error('EmailJS error:', err);
      setSendError('Failed to send your message. Please try emailing us directly at info@kreatixtech.com');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/10 via-transparent to-accent-900/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6">
                <Mail size={14} />
                Contact Us
              </div>
              <h1 className="text-5xl font-black mb-6">
                Let's <span className="gradient-text">Talk</span>
              </h1>
              <p className="text-gray-400 leading-relaxed mb-10 max-w-md">
                Whether you have a project in mind, need a security assessment, 
                or just want to learn more about our services — we'd love to hear from you.
              </p>

              <div className="space-y-5 mb-10">
                {[
                  { icon: Mail, label: 'Email', value: 'info@kreatixtech.com', href: 'mailto:info@kreatixtech.com' },
                  { icon: Phone, label: 'Phone', value: '+234 801 234 5678', href: 'tel:+2348012345678' },
                  { icon: MapPin, label: 'Location', value: 'Lagos, Nigeria', href: '#' },
                ].map(({ icon: Icon, label, value, href }) => (
                  <a key={label} href={href} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/20 transition-colors">
                      <Icon size={20} className="text-brand-400" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">{label}</p>
                      <p className="text-white font-medium group-hover:text-brand-300 transition-colors">{value}</p>
                    </div>
                  </a>
                ))}
              </div>

              <div className="flex gap-3">
                {[Linkedin, Twitter, Github].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-brand-500/20 hover:text-brand-400 flex items-center justify-center text-gray-400 transition-all border border-white/10">
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div className="glass-card border border-white/5 p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-green-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Message Sent!</h3>
                  <p className="text-gray-400">We'll get back to you within 24 hours.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-secondary mt-6 text-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <h3 className="text-white font-bold text-xl mb-6">Send a Message</h3>
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
                      <option value="Software Development">Software Development</option>
                      <option value="Cybersecurity / VAPT">Cybersecurity / VAPT</option>
                      <option value="Cloud Services">Cloud Services</option>
                      <option value="General Enquiry">General Enquiry</option>
                    </select>
                    {errors.subject && <p className="text-red-400 text-xs mt-1">Required</p>}
                  </div>
                  <div>
                    <label className="label">Message *</label>
                    <textarea
                      {...register('message', { required: true })}
                      rows={5}
                      placeholder="Tell us about your project or requirements..."
                      className="input-field resize-none"
                    />
                    {errors.message && <p className="text-red-400 text-xs mt-1">Required</p>}
                  </div>
                  {sendError && (
                    <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                      {sendError}
                    </div>
                  )}
                  {!EMAIL_CONFIGURED && (
                    <p className="text-amber-400/70 text-xs flex items-center gap-1.5">
                      <AlertCircle size={11} />
                      EmailJS not configured — form will simulate success. See ContactPage.jsx for setup.
                    </p>
                  )}
                  <button type="submit" disabled={sending} className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
                    {sending ? (
                      <><Loader2 size={15} className="animate-spin" /> Sending...</>
                    ) : (
                      <><Send size={15} /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
