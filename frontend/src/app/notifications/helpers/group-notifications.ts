import dayjs from 'dayjs';
import { NotificationDto } from '@/api/notification';
import { TFunction } from 'i18next';

export type GroupedNotifications = Record<string, NotificationDto[]>;

export const groupNotificationsByDate = (
  notifications: NotificationDto[],
  t: TFunction<'common'>
): GroupedNotifications => {
  return notifications.reduce<GroupedNotifications>((acc, notification) => {
    const date = dayjs(notification.createdAt);
    let key;

    if (date.isSame(dayjs(), 'day')) key = t('notification.group.today');
    else if (date.isSame(dayjs().subtract(1, 'day'), 'day'))
      key = t('notification.group.yesterday');
    else if (date.isAfter(dayjs().subtract(7, 'day'))) key = t('notification.group.this_week');
    else if (date.isAfter(dayjs().subtract(1, 'month'))) key = t('notification.group.this_month');
    else key = t('notification.group.this_year');

    acc[key] = acc[key] || [];
    acc[key].push(notification);
    return acc;
  }, {});
};
