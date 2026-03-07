import { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Calendar, MapPin, Briefcase, User } from 'lucide-react';
import { Issue } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

interface ResolutionApprovalModalProps {
  issue: Issue;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onReject: (rejectionReason: string) => Promise<void>;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ResolutionApprovalModal = ({
  issue,
  onClose,
  onApprove,
  onReject,
}: ResolutionApprovalModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const reporterName = issue.reportedBy?.profile?.name ?? 'Unknown reporter';
  const contractorName = issue.assignedTo?.profile?.name ?? '—';
  const contractorCompany = issue.assignedTo?.contractor?.company;
  const locationText =
    issue.location.address ||
    `${issue.location.coordinates[1]}, ${issue.location.coordinates[0]}`;

  const handleApprove = async () => {
    setIsLoading(true);
    await onApprove();
    setIsLoading(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setIsLoading(true);
    await onReject(rejectionReason.trim());
    setIsLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Review completed work"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900">Review Completed Work</h2>
            <p className="text-sm text-gray-500 break-all mt-1">#{issue._id}</p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Issue summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Issue</p>
            <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>

            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm text-gray-800 break-words">{locationText}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Reported by</p>
                  <p className="text-sm text-gray-800">{reporterName}</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Contractor</p>
                  <p className="text-sm text-gray-800">
                    {contractorName}
                    {contractorCompany ? ` (${contractorCompany})` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Completed date</p>
                  <p className="text-sm text-gray-800">
                    {formatDate(issue.resolutionDetails?.completedDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contractor completion details */}
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-teal-900 mb-3">Work Done (Contractor)</p>

            {issue.resolutionDetails?.description ? (
              <div className="mb-4">
                <p className="text-xs text-teal-700 mb-1">Work description</p>
                <p className="text-sm text-teal-900 whitespace-pre-wrap">
                  {issue.resolutionDetails.description}
                </p>
              </div>
            ) : (
              <p className="text-sm text-teal-800 mb-4">No work description provided.</p>
            )}

            {issue.resolutionDetails?.images?.length ? (
              <div>
                <p className="text-xs text-teal-700 mb-2">Completion photos</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {issue.resolutionDetails.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <img
                        src={img.url}
                        alt={`Completion photo ${idx + 1}`}
                        className="w-full h-28 object-cover rounded-xl"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-teal-800">No completion photos uploaded.</p>
            )}
          </div>

          {/* Rejection reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason (required for rejection)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Explain what needs to be fixed..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : <CheckCircle className="w-5 h-5" />}
              Approve (+20 pts to citizen)
            </button>
            <button
              onClick={handleReject}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : <XCircle className="w-5 h-5" />}
              Reject (send back for rework)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolutionApprovalModal;

