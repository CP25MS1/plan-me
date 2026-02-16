'use client';

import { Badge, Box, Container, IconButton } from '@mui/material';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotificationsSelector } from '@/store/selectors';
import { useGetNotifications } from '@/app/hooks/use-get-notifications';
import { useGetMyReceivedInvitations } from '@/app/hooks';

const HomePage = () => {
  const router = useRouter();

  const { unreadCount } = useNotificationsSelector();

  useGetMyReceivedInvitations();
  useGetNotifications();

  return (
    <Container disableGutters>
      <Box
        component="header"
        sx={{
          height: 64,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderColor: 'divider',
        }}
      >
        <IconButton
          aria-label="notifications"
          onClick={() => router.push('/notifications')}
          sx={{
            width: 40,
            height: 40,
          }}
        >
          <Badge
            badgeContent={unreadCount > 0 ? unreadCount : null}
            color="error"
            overlap="circular"
          >
            <Bell size={22} />
          </Badge>
        </IconButton>
      </Box>
    </Container>
  );
};

export default HomePage;
