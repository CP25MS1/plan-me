'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { readNotification } from '@/api/notification/api';

import { NOTIFICATIONS_QUERY_KEY } from './use-get-notifications';

export const useReadNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => readNotification(notificationId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });
    },
  });
};
