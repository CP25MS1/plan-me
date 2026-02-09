'use client';

import { useMutation } from '@tanstack/react-query';
import { readNotification } from '@/api/notification/api';

export const useReadNotification = () => {
  return useMutation({
    mutationFn: (notificationId: number) => readNotification(notificationId),
  });
};
