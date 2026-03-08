import { useEffect } from 'react';
import { X, MapPin, Calendar, Clock, User, Briefcase } from 'lucide-react';
import {
  Issue,
  ISSUE_CATEGORIES,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
} from '../../types';

interface IssueDetailsModalProps {
  issue: Issue;
  onClose: () => void;
  onFeedback?: (issue: Issue) => void;
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

const IssueDetailsModal = ({ issue, onClose, onFeedback }: IssueDetailsModalProps) => {
  const statusConfig = ISSUE_STATUSES.find((s) => s.value === issue.status);
  const categoryConfig = ISSUE_CATEGORIES.find((c) => c.value === issue.category);
  const priorityConfig = ISSUE_PRIORITIES.find((p) => p.value === issue.priority);
  const address = issue.location.address;
  const latitude = issue.location.coordinates[1];
  const longitude = issue.location.coordinates[0];
  const coordsLabel = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Issue details"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}>
                {statusConfig?.label}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {categoryConfig?.label}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig?.color}`}>
                Priority: {priorityConfig?.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 break-all">#{issue._id}</p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {issue.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
              {issue.images.map((img, idx) => (
                <a
                  key={idx}
                  href={img.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <img
                    src={img.url}
                    alt={`Issue image ${idx + 1}`}
                    className="w-full h-32 md:h-40 object-cover rounded-xl"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="font-medium">Location</span>
                </div>
                <div className="space-y-1">
                  {address && <p className="text-gray-800 break-words">{address}</p>}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary-600 hover:underline break-all"
                  >
                    {coordsLabel}
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="font-medium">Reported</span>
                </div>
                <p className="text-gray-800">{formatDate(issue.createdAt)}</p>
                <div className="flex items-center text-gray-600 text-sm mt-3 mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-medium">Last updated</span>
                </div>
                <p className="text-gray-800">{formatDate(issue.updatedAt)}</p>
              </div>
            </div>

            {(issue.status === 'rejected' || issue.rejectionReason) && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-red-800 mb-2">Rejection reason</h3>
                <p className="text-red-700 whitespace-pre-wrap">
                  {issue.rejectionReason || '—'}
                </p>
              </div>
            )}

            {(issue.verifiedBy || issue.verificationDate) && (
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-primary-900 mb-3">Verification</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-primary-700 mt-0.5" />
                    <div>
                      <p className="text-xs text-primary-700">Verified by</p>
                      <p className="text-sm text-primary-900">
                        {issue.verifiedBy?.profile?.name || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-primary-700 mt-0.5" />
                    <div>
                      <p className="text-xs text-primary-700">Verification date</p>
                      <p className="text-sm text-primary-900">{formatDate(issue.verificationDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(issue.assignedTo || issue.assignmentDate) && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-purple-900 mb-3">Assignment</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 text-purple-700 mt-0.5" />
                    <div>
                      <p className="text-xs text-purple-700">Assigned to</p>
                      <p className="text-sm text-purple-900">
                        {issue.assignedTo?.profile?.name || '—'}
                        {issue.assignedTo?.contractor?.company
                          ? ` (${issue.assignedTo.contractor.company})`
                          : ''}
                      </p>
                      {issue.assignedTo?.email && (
                        <p className="text-xs text-purple-700 break-all">{issue.assignedTo.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-purple-700 mt-0.5" />
                    <div>
                      <p className="text-xs text-purple-700">Assignment date</p>
                      <p className="text-sm text-purple-900">{formatDate(issue.assignmentDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {issue.resolutionDetails && (
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-primary-900 mb-3">Resolution</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-primary-700 mb-1">Completed date</p>
                    <p className="text-sm text-primary-900">
                      {formatDate(issue.resolutionDetails.completedDate)}
                    </p>
                    {issue.resolutionDetails.description && (
                      <>
                        <p className="text-xs text-primary-700 mt-3 mb-1">Work description</p>
                        <p className="text-sm text-primary-900 whitespace-pre-wrap">
                          {issue.resolutionDetails.description}
                        </p>
                      </>
                    )}
                  </div>

                  {issue.resolutionDetails.images.length > 0 && (
                    <div>
                      <p className="text-xs text-primary-700 mb-2">Completion photos</p>
                      <div className="grid grid-cols-3 gap-2">
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
                              alt={`Resolution image ${idx + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(issue.pointsAwarded || issue.resolutionPointsAwarded) && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-green-900 mb-2">Points</h3>
                <p className="text-sm text-green-800">
                  Earned: {issue.pointsAwarded ? 10 : 0}
                  {issue.resolutionPointsAwarded ? ' + 20' : ''}
                </p>
              </div>
            )}
          </div>
          {(issue.status === 'resolved' || issue.status === 'completed') && onFeedback && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => onFeedback(issue)}
                className="w-full sm:w-auto px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow"
              >
                Leave feedback
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsModal;
