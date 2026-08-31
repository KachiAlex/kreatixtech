import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Code2, Shield, Cloud, MessageSquare, AlertCircle, Plus, X, Server, ExternalLink } from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';
import Logo from '../../components/Logo';

// ── Service type definitions ─────────────────────────────────────────────────
const SERVICE_TYPES = [
  {
    key: 'SOFTWARE_DEV',
    icon: Code2,
    label: 'Software Development',
    description: 'Custom web apps, mobile apps, SaaS platforms, internal tools or system modernisation.',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    iconColor: 'text-blue-600',
  },
  {
    key: 'CYBERSECURITY',
    icon: Shield,
    label: 'Cybersecurity',
    description: 'VAPT assessments, threat detection, endpoint management, API security and zero-trust.',
    color: 'bg-orange-50 border-[#F2782E]/30 text-[#F2782E]',
    iconColor: 'text-[#F2782E]',
  },
  {
    key: 'CLOUD',
    icon: Cloud,
    label: 'Cloud Services',
    description: 'Cloud architecture, migration, infrastructure as code, managed ops and cost optimisation.',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    iconColor: 'text-purple-600',
  },
  {
    key: 'CONSULTING',
    icon: MessageSquare,
    label: 'Consulting',
    description: 'Architecture reviews, security audits, strategy sessions and written recommendations.',
    color: 'bg-green-50 border-green-200 text-green-700',
    iconColor: 'text-green-600',
  },
];

