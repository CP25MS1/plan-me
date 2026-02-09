import dayjs from 'dayjs';
import { NotificationDto } from '@/api/notification';

export type GroupedNotifications = Record<string, NotificationDto[]>;

export const groupNotificationsByDate = (
  notifications: NotificationDto[]
): GroupedNotifications => {
  return notifications.reduce<GroupedNotifications>((acc, notification) => {
    const date = dayjs(notification.createdAt);
    let key;

    if (date.isSame(dayjs(), 'day')) key = 'วันนี้';
    else if (date.isSame(dayjs().subtract(1, 'day'), 'day')) key = 'เมื่อวาน';
    else if (date.isAfter(dayjs().subtract(7, 'day'))) key = 'สัปดาห์นี้';
    else if (date.isAfter(dayjs().subtract(1, 'month'))) key = 'เดือนนี้';
    else key = 'ปีนี้';

    acc[key] = acc[key] || [];
    acc[key].push(notification);
    return acc;
  }, {});
};
