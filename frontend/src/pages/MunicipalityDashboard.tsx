import { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle, Clock, Users, Search, Filter } from 'lucide-react';
import Header from '../components/common/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Footer from '../components/common/Footer';
import IssueTable from '../components/municipality/IssueTable';
import VerifyModal from '../components/municipality/VerifyModal';
import AssignModal from '../components/municipality/AssignModal';
import ResolutionApprovalModal from '../components/municipality/ResolutionApprovalModal';
import * as issueApi from '../api/issueApi';
import { Issue, ISSUE_STATUSES, ISSUE_CATEGORIES, IssueStatus, IssueCategory } from '../types';
import toast from 'react-hot-toast';

const MunicipalityDashboard = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<IssueStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    resolved: 0,
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter, categoryFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const issuesRes = await issueApi.getIssues({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        limit: 100,
      });

      const allIssues = issuesRes.data.issues;
      setIssues(allIssues);

      setStats({
        total: issuesRes.data.pagination.total,
        pending: allIssues.filter((i) => i.status === 'pending').length,
        verified: allIssues.filter((i) => ['verified', 'assigned', 'in_progress'].includes(i.status)).length,
        resolved: allIssues.filter((i) => i.status === 'resolved').length,
      });
    } catch {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowVerifyModal(true);
  };

  const handleAssign = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowAssignModal(true);
  };

  const handleReviewResolution = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowResolutionModal(true);
  };

  const handleResolutionApprove = async () => {
    if (!selectedIssue) return;
    try {
      const response = await issueApi.resolveIssue(selectedIssue._id);
      const pointsAwarded = response.data.pointsAwarded ?? 0;
      toast.success(
        pointsAwarded > 0
          ? `Work approved! Citizen awarded ${pointsAwarded} points.`
          : 'Work approved!'
      );
      setShowResolutionModal(false);
      setSelectedIssue(null);
      fetchData();
    } catch {
      toast.error('Failed to approve work');
    }
  };

  const handleResolutionReject = async (rejectionReason: string) => {
    if (!selectedIssue) return;
    try {
      await issueApi.rejectResolution(selectedIssue._id, rejectionReason);
      toast.success('Work rejected and sent back for rework');
      setShowResolutionModal(false);
      setSelectedIssue(null);
      fetchData();
    } catch {
      toast.error('Failed to reject work');
    }
  };

  const handleVerifySubmit = async (approved: boolean, rejectionReason?: string, priority?: string) => {
    if (!selectedIssue) return;
    try {
      const response = await issueApi.verifyIssue(selectedIssue._id, approved, rejectionReason, priority as any);
      if (approved) {
        const pointsAwarded = response.data.pointsAwarded ?? 0;
        toast.success(
          pointsAwarded > 0
            ? `Issue verified! Citizen awarded ${pointsAwarded} points.`
            : 'Issue verified!'
        );
      } else {
        toast.success('Issue rejected');
      }
      setShowVerifyModal(false);
      setSelectedIssue(null);
      fetchData();
    } catch {
      toast.error('Failed to verify issue');
    }
  };

  const handleAssignSubmit = async (contractorId: string) => {
    if (!selectedIssue) return;
    try {
      await issueApi.assignIssue(selectedIssue._id, contractorId);
      toast.success('Issue assigned to contractor');
      setShowAssignModal(false);
      setSelectedIssue(null);
      fetchData();
    } catch {
      toast.error('Failed to assign issue');
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      issue.description.toLowerCase().includes(query) ||
      issue.location.address?.toLowerCase().includes(query) ||
      (issue.reportedBy?.profile?.name ?? '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-primary-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Municipality Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and verify civic issues in your jurisdiction.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm animate-fade-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Issues</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm animate-fade-up" style={{ ['--anim-delay' as any]: '60ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm animate-fade-up" style={{ ['--anim-delay' as any]: '120ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm animate-fade-up" style={{ ['--anim-delay' as any]: '180ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 animate-fade-up" style={{ ['--anim-delay' as any]: '240ms' }}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as IssueStatus | '')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Status</option>
                  {ISSUE_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as IssueCategory | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {ISSUE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Issues Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <IssueTable
            issues={filteredIssues}
            onVerify={handleVerify}
            onAssign={handleAssign}
            onResolve={handleReviewResolution}
          />
        )}

        {/* Modals */}
        {showVerifyModal && selectedIssue && (
          <VerifyModal
            issue={selectedIssue}
            onClose={() => {
              setShowVerifyModal(false);
              setSelectedIssue(null);
            }}
            onSubmit={handleVerifySubmit}
          />
        )}

        {showAssignModal && selectedIssue && (
          <AssignModal
            issue={selectedIssue}
            onClose={() => {
              setShowAssignModal(false);
              setSelectedIssue(null);
            }}
            onSubmit={handleAssignSubmit}
          />
        )}

        {showResolutionModal && selectedIssue && (
          <ResolutionApprovalModal
            issue={selectedIssue}
            onClose={() => {
              setShowResolutionModal(false);
              setSelectedIssue(null);
            }}
            onApprove={handleResolutionApprove}
            onReject={handleResolutionReject}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MunicipalityDashboard;
