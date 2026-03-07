export const USER_ROLES = ['citizen', 'municipality', 'contractor'] as const;
export type UserRole = typeof USER_ROLES[number];

export const ISSUE_CATEGORIES = [
  'pothole',
  'garbage',
  'water_leak',
  'street_light',
  'drainage',
  'other',
] as const;
export type IssueCategory = typeof ISSUE_CATEGORIES[number];

export const ISSUE_STATUSES = [
  'pending',
  'verified',
  'assigned',
  'in_progress',
  'completed',
  'resolved',
  'rejected',
] as const;
export type IssueStatus = typeof ISSUE_STATUSES[number];

export const ISSUE_PRIORITIES = ['low', 'medium', 'high'] as const;
export type IssuePriority = typeof ISSUE_PRIORITIES[number];

export const POINTS = {
  ISSUE_VERIFIED: 10,
  ISSUE_RESOLVED: 20,
} as const;
