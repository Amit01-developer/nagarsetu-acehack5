export type IssueCategory = 'pothole' | 'garbage' | 'water_leak' | 'street_light' | 'drainage' | 'other';
export type IssueStatus = 'pending' | 'verified' | 'assigned' | 'in_progress' | 'completed' | 'resolved' | 'rejected';
export type IssuePriority = 'low' | 'medium' | 'high';

export interface IssueImage {
  url: string;
  publicId: string;
}

export interface IssueLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
}

export interface ResolutionDetails {
  description?: string;
  images: IssueImage[];
  completedDate?: string;
}

export interface Issue {
  _id: string;
  reportedBy:
    | {
        _id: string;
        profile: {
          name: string;
        };
        email: string;
      }
    | null;
  category: IssueCategory;
  description: string;
  location: IssueLocation;
  images: IssueImage[];
  status: IssueStatus;
  priority: IssuePriority;
  verifiedBy?: {
    _id: string;
    profile: {
      name: string;
    };
  };
  verificationDate?: string;
  rejectionReason?: string;
  assignedTo?: {
    _id: string;
    profile: {
      name: string;
    };
    contractor?: {
      company?: string;
    };
    email: string;
  };
  assignmentDate?: string;
  resolutionDetails?: ResolutionDetails;
  resolutionRejectionReason?: string;
  resolutionRejectionDate?: string;
  resolutionRejectedBy?: string;
  pointsAwarded: boolean;
  resolutionPointsAwarded: boolean;
  isHotspot?: boolean;
  hotspotCount?: number;
  duplicateOf?: string | null;
  duplicateCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IssuesResponse {
  success: boolean;
  data: {
    issues: Issue[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  };
}

export interface IssueResponse {
  success: boolean;
  data: {
    issue: Issue;
    pointsAwarded?: number;
  };
}

export interface Feedback {
  _id: string;
  complaint: string | Issue;
  user: string;
  qualityRating: number;
  speedRating: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export const ISSUE_CATEGORIES: { value: IssueCategory; label: string }[] = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'garbage', label: 'Garbage' },
  { value: 'water_leak', label: 'Water Leak' },
  { value: 'street_light', label: 'Street Light' },
  { value: 'drainage', label: 'Drainage' },
  { value: 'other', label: 'Other' },
];

export const ISSUE_STATUSES: { value: IssueStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'verified', label: 'Verified', color: 'bg-primary-100 text-primary-800' },
  { value: 'assigned', label: 'Assigned', color: 'bg-purple-100 text-purple-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-orange-100 text-orange-800' },
  { value: 'completed', label: 'Completed', color: 'bg-primary-100 text-primary-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
];

export const ISSUE_PRIORITIES: { value: IssuePriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
];
