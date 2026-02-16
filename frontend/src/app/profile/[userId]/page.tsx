'use client';

import { use } from 'react';
import { Container, Box, Avatar, Typography, Skeleton, Divider, Stack } from '@mui/material';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { tokens } from '@/providers/theme/design-tokens';
import { TruncatedTooltip } from '@/components/atoms';
import { useGetProfile, useFollowActionButton } from '@/app/profile/hooks';
import { BackButton } from '@/components/button';
import { RootState } from '@/store';

type UserProfilePageProps = { params: Promise<{ userId: string }> };

const UserProfilePage = ({ params }: UserProfilePageProps) => {
  const { t } = useTranslation('profile');
  const { userId } = use(params);
  const { data: user, isLoading } = useGetProfile(Number(userId));
  const { actionBtn, count, unFollowConfirmDialog, removeConfirmDialog } = useFollowActionButton(
    user ?? null
  );

  const currentUserId = useSelector((s: RootState) => s.profile.currentUser?.id);
  const isOwnProfile = !!currentUserId && currentUserId === Number(userId);

  return (
    <>
      <Container maxWidth="sm" sx={{ py: 4, minHeight: 'calc(100vh - 64px)' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Header with centered title and left back button */}
          {isLoading ? (
            <Skeleton variant="text" width={160} height={32} />
          ) : (
            <Box sx={{ width: '100%', position: 'relative', px: 1 }}>
              <Box sx={{ position: 'absolute', left: 0 }}>
                <BackButton />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Typography
                  variant="h5"
                  component="h1"
                  fontWeight={600}
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <TruncatedTooltip text={user?.username ?? 'User'} />
                </Typography>
              </Box>
            </Box>
          )}

          {/* Avatar */}
          {isLoading ? (
            <Skeleton variant="circular" width={112} height={112} />
          ) : (
            <Avatar
              src={user?.profilePicUrl}
              alt={user?.username ?? 'User'}
              sx={{ width: 112, height: 112, border: `4px solid ${tokens.color.primary}` }}
            />
          )}

          {/* Username and email */}
          {isLoading ? (
            <>
              <Skeleton variant="text" width={200} height={28} />
              <Skeleton variant="text" width={180} height={20} />
            </>
          ) : (
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={600}>
                {user?.username ?? 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email ?? '-'}
              </Typography>
            </Box>
          )}

          {isLoading ? (
            <Skeleton variant="rectangular" width={140} height={36} />
          ) : (
            !isOwnProfile && actionBtn
          )}

          <Box sx={{ width: '100%', my: 2 }}>
            <Divider />
          </Box>

          {/* Followers / Following */}
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <Box textAlign="center">
              {isLoading ? (
                <Skeleton variant="text" width={48} height={32} />
              ) : (
                <>
                  <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    {count.followers}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('followers')}
                  </Typography>
                </>
              )}
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box textAlign="center">
              {isLoading ? (
                <Skeleton variant="text" width={48} height={32} />
              ) : (
                <>
                  <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    {count.following}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('following')}
                  </Typography>
                </>
              )}
            </Box>
          </Stack>
        </Box>
      </Container>

      {unFollowConfirmDialog}
      {removeConfirmDialog}
    </>
  );
};

export default UserProfilePage;
