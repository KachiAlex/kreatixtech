import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, User, Shield, Check, AlertCircle, ExternalLink, Server, Plus, X } from 'lucide-react';
import { trackClick } from '../services/analytics';

const API_URL = import.meta.env.VITE_API_URL || '';

const serviceTypes = [
  { value: 'CYBERSECURITY', label: 'Cybersecurity / VAPT' },
  { value: 'SOFTWARE_DEV', label: 'Software Development' },
  { value: 'CLOUD', label: 'Cloud Services' },
  { value: 'CONSULTING', label: 'IT Consultancy' },
];

const testingTypes = [
  { value: 'BLACK_BOX', label: 'Black Box', description: 'No prior knowledge of the system' },
  { value: 'GREY_BOX', label: 'Grey Box', description: 'Limited knowledge of the system' },
  { value: 'WHITE_BOX', label: 'White Box', description: 'Full knowledge of the system' },
];

export default function RequestAssessmentPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [refId, setRefId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    serviceType: 'CYBERSECURITY',
    title: '',
    scopeDescription: '',
    targetUrls: [''],
    ipRanges: [''],
    testingType: 'GREY_BOX',
    specialReqs: '',
    website: '', // honeypot
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addTargetUrl = () => setFormData(prev => ({ ...prev, targetUrls: [...prev.targetUrls, ''] }));
  const removeTargetUrl = (i) => setFormData(prev => ({ ...prev, targetUrls: prev.targetUrls.filter((_, idx) => idx !== i) }));
  const updateTargetUrl = (i, val) => setFormData(prev => ({ ...prev, targetUrls: prev.targetUrls.map((u, idx) => idx === i ? val : u) }));
  const addIpRange = () => setFormData(prev => ({ ...prev, ipRanges: [...prev.ipRanges, ''] }));
  const removeIpRange = (i) => setFormData(prev => ({ ...prev, ipRanges: prev.ipRanges.filter((_, idx) => idx !== i) }));
  const updateIpRange = (i, val) => setFormData(prev => ({ ...prev, ipRanges: prev.ipRanges.map((ip, idx) => idx === i ? val : ip) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const data = {
      ...formData,
      targetUrls: formData.targetUrls.filter(u => u.trim()),
      ipRanges: formData.ipRanges.filter(ip => ip.trim()),
    };

    try {
      trackClick('assessment_request_submitted');
      const response = await fetch(`${API_URL}/api/public/service-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok) {
        setRefId(result.id?.substring(0, 8).toUpperCase() || '');
        setSubmitted(true);
      } else {
        setError(result.error || result.errors?.[0]?.msg || 'Failed to submit request');
      }
    } catch {
      setError('Network error. Please try again or email us at info@kreatixtech.com');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F5F2]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl border border-[#E8E5E0] p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#1a1a1a] mb-3">Request Received!</h1>
            <p className="text-[#666] text-lg mb-2">
              Thank you{formData.name ? `, ${formData.name.split(' ')[0]}` : ''}. We've received your request
              and our team will review it within 24 hours.
            </p>
            {refId && (
              <p className="text-sm text-[#999] mb-6">Reference: {refId}</p>
            )}
            <p className="text-[#666] mb-8">
              A confirmation email has been sent to <strong>{formData.email}</strong>.
              Our security team will contact you shortly to discuss next steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/" className="px-6 py-3 bg-[#F2782E] text-white font-medium rounded-xl hover:bg-[#D9601A] transition-colors">
                Back to Home
              </Link>
              <Link to="/contact" className="px-6 py-3 border border-[#E8E5E0] text-[#1a1a1a] font-medium rounded-xl hover:bg-[#F7F5F2] transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E5E0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-[#666] hover:text-[#1a1a1a]">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-[#F2782E]/10 text-[#F2782E] px-3 py-1.5 rounded-full text-sm font-medium mb-3">
            <Zap className="h-4 w-4" /> Quick Request — No Account Needed
          </div>
          <h1 className="text-3xl font-extrabold text-[#1a1a1a]">Request an Assessment</h1>
          <p className="mt-2 text-[#666]">
            Fill out the form below and our team will get back to you within 24 hours.
            Prefer to track your request online?{' '}
            <Link to="/portal/login" className="text-[#F2782E] font-medium hover:underline">
              Login or register here
            </Link>.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E8E5E0] overflow-hidden">
          {/* Contact Info */}
          <div className="p-6 space-y-5">
            <h2 className="text-lg font-bold text-[#1a1a1a] pb-2 border-b border-[#E8E5E0]">Your Contact Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#1a1a1a] mb-2">Full Name *</label>
                <input type="text" id="name" name="name" required minLength={2} maxLength={100}
                  value={formData.name} onChange={handleChange}
                  className="block w-full px-4 py-3 border border-[#E8E5E0] rounded-xl focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                  placeholder="John Doe" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] mb-2">Email *</label>
                <input type="email" id="email" name="email" required
                  value={formData.email} onChange={handleChange}
                  className="block w-full px-4 py-3 border border-[#E8E5E0] rounded-xl focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                  placeholder="john@company.com" />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-[#1a1a1a] mb-2">Company</label>
                <input type="text" id="company" name="company"
                  value={formData.company} onChange={handleChange}
                  className="block w-full px-4 py-3 border border-[#E8E5E0] rounded-xl focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                  placeholder="Acme Inc." />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#1a1a1a] mb-2">Phone</label>
                <input type="tel" id="phone" name="phone"
                  value={formData.phone} onChange={handleChange}
                  className="block w-full px-4 py-3 border border-[#E8E5E0] rounded-xl focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                  placeholder="+1 234 567 890" />
              </div>
            </div>

            {/* Service Details */}
            <h2 className="text-lg font-bold text-[#1a1a1a] pt-4 pb-2 border-b border-[#E8E5E0]">Service Details</h2>

            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-[#1a1a1a] mb-2">Service Type *</label>
              <select id="serviceType" name="serviceType" value={formData.serviceType} onChange={handleChange}
                className="block w-full px-4 py-3 border border-[#E8E5E0] rounded-xl focus:ring-2 focus:ring-[#F2782E] focus:border-transparent bg-white">
                {serviceTypes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#1a1a1a] mb-2">Assessment Title *</label>
              <input type="text" id="title" name="title" required minLength={3} maxLength={200}
                value={formData.title} onChange={handleChange}
                className="block w-full px-4 py-3 border border-[#E8E5E0] rounded-xl focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                placeholder="e.g., Q4 2026 Web Application Security Assessment" />
            </div>

            <div>
              <label htmlFor="scopeDescription" className="block text-sm font-medium text-[#1a1a1a] mb-2">Scope Description *</label>
              <textarea id="scopeDescription" name="scopeDescription" required minLength={10} rows={4}
                value={formData.scopeDescription} onChange={handleChange}
                className="block w-full px-4 py-3 border border-[#E8E5E0] rounded-xl focus:ring-2 focus:ring-[#F2782E] focus:border-transparent resize-none"
                placeholder="Describe what systems, applications, or networks should be included in the assessment..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Target URLs</label>
              <div className="space-y-2">
                {formData.targetUrls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="relative flex-1">
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#999]" />
                      <input type="url" value={url} onChange={(e) => updateTargetUrl(i, e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 border border-[#E8E5E0] rounded-xl focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                        placeholder="https://example.com" />
                    </div>
                    {formData.targetUrls.length > 1 && (
                      <button type="button" onClick={() => removeTargetUrl(i)} className="p-3 text-[#999] hover:text-red-600 border border-[#E8E5E0] rounded-xl">
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addTargetUrl} className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#F2782E] hover:text-[#D9601A]">
                  <Plus className="h-4 w-4 mr-1" /> Add another URL
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">IP Ranges</label>
              <div className="space-y-2">
                {formData.ipRanges.map((ip, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="relative flex-1">
                      <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#999]" />
                      <input type="text" value={ip} onChange={(e) => updateIpRange(i, e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 border border-[#E8E5E0] rounded-xl focus:ring-2 focus:ring-[#F2782E] focus:border-transparent"
                        placeholder="192.168.1.0/24 or 10.0.0.1-10.0.0.100" />
                    </div>
                    {formData.ipRanges.length > 1 && (
                      <button type="button" onClick={() => removeIpRange(i)} className="p-3 text-[#999] hover:text-red-600 border border-[#E8E5E0] rounded-xl">
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addIpRange} className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#F2782E] hover:text-[#D9601A]">
                  <Plus className="h-4 w-4 mr-1" /> Add another IP range
                </button>
              </div>
            </div>

            {formData.serviceType === 'CYBERSECURITY' && (
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Testing Type</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {testingTypes.map(type => (
                    <label key={type.value}
                      className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-colors ${formData.testingType === type.value ? 'border-[#F2782E] bg-[#F2782E]/5' : 'border-[#E8E5E0] hover:border-[#ccc]'}`}>
                      <input type="radio" name="testingType" value={type.value} checked={formData.testingType === type.value} onChange={handleChange} className="sr-only" />
                      <span className="font-semibold text-[#1a1a1a]">{type.label}</span>
                      <span className="text-sm text-[#666] mt-1">{type.description}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="specialReqs" className="block text-sm font-medium text-[#1a1a1a] mb-2">Special Requirements</label>
              <textarea id="specialReqs" name="specialReqs" rows={3}
                value={formData.specialReqs} onChange={handleChange}
                className="block w-full px-4 py-3 border border-[#E8E5E0] rounded-xl focus:ring-2 focus:ring-[#F2782E] focus:border-transparent resize-none"
                placeholder="Any specific compliance requirements, testing windows, or other special considerations..." />
            </div>

            {/* Honeypot — hidden from real users */}
            <input type="text" name="website" value={formData.website} onChange={handleChange}
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} tabIndex={-1} autoComplete="off" />
          </div>

          {/* Submit */}
          <div className="px-6 py-4 bg-[#F7F5F2] border-t border-[#E8E5E0] flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#666] text-center sm:text-left">
              We'll email you within 24 hours. No account needed.
            </p>
            <button type="submit" disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3 bg-[#F2782E] text-white font-medium rounded-xl hover:bg-[#D9601A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
