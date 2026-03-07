import { useState, useEffect } from 'react';
import { Wrench, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import Header from '../components/common/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Footer from '../components/common/Footer';
import WorkOrderCard from '../components/contractor/WorkOrderCard';
import StatusUpdateModal from '../components/contractor/StatusUpdateModal';
import * as issueApi from '../api/issueApi';
import { Issue, ISSUE_STATUSES } from '../types';
import toast from 'react-hot-toast';

const ContractorDashboard = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const response = await issueApi.getIssues({
        status: statusFilter as any || undefined,
      });

      const allIssues = response.data.issues;
      setIssues(allIssues);

      setStats({
        total: response.data.pagination.total,
        assigned: allIssues.filter((i) => i.status === 'assigned').length,
        inProgress: allIssues.filter((i) => i.status === 'in_progress').length,
        completed: allIssues.filter((i) => ['completed', 'resolved'].includes(i.status)).length,
      });
    } catch {
      toast.error('Failed to load work orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowUpdateModal(true);
  };

  const handleStatusSubmit = async (
    status: 'in_progress' | 'completed',
    description?: string,
    images?: File[]
  ) => {
    if (!selectedIssue) return;
    try {
      await issueApi.updateIssueStatus(selectedIssue._id, status, description, images);
      toast.success(
        status === 'completed'
          ? 'Work marked as completed! Awaiting municipality approval.'
          : 'Status updated to in progress'
      );
      setShowUpdateModal(false);
      setSelectedIssue(null);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const contractorStatuses = ISSUE_STATUSES.filter((s) =>
    ['assigned', 'in_progress', 'completed', 'resolved'].includes(s.value)
  );

  return (
    <div className="min-h-screen bg-primary-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Contractor Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your assigned work orders.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm animate-fade-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Wrench className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm animate-fade-up" style={{ ['--anim-delay' as any]: '60ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Start</p>
                <p className="text-2xl font-bold text-purple-600">{stats.assigned}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm animate-fade-up" style={{ ['--anim-delay' as any]: '120ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
              </div>
              <PlayCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm animate-fade-up" style={{ ['--anim-delay' as any]: '180ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-gray-600">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            {contractorStatuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Work Orders */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center animate-pop-in">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders yet</h3>
            <p className="text-gray-500">
              You'll see assigned work orders here once municipality assigns issues to you.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => (
              <WorkOrderCard
                key={issue._id}
                issue={issue}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}

        {/* Status Update Modal */}
        {showUpdateModal && selectedIssue && (
          <StatusUpdateModal
            issue={selectedIssue}
            onClose={() => {
              setShowUpdateModal(false);
              setSelectedIssue(null);
            }}
            onSubmit={handleStatusSubmit}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ContractorDashboard;
