import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, FileText, MessageSquare, Clock, CheckCircle, 
  AlertCircle, ChevronRight, LogOut, Bell, Building2 
} from 'lucide-react';
import { usePortal } from '../../contexts/PortalContext';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  REPORTING: 'bg-orange-100 text-orange-800',
  COMPLETE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  PENDING: 'Pending Review',
  IN_REVIEW: 'In Review',
  APPROVED: 'Scope Approved',
  IN_PROGRESS: 'Testing In Progress',
  REPORTING: 'Report Generation',
  COMPLETE: 'Complete',
  ON_HOLD: 'On Hold'
};

export default function ClientDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0
  });
  
  const { user, logout, apiCall, isClient, isAdmin } = usePortal();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/portal/admin', { replace: true });
      return;
    }
    if (!isClient) {
      navigate('/portal/admin');
      return;
    }
    fetchAssessments();
  }, [isClient, isAdmin, navigate]);

  const fetchAssessments = async () => {
    try {
      const response = await apiCall('/api/assessments');
      const data = await response.json();
      
      if (response.ok) {
        setAssessments(data.assessments);
        setStats({
          total: data.pagination.total,
          active: data.assessments.filter(a => 
            ['PENDING', 'IN_REVIEW', 'APPROVED', 'IN_PROGRESS', 'REPORTING'].includes(a.status)
          ).length,
          completed: data.assessments.filter(a => a.status === 'COMPLETE').length
        });
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/portal/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <nav className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-orange" />
              <span className="ml-2 text-xl font-bold text-ink">
                {user?.organization?.name || 'VAPT Portal'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-grey hover:text-ink">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-orange rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-grey-dark">{user?.name}</span>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-grey hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-ink">Assessment Dashboard</h1>
          <p className="mt-2 text-grey-dark">
            Manage your vulnerability assessment and penetration testing requests
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-grey">Total Assessments</p>
                <p className="text-2xl font-bold text-ink">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-border">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="h-6 w-6 text-orange" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-grey">Active</p>
                <p className="text-2xl font-bold text-ink">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-grey">Completed</p>
                <p className="text-2xl font-bold text-ink">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-ink">Your Assessments</h2>
          <Link
            to="/portal/assessment/new"
            className="inline-flex items-center px-4 py-2 bg-orange text-white rounded-xl font-medium hover:bg-orange-deep transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Assessment
          </Link>
        </div>

        {assessments.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <AlertCircle className="h-12 w-12 text-grey mx-auto mb-4" />
            <h3 className="text-lg font-medium text-ink mb-2">No assessments yet</h3>
            <p className="text-grey mb-6">
              Get started by creating your first VAPT assessment request
            </p>
            <Link
              to="/portal/assessment/new"
              className="inline-flex items-center px-4 py-2 bg-orange text-white rounded-xl font-medium hover:bg-orange-deep"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Assessment
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {assessments.map((assessment) => (
                <Link
                  key={assessment.id}
                  to={`/portal/assessment/${assessment.id}`}
                  className="block p-6 hover:bg-offwhite transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-ink mr-3">
                          {assessment.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[assessment.status]}`}>
                          {statusLabels[assessment.status]}
                        </span>
                      </div>
                      <p className="text-sm text-grey mb-3 line-clamp-2">
                        {assessment.scopeDescription}
                      </p>
                      <div className="flex items-center text-sm text-grey space-x-4">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </span>
                        {assessment._count.messages > 0 && (
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {assessment._count.messages} messages
                          </span>
                        )}
                        {assessment._count.attachments > 0 && (
                          <span className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {assessment._count.attachments} files
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-grey ml-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
