import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Clock, Award, TrendingUp } from 'lucide-react';
import Header from '../components/common/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Footer from '../components/common/Footer';
import IssueCard from '../components/citizen/IssueCard';
import IssueDetailsModal from '../components/citizen/IssueDetailsModal';
import { useAuth } from '../contexts/AuthContext';
import * as issueApi from '../api/issueApi';
import * as userApi from '../api/userApi';
import { Issue, ISSUE_STATUSES } from '../types';
import toast from 'react-hot-toast';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    points: 0,
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const [issuesRes, pointsRes] = await Promise.all([
        issueApi.getIssues({ status: statusFilter as any || undefined }),
        userApi.getPoints(),
      ]);

      setIssues(issuesRes.data.issues);
      setStats({
        total: issuesRes.data.pagination.total,
        pending: issuesRes.data.issues.filter((i) => i.status === 'pending').length,
        resolved: issuesRes.data.issues.filter((i) => i.status === 'resolved').length,
        points: pointsRes.data.totalPoints,
      });
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIssue = async (id: string) => {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    try {
      await issueApi.deleteIssue(id);
      toast.success('Issue deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete issue');
    }
  };

  return (
    <div className="min-h-screen bg-primary-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.profile?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Track your reported issues and earn rewards for contributing to your community.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm animate-fade-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm animate-fade-up" style={{ ['--anim-delay' as any]: '60ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm animate-fade-up" style={{ ['--anim-delay' as any]: '120ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm animate-fade-up" style={{ ['--anim-delay' as any]: '180ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Points Earned</p>
                <p className="text-2xl font-bold text-orange-600">{stats.points}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter by:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              {ISSUE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <Link
            to="/citizen/report"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Report Issue</span>
          </Link>
        </div>

        {/* Issues List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center animate-pop-in">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No issues reported yet</h3>
            <p className="text-gray-500 mb-6">
              Start contributing to your community by reporting civic issues.
            </p>
            <Link
              to="/citizen/report"
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Report Your First Issue</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                onDelete={handleDeleteIssue}
                onView={setSelectedIssue}
              />
            ))}
          </div>
        )}
      </main>

      {selectedIssue && (
        <IssueDetailsModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      )}
      <Footer />
    </div>
  );
};

export default CitizenDashboard;
