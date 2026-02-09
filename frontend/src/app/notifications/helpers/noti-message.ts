import { NotificationDto } from '@/api/notification';

export const getNotificationMessage = (notification: NotificationDto) => {
  const { actor, tripRef, notiCode } = notification;

  const name = actor.username;
  const tripName = tripRef ? `ทริป "${tripRef.tripName}"` : 'ทริปของคุณ';

  switch (notiCode) {
    case 'INVITE_PENDING':
      return `${name} เชิญคุณเข้าร่วม${tripName}`;

    case 'INVITE_ACCEPTED':
      return `${name} ตอบรับคำเชิญเข้าร่วม${tripName}`;

    case 'INVITE_REJECTED':
      return `${name} ปฏิเสธคำเชิญเข้าร่วม${tripName}`;

    default:
      return 'มีการแจ้งเตือนใหม่';
  }
};
