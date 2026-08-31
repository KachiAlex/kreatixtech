import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Shield, AlertTriangle, AlertCircle, Info, CheckCircle2,
  ChevronDown, ChevronUp, FileText, Lock, ExternalLink,
  Loader2
} from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';

const severityConfig = {
  CRITICAL: { color: 'bg-red-600', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle },
  HIGH: { color: 'bg-orange-500', text: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle },
  MEDIUM: { color: 'bg-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle },
  LOW: { color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Info },
  INFO: { color: 'bg-gray-400', text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', icon: Info },
};

const statusColors = {
  OPEN: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  ACCEPTED_RISK: 'bg-gray-100 text-gray-700',
  FALSE_POSITIVE: 'bg-gray-100 text-gray-500',
};

export default function ReportViewer() {
  const { id } = useParams();
  const { apiCall, user, isAdmin } = usePortal();
  const [findings, setFindings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchFindings();
    fetchSummary();
  }, [id]);

  const fetchFindings = async () => {
    try {
      const response = await apiCall(`/api/service-findings/request/${id}`);
      const data = await response.json();
      setFindings(data);
    } catch (err) {
      console.error('Failed to fetch findings:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await apiCall(`/api/service-findings/request/${id}/summary`);
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (findingId, newStatus) => {
    try {
      const response = await apiCall(`/api/service-findings/${findingId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchFindings();
        fetchSummary();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const toggleExpand = (findingId) => {
    setExpanded(prev => ({ ...prev, [findingId]: !prev[findingId] }));
  };

  const filteredFindings = findings.filter(f => {
    if (filterSeverity !== 'ALL' && f.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && f.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-orange animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite pb-12">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-orange" />
            <h1 className="text-2xl font-bold text-ink">Service Report</h1>
          </div>
          <p className="text-grey text-sm">Request ID: {id.slice(0, 8)}</p>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {findings.filter(f => f.severity === 'CRITICAL').length}
                </p>
                <p className="text-xs text-red-500 font-medium mt-1">Critical</p>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-orange-500">
                  {findings.filter(f => f.severity === 'HIGH').length}
                </p>
                <p className="text-xs text-orange-500 font-medium mt-1">High</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{summary.resolved}</p>
                <p className="text-xs text-green-600 font-medium mt-1">Resolved</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-ink">{summary.total}</p>
                <p className="text-xs text-grey font-medium mt-1">Total</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-white"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFO">Info</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ACCEPTED_RISK">Accepted Risk</option>
          </select>
        </div>

        {/* Findings List */}
        {filteredFindings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-border">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-grey">No findings match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFindings.map(finding => {
              const config = severityConfig[finding.severity];
              const Icon = config.icon;
              const isOpen = expanded[finding.id];

              return (
                <div
                  key={finding.id}
                  className={`bg-white rounded-xl border ${config.border} overflow-hidden transition-shadow hover:shadow-md`}
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleExpand(finding.id)}
                    className="w-full flex items-center gap-4 p-5 text-left"
                  >
                    <div className={`w-2 h-10 rounded-full ${config.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${config.bg} ${config.text}`}>
                          {finding.severity}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[finding.status]}`}>
                          {finding.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-grey">{finding.category}</span>
                      </div>
                      <h3 className="font-semibold text-ink mt-1 truncate">{finding.title}</h3>
                      {finding.affectedUrl && (
                        <p className="text-xs text-grey mt-0.5 flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {finding.affectedUrl}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {finding.cvssScore && (
                        <span className="text-sm font-mono font-bold text-ink">{finding.cvssScore}</span>
                      )}
                      {isOpen ? <ChevronUp className="h-5 w-5 text-grey" /> : <ChevronDown className="h-5 w-5 text-grey" />}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                      <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <h4 className="text-sm font-semibold text-ink mb-2 flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4 text-orange" />
                            Description
                          </h4>
                          <p className="text-sm text-grey-dark leading-relaxed whitespace-pre-wrap">{finding.description}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-ink mb-2 flex items-center gap-1.5">
                            <Lock className="h-4 w-4 text-green-600" />
                            Remediation
                          </h4>
                          <p className="text-sm text-grey-dark leading-relaxed whitespace-pre-wrap">{finding.remediation}</p>
                        </div>
                      </div>

                      {finding.evidence && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-ink mb-2 flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-blue-500" />
                            Evidence
                          </h4>
                          <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 overflow-x-auto font-mono">
                            {finding.evidence}
                          </pre>
                        </div>
                      )}

                      {/* Status Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {isAdmin ? (
                          <>
                            {finding.status !== 'OPEN' && (
                              <button onClick={() => updateStatus(finding.id, 'OPEN')} className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100">
                                Mark Open
                              </button>
                            )}
                            {finding.status !== 'RESOLVED' && (
                              <button onClick={() => updateStatus(finding.id, 'RESOLVED')} className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg border border-green-100 hover:bg-green-100">
                                Mark Resolved
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {finding.status === 'OPEN' && (
                              <button onClick={() => updateStatus(finding.id, 'IN_PROGRESS')} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100">
                                Start Remediation
                              </button>
                            )}
                            {finding.status === 'IN_PROGRESS' && (
                              <button onClick={() => updateStatus(finding.id, 'RESOLVED')} className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg border border-green-100 hover:bg-green-100">
                                Mark Resolved
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
