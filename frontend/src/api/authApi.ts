import api from './axiosConfig';
import { AuthResponse, User } from '../types';

interface RegisterData {
  email: string;
  password: string;
  role: 'citizen' | 'municipality' | 'contractor';
  profile: {
    name: string;
    phone?: string;
  };
  municipality?: {
    jurisdiction?: string;
    department?: string;
  };
  contractor?: {
    company?: string;
    licenseNumber?: string;
    specialization?: string[];
  };
}

export interface RegisterInitResponse {
  success: boolean;
  message?: string;
  data: {
    email: string;
    verificationRequired: boolean;
  };
}

interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData): Promise<RegisterInitResponse> => {
  const response = await api.post<RegisterInitResponse>('/auth/register', data);
  return response.data;
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const requestEmailOtp = async (email: string): Promise<{ success: boolean; message?: string }> => {
  const response = await api.post('/auth/request-email-otp', { email });
  return response.data;
};

export const verifyEmailOtp = async (
  email: string,
  otp: string
): Promise<{ success: boolean; message?: string; data?: { email: string } }> => {
  const response = await api.post('/auth/verify-email-otp', { email, otp });
  return response.data;
};

export const logout = async (deviceToken?: string): Promise<void> => {
  await api.post('/auth/logout', { deviceToken });
};

export const getMe = async (): Promise<{ success: boolean; data: { user: User } }> => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const refreshToken = async (): Promise<{ success: boolean; data: { token: string } }> => {
  const response = await api.post('/auth/refresh-token');
  return response.data;
};
