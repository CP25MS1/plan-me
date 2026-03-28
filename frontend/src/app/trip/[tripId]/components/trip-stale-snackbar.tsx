'use client';

import { Box, Button, Snackbar, Typography } from '@mui/material';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/store';
import { tokens } from '@/providers/theme/design-tokens';

type TripStaleSnackbarProps = {
  tripId: number;
};

const TripStaleSnackbar = ({ tripId }: TripStaleSnackbarProps) => {
  const { t } = useTranslation('trip_overview');
  const isStale = useAppSelector((state) => state.tripStale.staleByTripId[tripId] ?? false);

  if (!isStale) return null;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Semi-transparent overlay to block editing, but allows pointer events on snackbar */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0, 0, 0, 0.15)',
          zIndex: 1300,
          pointerEvents: 'all',
        }}
      />

      <Snackbar
        open
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ zIndex: 1301 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2.5,
            py: 1.5,
            borderRadius: 2,
            bgcolor: tokens.color.textPrimary,
            color: tokens.color.contrastText,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            maxWidth: 420,
          }}
        >
          <Typography variant="body2" sx={{ flex: 1, color: 'inherit' }}>
            {t('version.staleSnackbar.message')}
          </Typography>

          <Button
            variant="contained"
            size="small"
            startIcon={<RefreshCw size={14} />}
            onClick={handleRefresh}
            sx={{
              flexShrink: 0,
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: tokens.color.primary,
              '&:hover': { bgcolor: tokens.color.primaryDark },
            }}
          >
            {t('version.staleSnackbar.cta')}
          </Button>
        </Box>
      </Snackbar>
    </>
  );
};

export default TripStaleSnackbar;
