import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Issue, ISSUE_STATUSES, ISSUE_CATEGORIES, ISSUE_PRIORITIES } from '../../types';

interface WorkOrderCardProps {
  issue: Issue;
  onUpdateStatus: (issue: Issue) => void;
}

const WorkOrderCard = ({ issue, onUpdateStatus }: WorkOrderCardProps) => {
  const statusConfig = ISSUE_STATUSES.find((s) => s.value === issue.status);
  const categoryConfig = ISSUE_CATEGORIES.find((c) => c.value === issue.category);
  const priorityConfig = ISSUE_PRIORITIES.find((p) => p.value === issue.priority);
  const latitude = issue.location.coordinates[1];
  const longitude = issue.location.coordinates[0];
  const coordsLabel = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const canUpdateStatus = ['assigned', 'in_progress'].includes(issue.status);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Image */}
      {issue.images.length > 0 && (
        <div className="h-40 overflow-hidden">
          <img
            src={issue.images[0].url}
            alt={issue.category}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* Status & Priority */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}>
            {statusConfig?.label}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig?.color}`}>
            {priorityConfig?.label} Priority
          </span>
        </div>

        {/* Category */}
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
          {categoryConfig?.label}
        </span>

        {/* Description */}
        <p className="text-gray-700 text-sm mt-3 mb-3 line-clamp-2">{issue.description}</p>

        {/* Location */}
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <div className="flex flex-col truncate leading-tight">
            {issue.location.address && (
              <span className="text-gray-700 truncate">{issue.location.address}</span>
            )}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary-600 hover:underline truncate"
            >
              {coordsLabel}
            </a>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <Calendar className="w-4 h-4 mr-1" />
          <span>Assigned: {issue.assignmentDate ? formatDate(issue.assignmentDate) : 'N/A'}</span>
        </div>

        {/* Reporter Info */}
        <div className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
          <p>
            <span className="text-gray-500">Reported by:</span>{' '}
            {issue.reportedBy?.profile?.name ?? 'Unknown reporter'}
          </p>
        </div>

        {/* Action Button */}
        {canUpdateStatus && (
          <button
            onClick={() => onUpdateStatus(issue)}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            {issue.status === 'assigned' ? 'Start Work' : 'Mark Complete'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {issue.status === 'completed' && (
          <div className="text-center text-sm text-orange-600 font-medium">
            Awaiting municipality approval
          </div>
        )}

        {issue.status === 'resolved' && (
          <div className="text-center text-sm text-green-600 font-medium">
            Work completed and approved
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrderCard;
