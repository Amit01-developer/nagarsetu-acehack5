import api from './axiosConfig';
import type { NotificationsResponse, Notification } from '../types';

interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export const getNotifications = async (params: GetNotificationsParams = {}): Promise<NotificationsResponse> => {
  const response = await api.get<NotificationsResponse>('/notifications', { params });
  return response.data;
};

export const markNotificationAsRead = async (
  id: string
): Promise<{ success: boolean; data: { notification: Notification } }> => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

