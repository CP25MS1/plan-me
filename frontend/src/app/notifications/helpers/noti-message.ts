import { NotificationDto } from '@/api/notification';
import { TFunction } from 'i18next';

export const getNotificationMessage = (notification: NotificationDto, t: TFunction<'common'>) => {
  const { actor, tripRef, notiCode } = notification;

  const name = actor.username;
  const tripName = tripRef
    ? t('notification.trip.named', { tripName: tripRef.tripName })
    : t('notification.trip.yours');

  switch (notiCode) {
    case 'INVITE_PENDING':
      return t('notification.message.invite_pending', { name, tripName });

    case 'INVITE_ACCEPTED':
      return t('notification.message.invite_accepted', { name, tripName });

    case 'INVITE_REJECTED':
      return t('notification.message.invite_rejected', { name, tripName });

    default:
      return t('notification.message.new');
  }
};
