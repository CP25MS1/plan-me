import { apiClient } from '@/api/client';
import { NotificationDto } from './type';

// ================= NOTIFICATIONS =================

export const getNotifications = async (): Promise<NotificationDto[]> => {
  const { data } = await apiClient.get('/notifications');
  return data;
};

export const readNotification = async (notificationId: number): Promise<NotificationDto> => {
  const { data } = await apiClient.patch(`/notifications/${notificationId}/read`);
  return data;
};
