import api from './axiosConfig';
import { IssuesResponse, IssueResponse, Issue, IssueCategory, IssueStatus, Feedback } from '../types';

interface GetIssuesParams {
  status?: IssueStatus;
  category?: IssueCategory;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

interface CreateIssueData {
  category: IssueCategory;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  images: File[];
}

interface FeedbackPayload {
  complaintId: string;
  qualityRating: number;
  speedRating: number;
  rating?: number;
  comment?: string;
}

export const getIssues = async (params: GetIssuesParams = {}): Promise<IssuesResponse> => {
  const response = await api.get<IssuesResponse>('/issues', { params });
  return response.data;
};

export const getIssue = async (id: string): Promise<IssueResponse> => {
  const response = await api.get<IssueResponse>(`/issues/${id}`);
  return response.data;
};

export const getNearbyIssues = async (
  latitude: number,
  longitude: number,
  radius: number = 5000
): Promise<{ success: boolean; data: { issues: Issue[] } }> => {
  const response = await api.get('/issues/nearby', {
    params: { latitude, longitude, radius },
  });
  return response.data;
};

export const createIssue = async (data: CreateIssueData): Promise<IssueResponse> => {
  const formData = new FormData();
  formData.append('category', data.category);
  formData.append('description', data.description);
  formData.append('latitude', data.latitude.toString());
  formData.append('longitude', data.longitude.toString());
  if (data.address) {
    formData.append('address', data.address);
  }
  data.images.forEach((image) => {
    formData.append('images', image);
  });

  const response = await api.post<IssueResponse>('/issues', formData, {
    headers: { 'Content-Type': undefined },
  });
  return response.data;
};

export const verifyIssue = async (
  id: string,
  approved: boolean,
  rejectionReason?: string,
  priority?: 'low' | 'medium' | 'high'
): Promise<IssueResponse> => {
  const response = await api.patch<IssueResponse>(`/issues/${id}/verify`, {
    approved,
    rejectionReason,
    priority,
  });
  return response.data;
};

export const assignIssue = async (id: string, contractorId: string): Promise<IssueResponse> => {
  const response = await api.patch<IssueResponse>(`/issues/${id}/assign`, {
    contractorId,
  });
  return response.data;
};

export const updateIssueStatus = async (
  id: string,
  status: 'in_progress' | 'completed',
  resolutionDescription?: string,
  images?: File[]
): Promise<IssueResponse> => {
  const formData = new FormData();
  formData.append('status', status);
  if (resolutionDescription) {
    formData.append('resolutionDescription', resolutionDescription);
  }
  if (images) {
    images.forEach((image) => {
      formData.append('images', image);
    });
  }

  const response = await api.patch<IssueResponse>(`/issues/${id}/status`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const resolveIssue = async (id: string): Promise<IssueResponse> => {
  const response = await api.patch<IssueResponse>(`/issues/${id}/resolve`);
  return response.data;
};

export const rejectResolution = async (id: string, rejectionReason: string): Promise<IssueResponse> => {
  const response = await api.patch<IssueResponse>(`/issues/${id}/reject-resolution`, {
    rejectionReason,
  });
  return response.data;
};

export const deleteIssue = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/issues/${id}`);
  return response.data;
};

export const submitFeedback = async (
  payload: FeedbackPayload
): Promise<{ success: boolean; data: { feedback: Feedback } }> => {
  const response = await api.post('/feedback', payload);
  return response.data;
};
