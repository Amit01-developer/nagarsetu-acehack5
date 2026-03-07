import { MapPin, Calendar, Trash2 } from 'lucide-react';
import { Issue, ISSUE_STATUSES, ISSUE_CATEGORIES } from '../../types';

interface IssueCardProps {
  issue: Issue;
  onDelete?: (id: string) => void;
  onView?: (issue: Issue) => void;
}

const IssueCard = ({ issue, onDelete, onView }: IssueCardProps) => {
  const statusConfig = ISSUE_STATUSES.find((s) => s.value === issue.status);
  const categoryConfig = ISSUE_CATEGORIES.find((c) => c.value === issue.category);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${onView ? 'cursor-pointer' : ''}`}
      role={onView ? 'button' : undefined}
      tabIndex={onView ? 0 : undefined}
      onClick={() => onView?.(issue)}
      onKeyDown={(e) => {
        if (!onView) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView(issue);
        }
      }}
    >
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
        {/* Status & Category */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}>
            {statusConfig?.label}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {categoryConfig?.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{issue.description}</p>

        {/* Location */}
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">
            {issue.location.address || `${issue.location.coordinates[1].toFixed(4)}, ${issue.location.coordinates[0].toFixed(4)}`}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center text-gray-500 text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{formatDate(issue.createdAt)}</span>
        </div>

        {/* Actions */}
        {issue.status === 'pending' && onDelete && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(issue._id);
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        )}

        {/* Points Badge */}
        {(issue.pointsAwarded || issue.resolutionPointsAwarded) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-green-600 text-sm font-medium">
              <span className="mr-1">+{issue.pointsAwarded ? 10 : 0}{issue.resolutionPointsAwarded ? '+20' : ''}</span>
              <span>points earned</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
