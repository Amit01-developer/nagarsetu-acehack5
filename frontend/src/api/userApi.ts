import api from './axiosConfig';
import { User } from '../types';

interface PointsResponse {
  success: boolean;
  data: {
    totalPoints: number;
    transactions: Array<{
      _id: string;
      points: number;
      type: string;
      description: string;
      createdAt: string;
      issueId?: {
        category: string;
        description: string;
      };
    }>;
  };
}

interface ContractorsResponse {
  success: boolean;
  data: {
    contractors: User[];
  };
}

interface LeaderboardResponse {
  success: boolean;
  data: {
    leaderboard: Array<{
      _id: string;
      profile: { name: string };
      citizen: { totalPoints: number };
    }>;
  };
}

interface ContractorCompaniesResponse {
  success: boolean;
  data: {
    companies: string[];
  };
}

interface ProfileFullResponse {
  success: boolean;
  data: {
    user: User;
    recentTransactions: Array<{
      _id: string;
      points: number;
      type: string;
      description: string;
      createdAt: string;
      issueId?: {
        category: string;
        description: string;
      };
    }>;
  };
}

export const getProfile = async (): Promise<{ success: boolean; data: { user: User } }> => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateProfile = async (profile: {
  name?: string;
  phone?: string;
}): Promise<{ success: boolean; data: { user: User } }> => {
  const response = await api.patch('/users/profile', { profile });
  return response.data;
};

export const getPoints = async (): Promise<PointsResponse> => {
  const response = await api.get<PointsResponse>('/users/points');
  return response.data;
};

export const getContractors = async (filters?: {
  specialization?: string;
  company?: string;
}): Promise<ContractorsResponse> => {
  const response = await api.get<ContractorsResponse>('/users/contractors', {
    params: filters,
  });
  return response.data;
};

export const getContractorCompanies = async (): Promise<ContractorCompaniesResponse> => {
  const response = await api.get<ContractorCompaniesResponse>('/users/contractors/companies');
  return response.data;
};

export const registerDeviceToken = async (deviceToken: string): Promise<void> => {
  await api.post('/users/device-token', { deviceToken });
};

export const getLeaderboard = async (limit: number = 10): Promise<LeaderboardResponse> => {
  const response = await api.get<LeaderboardResponse>('/users/leaderboard', {
    params: { limit },
  });
  return response.data;
};

export const getProfileFull = async (): Promise<ProfileFullResponse> => {
  const response = await api.get<ProfileFullResponse>('/users/profile-full');
  return response.data;
};
