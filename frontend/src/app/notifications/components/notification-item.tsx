'use client';

import { Avatar, Box, Typography } from '@mui/material';
import dayjs from '@/lib/dayjs';

import { NotificationDto } from '@/api/notification';
import { getNotificationMessage } from '../helpers/noti-message';
import { useRouter } from 'next/navigation';
import { useInvitationFromNotification } from '@/app/notifications/helpers/use-invitation-from-notification';
import { useReadNotification } from '@/app/hooks/use-read-notification';
import { useDispatch } from 'react-redux';
import { markNotificationAsRead } from '@/store/notifications-slice';

export const NotificationItem = ({ notification }: { notification: NotificationDto }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const notificationId = notification.id;
  const isUnread = !notification.isRead;
  const isInvitePendingNotification = notification.notiCode === 'INVITE_PENDING';

  const matchedInvitation = useInvitationFromNotification(notification);

  const { mutate: readNotification } = useReadNotification();

  const handleOnClick = () => {
    readNotification(notificationId, {
      onSuccess: () => {
        dispatch(markNotificationAsRead({ notificationId }));
      },
    });

    if (isInvitePendingNotification) {
      if (matchedInvitation) {
        router.push(
          `/invitations/${matchedInvitation.invitationId}?tripId=${matchedInvitation.tripId}&tripName=${notification.tripRef.tripName}`
        );
      } else {
        router.push(`/trip/${notification.tripRef.tripId}`);
      }
      return;
    }

    router.push(`/notifications/${notificationId}`);
  };

  return (
    <Box
      onClick={handleOnClick}
      sx={{
        display: 'flex',
        gap: 1.5,
        px: 2,
        py: 1.75,
        backgroundColor: isUnread ? 'action.hover' : 'transparent',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'relative',
      }}
    >
      {/* left accent for unread */}
      {isUnread && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 8,
            bottom: 8,
            width: 3,
            borderRadius: 2,
            backgroundColor: 'primary.main',
          }}
        />
      )}

      {/* Avatar */}
      <Avatar
        key={notificationId}
        src={notification.actor.profilePicUrl}
        sx={{ width: 40, height: 40 }}
      />

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          <Typography fontSize={14} fontWeight={isUnread ? 600 : 500} noWrap>
            {notification.actor.username}
          </Typography>

          <Typography fontSize={12} color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {dayjs(notification.createdAt).fromNow()}
          </Typography>
        </Box>

        <Typography
          fontSize={13}
          color="text.secondary"
          sx={{
            mt: 0.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {getNotificationMessage(notification)}
        </Typography>
      </Box>
    </Box>
  );
};
