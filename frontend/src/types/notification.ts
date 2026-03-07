import type { Pagination } from './api';

export type NotificationType =
  | 'issue_reported'
  | 'issue_verified'
  | 'issue_rejected'
  | 'issue_assigned'
  | 'issue_completed'
  | 'status_updated'
  | 'issue_resolved'
  | 'work_assigned'
  | 'resolution_rejected';

export interface NotificationIssueSummary {
  _id: string;
  category?: string;
  status?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  issueId?: NotificationIssueSummary | string | null;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  sentViaOneSignal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
    pagination: Pagination;
  };
}

