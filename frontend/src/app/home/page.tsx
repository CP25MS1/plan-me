'use client';

import React from 'react';
import Image from 'next/image';
import { Badge, Box, IconButton, Typography, CircularProgress } from '@mui/material';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useNotificationsSelector } from '@/store/selectors';
import { useGetNotifications } from '@/app/hooks/use-get-notifications';
import { useGetMyReceivedInvitations } from '@/app/hooks';
import { useListPublicTripTemplates } from '@/app/hooks/use-list-public-trip-templates';
import { useAppSelector } from '@/store';
import { tokens } from '@/providers/theme/design-tokens';

import PublicTripTemplateCard from '@/app/home/components/public-trip-template-card';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { unreadCount } = useNotificationsSelector();
  const currentUser = useAppSelector((s) => s.profile.currentUser);

  useGetMyReceivedInvitations();
  useGetNotifications();

  const { data, isLoading, isError, isFetching } = useListPublicTripTemplates();

  const templates = React.useMemo(() => {
    return (data?.items ?? []).slice().sort((a, b) => b.templateTripId - a.templateTripId);
  }, [data]);

  return (
    <Box
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {/* header */}
      <Box
        component="header"
        sx={{
          px: 2,
          py: 1.25,
          minHeight: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,

          bgcolor: tokens.color.primary,
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 1.5,
            px: 0,
            py: 0.75,
            borderRadius: 999,
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={() => router.push('/profile')}
            aria-label="Go to profile"
            sx={{
              position: 'relative',
              width: 44,
              height: 44,
              flexShrink: 0,
              overflow: 'hidden',
              borderRadius: '50%',
              boxShadow: 1,
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                boxShadow: 'inset 0 0 0 2px #000',
                pointerEvents: 'none',
              },
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 3,
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
              bgcolor: 'transparent',
              p: 0,
            }}
          >
            <Image
              src={currentUser?.profilePicUrl ?? ''}
              alt="Profile picture"
              fill
              className="object-cover"
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <Typography
              variant="body2"
              sx={{ color: tokens.color.background, fontSize: '1rem', fontWeight: 500 }}
            >
              {t('home.welcome')}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                fontSize: '0.98rem',
                color: tokens.color.background,
              }}
            >
              {currentUser?.username || ''}
            </Typography>
          </Box>
        </Box>

        <IconButton
          aria-label={t('home.notifications')}
          onClick={() => router.push('/notifications')}
          sx={{ width: 40, height: 40 }}
        >
          <Badge
            badgeContent={unreadCount > 0 ? unreadCount : null}
            color="error"
            overlap="circular"
          >
            <Bell size={22} color="#fff" />
          </Badge>
        </IconButton>
      </Box>

      {/* title */}
      <Box
        sx={{ px: 2, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, mt: 1 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('home.shared_trip_templates')}
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
        <Box sx={{ px: 2, color: 'error.main' }}>{t('home.shared_trip_templates_load_error')}</Box>
      ) : templates.length === 0 ? (
        <Box sx={{ px: 2, color: 'text.secondary' }}>{t('home.shared_trip_templates_empty')}</Box>
      ) : (
        <Box
          component="section"
          sx={{
            px: 2,
            pb: 10,
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
