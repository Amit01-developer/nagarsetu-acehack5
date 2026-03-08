import { CheckCircle, XCircle, UserPlus, Eye } from 'lucide-react';
import { Issue, ISSUE_STATUSES, ISSUE_CATEGORIES } from '../../types';

interface IssueTableProps {
  issues: Issue[];
  onVerify: (issue: Issue) => void;
  onAssign: (issue: Issue) => void;
  onResolve: (issue: Issue) => void;
}

const IssueTable = ({ issues, onVerify, onAssign, onResolve }: IssueTableProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (issues.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <p className="text-gray-500">No issues found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporter</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {issues.map((issue) => {
              const statusConfig = ISSUE_STATUSES.find((s) => s.value === issue.status);
              const categoryConfig = ISSUE_CATEGORIES.find((c) => c.value === issue.category);
              const reporterName = issue.reportedBy?.profile?.name ?? 'Unknown reporter';
              const reporterEmail = issue.reportedBy?.email ?? '—';
              const isHotspot = issue.isHotspot && (issue.hotspotCount || 0) >= 10;
              const latitude = issue.location.coordinates[1];
              const longitude = issue.location.coordinates[0];
              const coordsLabel = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

              return (
                <tr key={issue._id} className="hover:bg-primary-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {issue.images[0] && (
                        <img
                          src={issue.images[0].url}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm text-gray-900 font-medium line-clamp-1 max-w-xs">
                          {issue.description}
                        </p>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          {issue.location.address && (
                            <p className="text-gray-700 line-clamp-1 max-w-xs">{issue.location.address}</p>
                          )}
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary-600 hover:underline inline-block"
                          >
                            {coordsLabel}
                          </a>
                        </div>
                        {isHotspot && (
                          <div className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold">
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            Hotspot · {issue.hotspotCount}+ reports
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {categoryConfig?.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig?.color}`}>
                      {statusConfig?.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">{reporterName}</p>
                    <p className="text-xs text-gray-500">{reporterEmail}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{formatDate(issue.createdAt)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {issue.status === 'pending' && (
                        <button
                          onClick={() => onVerify(issue)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Verify Issue"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {issue.status === 'verified' && (
                        <button
                          onClick={() => onAssign(issue)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Assign Contractor"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      {issue.status === 'completed' && (
                        <button
                          onClick={() => onResolve(issue)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Review Completed Work"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {issue.status === 'rejected' && (
                        <span className="text-red-500">
                          <XCircle className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IssueTable;
