import { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Issue, ISSUE_PRIORITIES } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

interface VerifyModalProps {
  issue: Issue;
  onClose: () => void;
  onSubmit: (approved: boolean, rejectionReason?: string, priority?: string) => Promise<void>;
}

const VerifyModal = ({ issue, onClose, onSubmit }: VerifyModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [priority, setPriority] = useState(issue.priority);
  const reporterName = issue.reportedBy?.profile?.name ?? 'Unknown reporter';
  const reporterEmail = issue.reportedBy?.email;
  const latitude = issue.location.coordinates[1];
  const longitude = issue.location.coordinates[0];
  const coordsLabel = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  const handleApprove = async () => {
    setIsLoading(true);
    await onSubmit(true, undefined, priority);
    setIsLoading(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setIsLoading(true);
    await onSubmit(false, rejectionReason);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Verify Issue</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Issue Details */}
          <div className="mb-6">
            {issue.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
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
                      alt={`Issue ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg hover:opacity-90"
                    />
                  </a>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="text-gray-900 capitalize">{issue.category.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{issue.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <div className="space-y-1 text-sm">
                  {issue.location.address && (
                    <p className="text-gray-900">{issue.location.address}</p>
                  )}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-600 hover:underline break-all"
                  >
                    {coordsLabel}
                  </a>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Reported By</label>
                <p className="text-gray-900">
                  {reporterName}
                  {reporterEmail ? ` (${reporterEmail})` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Priority Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set Priority
            </label>
            <div className="flex gap-2">
              {ISSUE_PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    priority === p.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason (required for rejection)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Explain why this issue is being rejected..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : <CheckCircle className="w-5 h-5" />}
              Approve (+10 pts to citizen)
            </button>
            <button
              onClick={handleReject}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : <XCircle className="w-5 h-5" />}
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyModal;
