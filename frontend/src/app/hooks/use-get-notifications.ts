import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

import { getNotifications, NotificationDto } from '@/api/notification';
import { receiveNotifications } from '@/store/notifications-slice';

export const useGetNotifications = () => {
  const dispatch = useDispatch();

  const query = useQuery<NotificationDto[]>({
    queryKey: ['NOTIFICATIONS'],
    queryFn: () => getNotifications(),
    retry: false,
    gcTime: 0,
  });

  const notifications = query.data;

  useEffect(() => {
    if (notifications) {
      dispatch(receiveNotifications(notifications));
    }
  }, [dispatch, notifications]);

  return query;
};
