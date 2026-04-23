'use client';

import { Alert, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useTripVersionMutationLock } from '@/store/selectors';

type TripMutationLockBannerProps = {
  tripId: number;
};

export const TripMutationLockBanner = ({ tripId }: TripMutationLockBannerProps) => {
  const { t } = useTranslation('trip_overview');
  const { lockedByOther, lock } = useTripVersionMutationLock(tripId);

  if (!lockedByOther || !lock) return null;

  const username = lock.owner.username ?? 'someone';
  const titleKey =
    lock.purpose === 'VERSION_CREATE'
      ? 'version.lock.banner.create'
      : lock.purpose === 'VERSION_APPLY'
        ? 'version.lock.banner.apply'
        : 'version.lock.banner.generic';

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity="warning"
        sx={{
          borderRadius: 2,
          alignItems: 'flex-start',
          '& .MuiAlert-message': { width: '100%' },
        }}
      >
        <Typography sx={{ fontWeight: 800, mb: 0.25 }}>
          {t(titleKey, { username })}
        </Typography>
        <Typography variant="body2">{t('version.lock.banner.hint')}</Typography>
      </Alert>
    </Box>
  );
};

export default TripMutationLockBanner;

