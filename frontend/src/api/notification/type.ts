import { PublicUserInfo } from '@/api/users';

export type NotificationCode = 'INVITE_PENDING' | 'INVITE_ACCEPTED' | 'INVITE_REJECTED';

export interface NotificationDto {
  id: number;
  tripRef: {
    tripId: number;
    tripName: string | null;
  };
  notiCode: NotificationCode;
  actor: PublicUserInfo;
  isRead: boolean;
  createdAt: string;
}
