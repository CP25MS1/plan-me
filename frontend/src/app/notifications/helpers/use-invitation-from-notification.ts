import { NotificationDto } from '@/api/notification';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const useInvitationFromNotification = (notification: NotificationDto) => {
  const tripId = notification.tripRef.tripId;
  const { invitations } = useSelector((s: RootState) => s.profile);

  const foundInvitation = invitations.find(
    (i) => i.tripId === tripId && i.inviter.id === notification.actor.id
  );

  return foundInvitation ?? null;
};
