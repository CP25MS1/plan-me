'use client';

import React from 'react';
import { Badge, Box, IconButton, Typography, CircularProgress } from '@mui/material';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useNotificationsSelector } from '@/store/selectors';
import { useGetNotifications } from '@/app/hooks/use-get-notifications';
import { useGetMyReceivedInvitations } from '@/app/hooks';
import { useListPublicTripTemplates } from '@/app/hooks/use-list-public-trip-templates';

import PublicTripTemplateCard from '@/app/home/components/public-trip-template-card';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { unreadCount } = useNotificationsSelector();

  useGetMyReceivedInvitations();
  useGetNotifications();

  const { data, isLoading, isError, isFetching } = useListPublicTripTemplates();

  const templates = React.useMemo(() => {
    return (data?.items ?? []).slice().sort((a, b) => a.templateTripId - b.templateTripId);
  }, [data]);

  return (
    <Box
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        py: 2,
        minHeight: 0,
      }}
    >
      {/* header */}
      <Box
        component="header"
        sx={{
          height: 50,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexShrink: 0,
        }}
      >
        <IconButton
          aria-label="notifications"
          onClick={() => router.push('/notifications')}
          sx={{ width: 40, height: 40 }}
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

      {/* title */}
      <Box sx={{ px: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          เทมเพลตทริปที่ถูกแชร์
        </Typography>

        {isFetching && !isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={14} thickness={6} />
          </Box>
        )}
      </Box>

      {/* content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Box sx={{ px: 2, color: 'error.main' }}>ไม่สามารถโหลดข้อมูลทริปที่ถูกเเชร์ได้</Box>
      ) : templates.length === 0 ? (
        <Box sx={{ px: 2, color: 'text.secondary' }}>ยังไม่มีทริปที่ถูกเเชร์</Box>
      ) : (
        <Box
          component="section"
          sx={{
            px: 2,
            pb: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,

            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
            '& > *': {
              scrollSnapAlign: 'start',
              flexShrink: 0,
            },
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {templates.map((template) => (
            <PublicTripTemplateCard key={template.templateTripId} template={template} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default HomePage;
