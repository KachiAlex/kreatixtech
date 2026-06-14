import React, { useState, useRef } from 'react';
import {
  Shield, Upload, Send, CheckCircle2, Clock, MessageSquare,
  FileText, X, AlertCircle, ChevronRight, ArrowRight, Lock,
  Building2, User, Mail, Phone, Globe, Server, Smartphone,
  Package, Search, Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn, formatDateTime, statusConfig } from '../lib/utils';
import { useForm } from 'react-hook-form';

const steps = [
  { id: 1, label: 'Your Details' },
  { id: 2, label: 'Scope & Targets' },
  { id: 3, label: 'Documents' },
  { id: 4, label: 'Confirmation' },
];

const serviceTypes = [
  'Web Application VAPT',
  'Mobile Application VAPT',
  'Network Penetration Testing',
  'API Security Assessment',
  'Cloud Security Audit',
  'Red Team Exercise',
  'Source Code Review',
  'Social Engineering Assessment',
  'Full Scope Assessment',
];

const targetTypes = [
  { id: 'web', icon: Globe, label: 'Web Applications' },
  { id: 'api', icon: Server, label: 'APIs / Backend' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile Apps' },
  { id: 'network', icon: Package, label: 'Network / Infra' },
];

const timelines = [
  { value: 'urgent', label: 'Urgent (ASAP)', desc: 'Start within 48 hours' },
  { value: 'standard', label: 'Standard (1-2 weeks)', desc: 'Normal scheduling' },
  { value: 'planned', label: 'Planned (1+ month)', desc: 'Scheduled in advance' },
];

// ──────────────────────────────────────────────
// Status Tracker — shown after submission
// ──────────────────────────────────────────────
function RequestTracker({ requestId, onBack }) {
  const { vaptRequests, addThreadMessage } = useApp();
  const request = vaptRequests.find((r) => r.id === requestId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!request) return null;

  const status = statusConfig[request.status] || statusConfig.pending;

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    setTimeout(() => {
      addThreadMessage(requestId, newMessage.trim(), 'client');
      setNewMessage('');
      setSending(false);
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card border border-white/5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <Shield size={20} className="text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-mono">{request.id}</p>
                <h3 className="text-white font-bold">{request.serviceType}</h3>
              </div>
            </div>
            <p className="text-sm text-gray-400">{request.companyName} · {request.contactName}</p>
          </div>
          <span className={`badge border ${status.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status.label}
          </span>
        </div>

        {/* Progress steps */}
        <div className="mt-6">
          <div className="flex items-center gap-0">
            {['Received', 'In Review', 'Proposal Sent', 'Assessment', 'Completed'].map((step, i, arr) => {
              const statusOrder = ['pending', 'in_review', 'proposal_sent', 'in_progress', 'completed'];
              const currentIndex = statusOrder.indexOf(request.status);
              const done = i <= currentIndex;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold',
                      done ? 'bg-brand-500 border-brand-500 text-white' : 'border-white/20 text-gray-500'
                    )}>
                      {done ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <span className={`text-[10px] mt-1 whitespace-nowrap ${done ? 'text-brand-400' : 'text-gray-500'}`}>{step}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mt-[-14px] ${i < currentIndex ? 'bg-brand-500' : 'bg-white/10'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Thread */}
      <div className="glass-card border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <MessageSquare size={16} className="text-brand-400" />
          <h4 className="text-white font-semibold">Assessment Thread</h4>
          <span className="ml-auto text-xs text-gray-500">{request.thread.length} messages</span>
        </div>
        <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
          {request.thread.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                msg.role === 'client' ? 'flex-row-reverse' : ''
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
                msg.role === 'system' ? 'bg-gray-700 text-gray-300' :
                msg.role === 'admin' ? 'bg-brand-600 text-white' :
                'bg-accent-500/30 text-accent-300'
              )}>
                {msg.role === 'system' ? '🔔' : msg.role === 'admin' ? 'KT' : 'You'}
              </div>
              <div className={cn(
                'max-w-sm',
                msg.role === 'client' ? 'items-end flex flex-col' : ''
              )}>
                <div className={cn(
                  'rounded-2xl px-4 py-3 text-sm',
                  msg.role === 'system' ? 'bg-dark-500 text-gray-300' :
                  msg.role === 'admin' ? 'bg-brand-500/15 border border-brand-500/20 text-gray-100' :
                  'bg-accent-500/15 border border-accent-500/20 text-gray-100'
                )}>
                  {msg.message}
                </div>
                <p className="text-xs text-gray-500 mt-1 px-1">
                  {msg.author} · {formatDateTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Reply */}
        <div className="px-6 pb-6">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message to our team..."
              className="input-field flex-1 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="btn-primary px-4 py-2.5 text-sm disabled:opacity-50"
            >
              <Send size={15} />
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>

      <div className="text-center">
        <button onClick={onBack} className="btn-secondary text-sm">
          ← Submit Another Request
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Multi-Step Form
// ──────────────────────────────────────────────
export default function VaptPage() {
  const { submitVaptRequest } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedId, setSubmittedId] = useState(null);
  const [existingId, setExistingId] = useState('');
  const [lookupMode, setLookupMode] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const { vaptRequests } = useApp();

  const [files, setFiles] = useState([]);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [formData, setFormData] = useState({});
  const fileRef = useRef();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
  } = useForm();

  const handleNext = handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((s) => s + 1);
  });

  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = () => {
    const allData = { ...formData, ...getValues() };
    const id = submitVaptRequest({
      companyName: allData.companyName,
      contactName: allData.contactName,
      email: allData.email,
      phone: allData.phone,
      website: allData.website,
      serviceType: allData.serviceType,
      scope: allData.scope,
      targets: selectedTargets,
      targetEnvironment: allData.targetEnvironment,
      timeline: allData.timeline,
      additionalContext: allData.additionalContext,
      documents: files.map((f) => f.name),
    });
    setSubmittedId(id);
  };

  const handleLookup = () => {
    const req = vaptRequests.find((r) => r.id === existingId.trim().toUpperCase());
    if (req) {
      setLookupResult(req.id);
      setLookupError('');
    } else {
      setLookupError('No request found with that ID. Please check and try again.');
      setLookupResult(null);
    }
  };

  if (lookupResult) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <h2 className="text-3xl font-black mb-2">Your <span className="gradient-text">VAPT Request</span></h2>
        </div>
        <RequestTracker requestId={lookupResult} onBack={() => { setLookupResult(null); setLookupMode(false); }} />
      </div>
    );
  }

  if (submittedId) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h2 className="text-3xl font-black mb-2">Request Submitted!</h2>
          <p className="text-gray-400 mb-2">Your reference ID: <span className="text-brand-400 font-mono font-bold">{submittedId}</span></p>
          <p className="text-gray-500 text-sm mb-8">Save this ID to track your assessment progress.</p>
        </div>
        <RequestTracker requestId={submittedId} onBack={() => { setSubmittedId(null); setCurrentStep(1); setFiles([]); setSelectedTargets([]); setFormData({}); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/10 via-transparent to-red-900/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6">
                <Shield size={14} />
                VAPT Assessment Portal
              </div>
              <h1 className="text-5xl font-black mb-4">
                Request Your<br />
                <span className="gradient-text">Security Assessment</span>
              </h1>
              <p className="text-gray-400 leading-relaxed mb-8">
                Submit your scope, upload supporting documents, and our certified security team 
                will reach out within 24 hours with a tailored assessment plan.
              </p>
              <div className="space-y-3">
                {[
                  { icon: Lock, text: 'All data encrypted and handled confidentially' },
                  { icon: Clock, text: 'Response within 24 hours of submission' },
                  { icon: CheckCircle2, text: 'CREST & OSCP-certified security professionals' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-gray-400">
                    <Icon size={15} className="text-brand-400 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Track existing */}
            <div className="glass-card border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search size={16} className="text-accent-400" />
                <h3 className="text-white font-semibold">Track Existing Request</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Already submitted a request? Enter your reference ID to view status and communicate with our team.
              </p>
              <div className="flex gap-2">
                <input
                  value={existingId}
                  onChange={(e) => setExistingId(e.target.value)}
                  placeholder="e.g. VAPT-2024-001"
                  className="input-field flex-1 text-sm font-mono py-2.5"
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                />
                <button onClick={handleLookup} className="btn-primary text-sm px-4 py-2.5">
                  <Search size={14} />
                  Track
                </button>
              </div>
              {lookupError && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                  <AlertCircle size={12} /> {lookupError}
                </p>
              )}
              <p className="text-gray-600 text-xs mt-3">Demo ID: <span className="font-mono text-gray-500">VAPT-2024-001</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-step form */}
      <section className="py-12 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Step indicator */}
          <div className="flex items-center mb-10">
            {steps.map((step, i) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                    currentStep > step.id
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : currentStep === step.id
                      ? 'border-brand-400 text-brand-400 bg-brand-400/10'
                      : 'border-white/20 text-gray-500'
                  )}>
                    {currentStep > step.id ? <CheckCircle2 size={16} /> : step.id}
                  </div>
                  <span className={`text-xs mt-1.5 whitespace-nowrap ${currentStep >= step.id ? 'text-brand-400' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${currentStep > step.id ? 'bg-brand-500' : 'bg-white/10'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="glass-card border border-white/5 p-8">
            {/* Step 1 — Contact Details */}
            {currentStep === 1 && (
              <form onSubmit={handleNext} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Your Details</h2>
                  <p className="text-gray-400 text-sm mb-6">Tell us about you and your organisation.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Company Name *</label>
                    <input {...register('companyName', { required: 'Required' })} placeholder="Acme Corporation" className="input-field" />
                    {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName.message}</p>}
                  </div>
                  <div>
                    <label className="label">Your Full Name *</label>
                    <input {...register('contactName', { required: 'Required' })} placeholder="John Doe" className="input-field" />
                    {errors.contactName && <p className="text-red-400 text-xs mt-1">{errors.contactName.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="label">Work Email *</label>
                  <input {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} type="email" placeholder="john@company.com" className="input-field" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Phone Number</label>
                    <input {...register('phone')} placeholder="+234 800 000 0000" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Company Website</label>
                    <input {...register('website')} placeholder="https://company.com" className="input-field" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="btn-primary">
                    Next: Scope & Targets <ChevronRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2 — Scope */}
            {currentStep === 2 && (
              <form onSubmit={handleNext} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Scope & Targets</h2>
                  <p className="text-gray-400 text-sm mb-6">Define what you want us to assess.</p>
                </div>

                <div>
                  <label className="label">Assessment Type *</label>
                  <select {...register('serviceType', { required: 'Required' })} className="input-field">
                    <option value="">Select assessment type...</option>
                    {serviceTypes.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.serviceType && <p className="text-red-400 text-xs mt-1">{errors.serviceType.message}</p>}
                </div>

                <div>
                  <label className="label">Target Types</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {targetTypes.map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedTargets((prev) =>
                          prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
                        )}
                        className={cn(
                          'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                          selectedTargets.includes(id)
                            ? 'border-brand-500/60 bg-brand-500/10 text-brand-300'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20'
                        )}
                      >
                        <Icon size={15} />
                        {label}
                        {selectedTargets.includes(id) && <CheckCircle2 size={13} className="ml-auto text-brand-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Scope Description *</label>
                  <textarea
                    {...register('scope', { required: 'Required', minLength: { value: 20, message: 'Please provide more detail' } })}
                    rows={4}
                    placeholder="Describe the systems, applications, or URLs in scope. Include number of pages, API endpoints, IP ranges, etc."
                    className="input-field resize-none"
                  />
                  {errors.scope && <p className="text-red-400 text-xs mt-1">{errors.scope.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Target Environment *</label>
                    <select {...register('targetEnvironment', { required: 'Required' })} className="input-field">
                      <option value="">Select...</option>
                      <option value="production">Production</option>
                      <option value="staging">Staging / UAT</option>
                      <option value="development">Development</option>
                      <option value="both">Production & Staging</option>
                    </select>
                    {errors.targetEnvironment && <p className="text-red-400 text-xs mt-1">{errors.targetEnvironment.message}</p>}
                  </div>
                  <div>
                    <label className="label">Preferred Timeline *</label>
                    <select {...register('timeline', { required: 'Required' })} className="input-field">
                      <option value="">Select...</option>
                      {timelines.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {errors.timeline && <p className="text-red-400 text-xs mt-1">{errors.timeline.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="label">Additional Context</label>
                  <textarea
                    {...register('additionalContext')}
                    rows={3}
                    placeholder="Any specific concerns, compliance requirements, previous assessment history, or special instructions..."
                    className="input-field resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <button type="button" onClick={() => setCurrentStep(1)} className="btn-secondary">
                    ← Back
                  </button>
                  <button type="submit" className="btn-primary">
                    Next: Documents <ChevronRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3 — Documents */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Supporting Documents</h2>
                  <p className="text-gray-400 text-sm mb-6">Upload relevant files (optional but helps us scope accurately).</p>
                </div>

                <div className="text-sm text-gray-400 space-y-1 mb-4">
                  <p className="font-medium text-gray-300">Suggested documents:</p>
                  {[
                    'Network diagram / topology',
                    'Application architecture overview',
                    'Previous assessment reports',
                    'IP address / URL list',
                    'Compliance / regulatory requirements',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <ChevronRight size={12} className="text-brand-400" />
                      {item}
                    </div>
                  ))}
                </div>

                {/* Drop zone */}
                <div
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-brand-500/40 rounded-2xl p-10 text-center cursor-pointer transition-colors group"
                >
                  <Upload size={32} className="mx-auto text-gray-500 group-hover:text-brand-400 mb-3 transition-colors" />
                  <p className="text-gray-300 font-medium">Drop files here or click to browse</p>
                  <p className="text-gray-500 text-sm mt-1">PDF, DOCX, XLSX, PNG, JPG — up to 10MB each</p>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                    className="hidden"
                    onChange={handleFileAdd}
                  />
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-dark-500/60 rounded-xl border border-white/5">
                        <FileText size={16} className="text-brand-400 flex-shrink-0" />
                        <span className="text-sm text-gray-300 flex-1 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                        <button onClick={() => removeFile(i)} className="text-gray-500 hover:text-red-400 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-brand-500/5 border border-brand-500/15 rounded-xl p-4 flex gap-3">
                  <Lock size={15} className="text-brand-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-sm">
                    All uploaded documents are encrypted and stored securely. They are only accessible 
                    to the assigned Kreatix security team members.
                  </p>
                </div>

                <div className="pt-4 flex justify-between">
                  <button type="button" onClick={() => setCurrentStep(2)} className="btn-secondary">
                    ← Back
                  </button>
                  <button onClick={() => setCurrentStep(4)} className="btn-primary">
                    Review & Submit <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 — Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Review & Submit</h2>
                  <p className="text-gray-400 text-sm mb-6">Confirm your details before submitting.</p>
                </div>

                <div className="space-y-4">
                  <ReviewSection title="Contact Details" icon={User}>
                    <ReviewRow label="Company" value={formData.companyName} />
                    <ReviewRow label="Contact" value={formData.contactName} />
                    <ReviewRow label="Email" value={formData.email} />
                    {formData.phone && <ReviewRow label="Phone" value={formData.phone} />}
                    {formData.website && <ReviewRow label="Website" value={formData.website} />}
                  </ReviewSection>

                  <ReviewSection title="Assessment Scope" icon={Shield}>
                    <ReviewRow label="Service Type" value={formData.serviceType} />
                    <ReviewRow label="Environment" value={formData.targetEnvironment} />
                    <ReviewRow label="Timeline" value={formData.timeline} />
                    <ReviewRow label="Scope" value={formData.scope} multiline />
                  </ReviewSection>

                  <ReviewSection title="Documents" icon={FileText}>
                    {files.length === 0 ? (
                      <p className="text-gray-500 text-sm">No documents attached</p>
                    ) : (
                      files.map((f, i) => <ReviewRow key={i} label={`File ${i + 1}`} value={f.name} />)
                    )}
                  </ReviewSection>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                  <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-sm">
                    By submitting, you confirm that you have authorisation to request security testing 
                    on the defined targets and agree to our terms of engagement.
                  </p>
                </div>

                <div className="pt-2 flex justify-between">
                  <button type="button" onClick={() => setCurrentStep(3)} className="btn-secondary">
                    ← Back
                  </button>
                  <button onClick={handleFinalSubmit} className="btn-primary px-8">
                    Submit Request <Send size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ReviewSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-dark-500/40 rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
        <Icon size={14} className="text-brand-400" />
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, multiline }) {
  return (
    <div className={`flex ${multiline ? 'flex-col gap-1' : 'justify-between items-center'}`}>
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-sm text-gray-200 ${multiline ? '' : 'text-right max-w-xs'}`}>{value}</span>
    </div>
  );
}
