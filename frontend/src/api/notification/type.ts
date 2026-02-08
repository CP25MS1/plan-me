import { PublicUserInfo } from '@/api/users';

export type NotificationCode =
  | 'INVITE_SENT'
  | 'INVITE_ACCEPTED'
  | 'INVITE_REJECTED'
  | 'TRIP_UPDATED';

export interface NotificationDto {
  id: number;
  tripId: number;
  notiCode: NotificationCode;
  actor: PublicUserInfo;
  isRead: boolean;
  createdAt: string;
}