// ── Metadata fields per service type ────────────────────────────────────────
function MetadataFields({ serviceType, metadata, onChange }) {
  const set = (key, val) => onChange({ ...metadata, [key]: val });

  if (serviceType === 'CYBERSECURITY') return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-[#0E0E0F] mb-2">Testing Type *</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[['BLACK_BOX','Black Box','No prior knowledge'],['GREY_BOX','Grey Box','Limited knowledge'],['WHITE_BOX','White Box','Full knowledge']].map(([v,l,d]) => (
            <label key={v} className={`flex flex-col p-3 border-2 rounded-xl cursor-pointer transition-colors ${metadata.testingType===v ? 'border-[#F2782E] bg-orange-50' : 'border-[#E8E5E0] hover:border-[#F2782E]/50'}`}>
              <input type="radio" name="testingType" value={v} checked={metadata.testingType===v} onChange={e=>set('testingType',e.target.value)} className="sr-only"/>
              <span className="font-semibold text-sm text-[#0E0E0F]">{l}</span>
              <span className="text-xs text-[#6B6F76] mt-0.5">{d}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#0E0E0F] mb-2">Target URLs</label>
        <DynamicList values={metadata.targetUrls||['']} onChange={v=>set('targetUrls',v)} placeholder="https://app.example.com" icon={<ExternalLink className="h-4 w-4"/>}/>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#0E0E0F] mb-2">IP Ranges</label>
        <DynamicList values={metadata.ipRanges||['']} onChange={v=>set('ipRanges',v)} placeholder="192.168.1.0/24" icon={<Server className="h-4 w-4"/>}/>
      </div>
    </div>
  );

  if (serviceType === 'SOFTWARE_DEV') return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-[#0E0E0F] mb-2">Platforms needed</label>
        <div className="flex flex-wrap gap-2">
          {['Web','Mobile (iOS)','Mobile (Android)','Desktop','API only'].map(p => (
            <label key={p} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-colors ${(metadata.platforms||[]).includes(p) ? 'border-[#F2782E] bg-orange-50 text-[#F2782E]' : 'border-[#E8E5E0] text-[#6B6F76]'}`}>
              <input type="checkbox" className="sr-only" checked={(metadata.platforms||[]).includes(p)}
                onChange={e => set('platforms', e.target.checked ? [...(metadata.platforms||[]),p] : (metadata.platforms||[]).filter(x=>x!==p))}/>
              {p}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#0E0E0F] mb-2">Technology preferences</label>
        <input value={metadata.techPrefs||''} onChange={e=>set('techPrefs',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="e.g. React, Node.js, Django — leave blank if open"/>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#0E0E0F] mb-2">Do you have an existing design?</label>
        <div className="flex gap-3">
          {[['yes','Yes — I have mockups/wireframes'],['no','No — design from scratch'],['partial','Partial — some ideas']].map(([v,l]) => (
            <label key={v} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-colors ${metadata.hasDesign===v ? 'border-[#F2782E] bg-orange-50 text-[#F2782E]' : 'border-[#E8E5E0] text-[#6B6F76]'}`}>
              <input type="radio" name="hasDesign" value={v} checked={metadata.hasDesign===v} onChange={e=>set('hasDesign',e.target.value)} className="sr-only"/>{l}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#0E0E0F] mb-2">Required integrations</label>
        <input value={metadata.integrations||''} onChange={e=>set('integrations',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="e.g. Stripe, Salesforce, WhatsApp API"/>
      </div>
    </div>
  );

  if (serviceType === 'CLOUD') return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#0E0E0F] mb-2">Current provider</label>
          <select value={metadata.currentProvider||''} onChange={e=>set('currentProvider',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#F2782E] focus:border-transparent">
            <option value="">Not on cloud yet</option>
            {['AWS','Azure','GCP','DigitalOcean','Other'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0E0E0F] mb-2">Target provider</label>
          <select value={metadata.targetProvider||''} onChange={e=>set('targetProvider',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#F2782E] focus:border-transparent">
            <option value="">No preference</option>
            {['AWS','Azure','GCP','DigitalOcean','Other'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#0E0E0F] mb-2">Compliance requirements</label>
        <div className="flex flex-wrap gap-2">
          {['ISO 27001','SOC 2','GDPR','HIPAA','PCI-DSS','None'].map(c => (
            <label key={c} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-colors ${(metadata.compliance||[]).includes(c) ? 'border-[#F2782E] bg-orange-50 text-[#F2782E]' : 'border-[#E8E5E0] text-[#6B6F76]'}`}>
              <input type="checkbox" className="sr-only" checked={(metadata.compliance||[]).includes(c)}
                onChange={e=>set('compliance',e.target.checked?[...(metadata.compliance||[]),c]:(metadata.compliance||[]).filter(x=>x!==c))}/>
              {c}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  if (serviceType === 'CONSULTING') return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-[#0E0E0F] mb-2">Focus area</label>
        <input value={metadata.focusArea||''} onChange={e=>set('focusArea',e.target.value)} className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder="e.g. Security architecture review, cloud cost audit"/>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#0E0E0F] mb-2">Expected deliverable</label>
        <div className="flex gap-3 flex-wrap">
          {['Written report','Presentation','Workshop','Recommendations doc','Other'].map(d=>(
            <label key={d} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-colors ${metadata.deliverable===d?'border-[#F2782E] bg-orange-50 text-[#F2782E]':'border-[#E8E5E0] text-[#6B6F76]'}`}>
              <input type="radio" name="deliverable" value={d} checked={metadata.deliverable===d} onChange={e=>set('deliverable',e.target.value)} className="sr-only"/>{d}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return null;
}

function DynamicList({ values, onChange, placeholder, icon }) {
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6F76]">{icon}</span>
            <input value={v} onChange={e=>{ const n=[...values]; n[i]=e.target.value; onChange(n); }}
              className="w-full pl-9 pr-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent" placeholder={placeholder}/>
          </div>
          {values.length > 1 && (
            <button type="button" onClick={()=>onChange(values.filter((_,j)=>j!==i))} className="p-2.5 text-[#6B6F76] hover:text-red-500 border border-[#E8E5E0] rounded-xl"><X className="h-4 w-4"/></button>
          )}
        </div>
      ))}
      <button type="button" onClick={()=>onChange([...values,''])} className="flex items-center gap-1.5 text-sm font-medium text-[#F2782E] hover:text-[#D9601A]">
        <Plus className="h-4 w-4"/> Add another
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NewRequest() {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', budget: '', deadline: '' });
  const [metadata, setMetadata] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { apiCall, isAdmin } = usePortal();
  const navigate = useNavigate();
  const backPath = isAdmin ? '/portal/admin' : '/portal/dashboard';

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      const payload = {
        serviceType,
        title: form.title,
        description: form.description,
        metadata,
        budget: form.budget || undefined,
        deadline: form.deadline || undefined,
      };
      const r = await apiCall('/api/requests', { method: 'POST', body: JSON.stringify(payload) });
      if (r.ok) {
        const data = await r.json();
        navigate(`/portal/request/${data.id}`);
      } else {
        const d = await r.json();
        setError(d.error || 'Failed to submit request');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setIsLoading(false); }
  };

  const selectedType = SERVICE_TYPES.find(s => s.key === serviceType);

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* Header */}
      <div className="bg-[#0E0E0F] text-white sticky top-0 z-40 shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => step === 1 ? navigate(backPath) : setStep(1)} className="p-2 text-white/60 hover:text-white flex-shrink-0">
            <ArrowLeft className="h-4 w-4"/>
          </button>
          <Logo size="sm" linkTo={null} className="text-white" />
          <div className="flex-1 min-w-0 ml-1">
            <p className="text-xs text-white/50 truncate">{step === 1 ? 'New Service Request' : selectedType?.label}</p>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            {[1,2].map(s => (
              <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${s <= step ? 'bg-[#F2782E]' : 'bg-white/20'}`}/>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Step 1: choose service type ── */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-extrabold text-[#0E0E0F] mb-2">What do you need help with?</h2>
            <p className="text-[#6B6F76] mb-8">Choose the service that best describes your requirement.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SERVICE_TYPES.map(s => {
                const Icon = s.icon;
                const isSelected = serviceType === s.key;
                return (
                  <button key={s.key} onClick={() => setServiceType(s.key)}
                    className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${isSelected ? 'border-[#F2782E] bg-orange-50 shadow-lg' : 'border-[#E8E5E0] bg-white'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isSelected ? 'bg-[#F2782E]' : 'bg-[#F7F5F2]'}`}>
                      <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : s.iconColor}`}/>
                    </div>
                    <h3 className="font-bold text-[#0E0E0F] mb-1">{s.label}</h3>
                    <p className="text-sm text-[#6B6F76] leading-relaxed">{s.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end mt-8">
              <button onClick={() => setStep(2)} disabled={!serviceType}
                className="flex items-center gap-2 px-6 py-3 bg-[#F2782E] text-white font-bold rounded-xl hover:bg-[#D9601A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Continue <ArrowRight className="h-4 w-4"/>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: details form ── */}
        {step === 2 && selectedType && (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0"/>{error}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-[#E8E5E0] divide-y divide-[#E8E5E0]">
              {/* Basic info */}
              <div className="p-6 space-y-5">
                <h3 className="font-bold text-[#0E0E0F]">Basic information</h3>
                <div>
                  <label className="block text-sm font-semibold text-[#0E0E0F] mb-1.5">Request title *</label>
                  <input required minLength={3} maxLength={200} value={form.title}
                    onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                    className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                    placeholder={
                      serviceType==='CYBERSECURITY' ? 'e.g. Q3 2025 VAPT of production environment' :
                      serviceType==='SOFTWARE_DEV'  ? 'e.g. Customer onboarding mobile app' :
                      serviceType==='CLOUD'         ? 'e.g. AWS to Azure migration' :
                      'e.g. Security architecture review'
                    }/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0E0E0F] mb-1.5">Description / scope *</label>
                  <textarea required minLength={10} rows={4} value={form.description}
                    onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                    className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                    placeholder="Describe what you need, the systems or context involved, and any constraints…"/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0E0E0F] mb-1.5">Budget range <span className="text-[#6B6F76] font-normal">(optional)</span></label>
                    <input value={form.budget} onChange={e=>setForm(f=>({...f,budget:e.target.value}))}
                      className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                      placeholder="e.g. $5k–$15k"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0E0E0F] mb-1.5">Desired deadline <span className="text-[#6B6F76] font-normal">(optional)</span></label>
                    <input type="date" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))}
                      className="w-full px-3 py-2.5 border border-[#E8E5E0] rounded-xl text-sm focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"/>
                  </div>
                </div>
              </div>

              {/* Service-specific fields */}
              <div className="p-6">
                <h3 className="font-bold text-[#0E0E0F] mb-5">{selectedType.label} details</h3>
                <MetadataFields serviceType={serviceType} metadata={metadata} onChange={setMetadata}/>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(1)} className="px-4 py-2.5 text-sm font-medium text-[#6B6F76] hover:text-[#0E0E0F]">
                ← Back
              </button>
              <button type="submit" disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-[#F2782E] text-white font-bold rounded-xl hover:bg-[#D9601A] disabled:opacity-50 transition-colors">
                {isLoading ? 'Submitting…' : 'Submit Request →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
