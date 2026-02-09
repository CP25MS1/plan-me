import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const useNotificationsSelector = () => {
  const notifications = useSelector((s: RootState) => s.notifications);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.isRead).length,
  };
};
