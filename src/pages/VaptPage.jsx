import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, X, CheckCircle2, ArrowUpRight, FileText, Send, Search, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useApp } from '../context/AppContext';
import { cn, formatDateTime, statusConfig } from '../lib/utils';

const serviceTypes = [
  'Web Application VAPT',
  'Mobile Application VAPT',
  'Network Infrastructure VAPT',
  'API Security Assessment',
  'Full Scope VAPT',
  'Cloud Security Assessment',
];

function ThreadView({ request, onClose }) {
  const { addThreadMessage } = useApp();
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    setTimeout(() => {
      addThreadMessage(request.id, msg.trim(), 'client');
      setMsg('');
      setSending(false);
    }, 400);
  };

  const st = statusConfig[request.status] || statusConfig.pending;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-surface-300 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-300">
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <p className="text-ink-900 font-bold text-sm">{request.id}</p>
              <span className={cn('tag text-[10px]', st.color)}>{st.label}</span>
            </div>
            <p className="text-ink-400 text-xs">{request.serviceType} &middot; {request.companyName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-200 text-ink-400 hover:text-ink-900 transition-colors">
            <X size={17} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {request.thread.map((m) => (
            <div key={m.id} className={cn('flex gap-3', m.role === 'client' ? 'flex-row-reverse' : '')}>
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                m.role === 'system' ? 'bg-surface-200 text-ink-400' :
                m.role === 'admin'  ? 'bg-coral-500/10 text-coral-500' :
                                     'bg-surface-300 text-ink-600'
              )}>
                {m.role === 'system' ? '&middot;' : m.role === 'admin' ? 'KT' : 'C'}
              </div>
              <div className={cn('max-w-sm', m.role === 'client' ? 'items-end flex flex-col' : '')}>
                <div className={cn('rounded-xl px-4 py-3 text-sm',
                  m.role === 'system' ? 'bg-surface-100 text-ink-400' :
                  m.role === 'admin'  ? 'bg-coral-500/5 border border-coral-500/10 text-ink-700' :
                                       'bg-surface-200 text-ink-700'
                )}>
                  {m.message}
                </div>
                <p className="text-xs text-ink-300 mt-1 px-1">{m.author} &middot; {formatDateTime(m.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 pb-6 pt-3 border-t border-surface-300">
          <form onSubmit={handleSend} className="flex gap-3">
            <input value={msg} onChange={e => setMsg(e.target.value)}
              placeholder="Send a message to our team..." className="input-field flex-1 text-sm py-2.5" />
            <button type="submit" disabled={sending || !msg.trim()} className="btn-primary text-sm px-4 py-2.5 disabled:opacity-40">
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VaptPage() {
  const { submitVaptRequest, vaptRequests } = useApp();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [submittedId, setSubmittedId] = useState(null);
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [threadRequest, setThreadRequest] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();
  const [formData, setFormData] = useState({});

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleNext = handleSubmit(data => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(2);
  });

  const handleFileDrop = e => {
    e.preventDefault();
    setDragging(false);
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const handleSubmitFinal = () => {
    const id = submitVaptRequest({
      ...formData,
      documents: files.map(f => f.name),
    });
    setSubmittedId(id);
    setStep(3);
  };

  const handleLookup = () => {
    setLookupError('');
    const r = vaptRequests.find(r => r.id === lookupId.trim().toUpperCase());
    if (r) { setLookupResult(r); }
    else    { setLookupError('No request found with that ID.'); setLookupResult(null); }
  };

  const st = lookupResult ? (statusConfig[lookupResult.status] || statusConfig.pending) : null;

  return (
    <div className="bg-surface-50 text-ink-900 min-h-screen">
      <section className="pt-32 pb-16 border-b border-surface-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-coral-500 text-xs font-semibold uppercase tracking-widest mb-6">Client Portal</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-4">
            Client Security Portal
          </h1>
          <p className="text-ink-500 text-base">Manage your vulnerability assessments and security audits.</p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            {step === 3 ? (
              <div className="card p-10 text-center bg-white">
                <div className="w-16 h-16 rounded-full bg-coral-500/10 border border-coral-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={28} className="text-coral-500" />
                </div>
                <h2 className="text-2xl font-black text-ink-900 mb-3">Request Submitted</h2>
                <p className="text-ink-500 text-sm mb-2">Your reference ID:</p>
                <p className="font-mono text-coral-500 text-xl font-bold mb-6">{submittedId}</p>
                <p className="text-ink-400 text-sm mb-8">Save this ID to track your request below. Our team will respond within 24 hours.</p>
                <button onClick={() => { setStep(1); setFiles([]); setSubmittedId(null); setFormData({}); }}
                  className="btn-outline text-sm">
                  Submit Another Request
                </button>
              </div>
            ) : (
              <div className="card bg-white">
                <div className="flex border-b border-surface-300">
                  {['Contact & Scope', 'Documents & Submit'].map((label, i) => (
                    <div key={label} className={cn('flex-1 px-6 py-4 text-xs font-semibold border-r border-surface-300 last:border-r-0 transition-colors',
                      step === i + 1 ? 'text-coral-500 bg-coral-500/5' : 'text-ink-300'
                    )}>
                      <span className={cn('inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] mr-2 font-black',
                        step === i + 1 ? 'bg-coral-500 text-white' : 'bg-surface-200 text-ink-400'
                      )}>{i + 1}</span>
                      {label}
                    </div>
                  ))}
                </div>
                {step === 1 && (
                  <form onSubmit={handleNext} className="p-8 space-y-5">
                    <h2 className="text-ink-900 font-bold text-lg mb-2">Submit VAPT Scope</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Company Name *</label>
                        <input {...register('companyName', { required: true })} placeholder="Acme Corp" className="input-field" />
                        {errors.companyName && <p className="text-coral-500 text-xs mt-1">Required</p>}
                      </div>
                      <div>
                        <label className="label">Contact Name *</label>
                        <input {...register('contactName', { required: true })} placeholder="John Doe" className="input-field" />
                        {errors.contactName && <p className="text-coral-500 text-xs mt-1">Required</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Email *</label>
                        <input {...register('email', { required: true })} type="email" placeholder="john@company.com" className="input-field" />
                        {errors.email && <p className="text-coral-500 text-xs mt-1">Required</p>}
                      </div>
                      <div>
                        <label className="label">Phone</label>
                        <input {...register('phone')} placeholder="+1 555 000 0000" className="input-field" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Service Type *</label>
                      <select {...register('serviceType', { required: true })} className="input-field">
                        <option value="">Select service...</option>
                        {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.serviceType && <p className="text-coral-500 text-xs mt-1">Required</p>}
                    </div>
                    <div>
                      <label className="label">Target Environment *</label>
                      <select {...register('targetEnvironment', { required: true })} className="input-field">
                        <option value="">Select...</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                        <option value="development">Development</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Preferred Timeline</label>
                      <select {...register('timeline')} className="input-field">
                        <option value="flexible">Flexible</option>
                        <option value="2weeks">Within 2 weeks</option>
                        <option value="1month">Within 1 month</option>
                        <option value="urgent">Urgent (ASAP)</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Scope Description *</label>
                      <textarea {...register('scope', { required: true })} rows={4}
                        placeholder="Describe the systems, applications or infrastructure in scope..."
                        className="input-field resize-none" />
                      {errors.scope && <p className="text-coral-500 text-xs mt-1">Required</p>}
                    </div>
                    <button type="submit" className="btn-primary w-full justify-center text-sm py-3">
                      Continue to Documents
                    </button>
                  </form>
                )}
                {step === 2 && (
                  <div className="p-8 space-y-6">
                    <h2 className="text-ink-900 font-bold text-lg mb-2">Upload Supporting Documents</h2>
                    <div
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileRef.current.click()}
                      className={cn('border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
                        dragging ? 'border-coral-500 bg-coral-500/5' : 'border-surface-400 hover:border-surface-500 bg-surface-100'
                      )}
                    >
                      <Upload size={24} className="text-ink-300 mx-auto mb-3" />
                      <p className="text-ink-600 text-sm font-medium">Drag and drop files here</p>
                      <p className="text-ink-400 text-xs mt-1">Network diagrams, API documentation, or NDAs (PDF, DOCX)</p>
                      <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.doc,.png,.jpg"
                        className="hidden" onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files)])} />
                    </div>
                    {files.length > 0 && (
                      <ul className="space-y-2">
                        {files.map((f, i) => (
                          <li key={i} className="flex items-center justify-between bg-surface-100 border border-surface-300 px-4 py-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText size={13} className="text-coral-500 flex-shrink-0" />
                              <span className="text-ink-600 text-sm truncate max-w-xs">{f.name}</span>
                            </div>
                            <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                              className="text-ink-400 hover:text-coral-500 transition-colors ml-2">
                              <X size={13} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="border-t border-surface-300 pt-5 space-y-3">
                      <h3 className="text-ink-900 font-semibold text-sm">Review Your Submission</h3>
                      <div className="bg-surface-100 rounded-xl p-4 text-xs text-ink-500 space-y-1.5">
                        <p><span className="text-ink-700">Company:</span> {formData.companyName}</p>
                        <p><span className="text-ink-700">Service:</span> {formData.serviceType}</p>
                        <p><span className="text-ink-700">Environment:</span> {formData.targetEnvironment}</p>
                        <p><span className="text-ink-700">Files:</span> {files.length} attached</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="btn-outline flex-1 text-sm py-3 justify-center">Back</button>
                      <button onClick={handleSubmitFinal} className="btn-primary flex-1 text-sm py-3 justify-center">
                        Submit Request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="card p-6 bg-white">
              <h3 className="text-ink-900 font-bold text-sm mb-1">Track a Request</h3>
              <p className="text-ink-400 text-xs mb-5">Enter your reference ID to check status and view messages.</p>
              <div className="flex gap-2 mb-4">
                <input value={lookupId} onChange={e => { setLookupId(e.target.value); setLookupError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  placeholder="VAPT-2024-001" className="input-field flex-1 text-sm py-2.5 font-mono" />
                <button onClick={handleLookup} className="btn-primary text-sm px-4 py-2.5">
                  <Search size={14} />
                </button>
              </div>
              {lookupError && <p className="text-coral-500 text-xs mb-4">{lookupError}</p>}
              {lookupResult && st && (
                <div className="space-y-3">
                  <div className="bg-surface-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-ink-900 font-semibold text-sm">{lookupResult.companyName}</p>
                      <span className={cn('tag text-[10px]', st.color)}>{st.label}</span>
                    </div>
                    <p className="text-ink-400 text-xs font-mono mb-1">{lookupResult.id}</p>
                    <p className="text-ink-500 text-xs">{lookupResult.serviceType}</p>
                  </div>
                  <button onClick={() => setThreadRequest(lookupResult)}
                    className="btn-outline w-full justify-center text-xs py-2.5">
                    View Messages ({lookupResult.thread.length})
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 card p-6 bg-white space-y-4">
              <h3 className="text-ink-900 font-bold text-sm">What to expect</h3>
              {[
                'Submit your scope and documents',
                'We respond within 24 hours',
                'Agree on timeline & engagement terms',
                'Assessment begins - track progress here',
                'Receive detailed remediation report',
              ].map((s, i) => (
                <div key={s} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-coral-500/10 border border-coral-500/20 flex items-center justify-center text-coral-500 text-[10px] font-black flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-ink-500 text-xs leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {threadRequest && (
        <ThreadView
          request={vaptRequests.find(r => r.id === threadRequest.id) || threadRequest}
          onClose={() => setThreadRequest(null)}
        />
      )}
    </div>
  );
}