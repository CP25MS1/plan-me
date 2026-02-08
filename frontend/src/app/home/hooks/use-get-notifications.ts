'use client';

import { useQuery } from '@tanstack/react-query';

import { getNotifications } from '@/api/notification/api';
import { NotificationDto } from '@/api/notification/type';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

export const useGetNotifications = () =>
  useQuery<NotificationDto[]>({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: getNotifications,
  });
