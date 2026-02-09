'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, Box, Container, IconButton, Typography } from '@mui/material';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

import dayjs from '@/lib/dayjs';
import { useNotificationsSelector } from '@/store/selectors';

const NotificationDetailPage = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { notifications } = useNotificationsSelector();
  const notification = notifications.find((n) => n.id === Number(id));

  useEffect(() => {
    if (!notification) return;

    if (!['INVITE_ACCEPTED', 'INVITE_REJECTED'].includes(notification.notiCode)) {
      router.replace('/notifications');
    }
  }, [notification, router]);

  if (!notification) return null;

  const { actor, notiCode, tripRef, createdAt } = notification;

  if (!['INVITE_ACCEPTED', 'INVITE_REJECTED'].includes(notiCode)) {
    return null;
  }

  const isAccepted = notiCode === 'INVITE_ACCEPTED';

  const actionMessage = isAccepted ? 'ตอบรับคำเชิญเข้าร่วมทริป' : 'ปฏิเสธคำเชิญเข้าร่วมทริป';

  return (
    <Container>
      {/* Header */}
      <Box sx={{ height: 64, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => router.back()}>
          <ArrowLeft size={22} />
        </IconButton>

        <Typography
          fontWeight={600}
          sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
        >
          การแจ้งเตือน
        </Typography>
      </Box>

      {/* Actor profile */}
      <Box
        sx={{
          mt: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Avatar src={actor.profilePicUrl} alt={actor.username} sx={{ width: 88, height: 88 }} />

        <Typography fontSize={18} fontWeight={600} sx={{ mt: 2 }}>
          {actor.username}
        </Typography>

        <Typography fontSize={14} color="text.secondary">
          {actor.email}
        </Typography>
      </Box>

      {/* Action */}
      <Box
        sx={{
          mt: 4,
          px: 2,
          py: 2.5,
          borderRadius: 2,
          color: isAccepted ? 'success.dark' : 'error.dark',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {isAccepted ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <Typography fontWeight={600}>{actionMessage}</Typography>
        </Box>

        <Typography fontSize={14} sx={{ mt: 0.75 }}>
          {tripRef ? `ทริป "${tripRef.tripName}"` : 'ทริปของคุณ'}
        </Typography>
      </Box>

      {/* Time */}
      <Typography fontSize={12} color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        {dayjs(createdAt).fromNow()}
      </Typography>
    </Container>
  );
};

export default NotificationDetailPage;
