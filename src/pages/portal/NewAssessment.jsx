import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, X, ExternalLink, Server, FileText, 
  ChevronDown, AlertCircle 
} from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';

const testingTypes = [
  { value: 'BLACK_BOX', label: 'Black Box', description: 'No prior knowledge of the system' },
  { value: 'GREY_BOX', label: 'Grey Box', description: 'Limited knowledge of the system' },
  { value: 'WHITE_BOX', label: 'White Box', description: 'Full knowledge of the system' }
];

export default function NewAssessment() {
  const [formData, setFormData] = useState({
    title: '',
    scopeDescription: '',
    targetUrls: [''],
    ipRanges: [''],
    testingType: 'GREY_BOX',
    specialReqs: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { apiCall } = usePortal();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const data = {
      ...formData,
      targetUrls: formData.targetUrls.filter(url => url.trim()),
      ipRanges: formData.ipRanges.filter(ip => ip.trim())
    };

    try {
      const response = await apiCall('/api/assessments', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        navigate(`/portal/assessment/${result.id}`);
      } else {
        setError(result.error || 'Failed to create assessment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addTargetUrl = () => {
    setFormData(prev => ({
      ...prev,
      targetUrls: [...prev.targetUrls, '']
    }));
  };

  const removeTargetUrl = (index) => {
    setFormData(prev => ({
      ...prev,
      targetUrls: prev.targetUrls.filter((_, i) => i !== index)
    }));
  };

  const updateTargetUrl = (index, value) => {
    setFormData(prev => ({
      ...prev,
      targetUrls: prev.targetUrls.map((url, i) => i === index ? value : url)
    }));
  };

  const addIpRange = () => {
    setFormData(prev => ({
      ...prev,
      ipRanges: [...prev.ipRanges, '']
    }));
  };

  const removeIpRange = (index) => {
    setFormData(prev => ({
      ...prev,
      ipRanges: prev.ipRanges.filter((_, i) => i !== index)
    }));
  };

  const updateIpRange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      ipRanges: prev.ipRanges.map((ip, i) => i === index ? value : ip)
    }));
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/portal/dashboard')}
            className="inline-flex items-center text-grey hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-ink">New VAPT Assessment</h1>
          <p className="mt-2 text-grey-dark">
            Provide details about the scope of your security assessment
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-ink mb-2">
                Assessment Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                minLength={3}
                maxLength={200}
                value={formData.title}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent"
                placeholder="e.g., Q4 2024 Web Application Security Assessment"
              />
            </div>

            <div>
              <label htmlFor="scopeDescription" className="block text-sm font-medium text-ink mb-2">
                Scope Description *
              </label>
              <textarea
                id="scopeDescription"
                name="scopeDescription"
                required
                minLength={10}
                rows={4}
                value={formData.scopeDescription}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent resize-none"
                placeholder="Describe what systems, applications, or networks should be included in the assessment..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Target URLs
              </label>
              <div className="space-y-2">
                {formData.targetUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateTargetUrl(index, e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent"
                        placeholder="https://example.com"
                      />
                    </div>
                    {formData.targetUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTargetUrl(index)}
                        className="p-3 text-grey hover:text-red-600 border border-border rounded-xl"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTargetUrl}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange hover:text-orange-deep"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add another URL
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                IP Ranges
              </label>
              <div className="space-y-2">
                {formData.ipRanges.map((ip, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey" />
                      <input
                        type="text"
                        value={ip}
                        onChange={(e) => updateIpRange(index, e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent"
                        placeholder="192.168.1.0/24 or 10.0.0.1-10.0.0.100"
                      />
                    </div>
                    {formData.ipRanges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIpRange(index)}
                        className="p-3 text-grey hover:text-red-600 border border-border rounded-xl"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIpRange}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange hover:text-orange-deep"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add another IP range
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Testing Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {testingTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      formData.testingType === type.value
                        ? 'border-orange bg-orange/5'
                        : 'border-border hover:border-grey'
                    }`}
                  >
                    <input
                      type="radio"
                      name="testingType"
                      value={type.value}
                      checked={formData.testingType === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-semibold text-ink">{type.label}</span>
                    <span className="text-sm text-grey mt-1">{type.description}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="specialReqs" className="block text-sm font-medium text-ink mb-2">
                Special Requirements
              </label>
              <textarea
                id="specialReqs"
                name="specialReqs"
                rows={3}
                value={formData.specialReqs}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent resize-none"
                placeholder="Any specific compliance requirements, testing windows, or other special considerations..."
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-offwhite border-t border-border flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/portal/dashboard')}
              className="px-6 py-3 text-grey font-medium hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-orange text-white font-medium rounded-xl hover:bg-orange-deep disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
