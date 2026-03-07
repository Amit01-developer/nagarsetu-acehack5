import { CheckCheck, RefreshCw } from 'lucide-react';
import type { Notification } from '../../types';
import LoadingSpinner from './LoadingSpinner';

interface NotificationsDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error?: string | null;
  onRefresh: () => void;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NotificationsDropdown = ({
  notifications,
  unreadCount,
  isLoading,
  error,
  onRefresh,
  onMarkAllAsRead,
  onMarkAsRead,
}: NotificationsDropdownProps) => {
  return (
    <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Notifications</p>
          <p className="text-xs text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[28rem] overflow-y-auto">
        {isLoading ? (
          <div className="py-10">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-gray-700">{error}</p>
            <button
              type="button"
              onClick={onRefresh}
              className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-gray-600">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => {
                  if (!n.isRead) onMarkAsRead(n._id);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors ${
                  n.isRead ? '' : 'bg-primary-50/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      n.isRead ? 'bg-gray-300' : 'bg-primary-600'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${n.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'} line-clamp-1`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 flex-shrink-0">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsDropdown;
