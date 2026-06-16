import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, Users, FileText, Clock, CheckCircle, AlertCircle, 
  ChevronRight, LogOut, Bell, Search, Filter, Building2 
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
  PENDING: 'Pending',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  REPORTING: 'Reporting',
  COMPLETE: 'Complete',
  ON_HOLD: 'On Hold'
};

export default function AdminDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    clients: 0
  });
  
  const { user, logout, apiCall, isAdmin } = usePortal();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/portal/dashboard');
      return;
    }
    fetchAssessments();
    fetchStats();
  }, [isAdmin, navigate]);

  const fetchAssessments = async () => {
    try {
      const status = filter !== 'all' ? filter : '';
      const response = await apiCall(`/api/assessments?status=${status}`);
      const data = await response.json();
      
      if (response.ok) {
        setAssessments(data.assessments);
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiCall('/api/assessments');
      const data = await response.json();
      
      if (response.ok) {
        const assessments = data.assessments;
        const uniqueClients = new Set(assessments.map(a => a.organization.id));
        
        setStats({
          total: data.pagination.total,
          pending: assessments.filter(a => a.status === 'PENDING').length,
          inProgress: assessments.filter(a => ['IN_REVIEW', 'APPROVED', 'IN_PROGRESS', 'REPORTING'].includes(a.status)).length,
          completed: assessments.filter(a => a.status === 'COMPLETE').length,
          clients: uniqueClients.size
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/portal/login');
  };

  const filteredAssessments = assessments.filter(assessment => {
    const searchLower = search.toLowerCase();
    return (
      assessment.title.toLowerCase().includes(searchLower) ||
      assessment.organization.name.toLowerCase().includes(searchLower) ||
      assessment.scopeDescription.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <nav className="bg-ink text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-orange" />
              <span className="ml-2 text-xl font-bold">Kreatix VAPT Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-grey hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-orange rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-grey">{user?.name}</span>
                <span className="px-2 py-1 bg-orange text-white text-xs rounded-full">
                  {user?.role}
                </span>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-grey hover:text-white"
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
          <h1 className="text-3xl font-extrabold text-ink">Admin Dashboard</h1>
          <p className="mt-2 text-grey-dark">
            Manage all VAPT assessments and client communications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-grey">Pending Review</p>
                <p className="text-2xl font-bold text-ink">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-grey">In Progress</p>
                <p className="text-2xl font-bold text-ink">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-grey">Clients</p>
                <p className="text-2xl font-bold text-ink">{stats.clients}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-xl font-bold text-ink">All Assessments</h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey" />
                  <input
                    type="text"
                    placeholder="Search assessments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey" />
                  <select
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      fetchAssessments();
                    }}
                    className="pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETE">Complete</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {filteredAssessments.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-grey mx-auto mb-4" />
              <h3 className="text-lg font-medium text-ink mb-2">No assessments found</h3>
              <p className="text-grey">
                {search ? 'Try adjusting your search terms' : 'No assessments match the selected filter'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAssessments.map((assessment) => (
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
                        {assessment.assignedAdmin && (
                          <span className="ml-2 text-xs text-grey">
                            Assigned to: {assessment.assignedAdmin.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-grey mb-2">
                        <Building2 className="h-4 w-4 mr-1" />
                        {assessment.organization.name}
                        <span className="mx-2">•</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {assessment.organization.subdomain}
                        </span>
                      </div>
                      
                      <p className="text-sm text-grey line-clamp-2 mb-3">
                        {assessment.scopeDescription}
                      </p>
                      
                      <div className="flex items-center text-xs text-grey space-x-4">
                        <span>{assessment._count.messages} messages</span>
                        <span>{assessment._count.attachments} attachments</span>
                        <span>{new Date(assessment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-grey ml-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
