'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/store';
import { tokens } from '@/providers/theme/design-tokens';

type TripStaleDialogProps = {
  tripId: number;
};

const TripStaleDialog = ({ tripId }: TripStaleDialogProps) => {
  const { t } = useTranslation('trip_overview');
  const isStale = useAppSelector((state) => state.tripStale.staleByTripId[tripId] ?? false);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Dialog
      open={isStale}
      aria-labelledby="trip-stale-dialog-title"
      aria-describedby="trip-stale-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 4,
          padding: 1,
          maxWidth: 400,
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
          },
        },
      }}
    >
      <DialogTitle
        id="trip-stale-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 1,
        }}
      >
        <AlertTriangle color={tokens.color.warning} size={24} />
        <Typography variant="h6" fontWeight={700}>
          {t('version.staleSnackbar.title')}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="trip-stale-dialog-description" sx={{ color: 'text.secondary' }}>
          {t('version.staleSnackbar.message')}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<RefreshCw size={18} />}
          onClick={handleRefresh}
          autoFocus
          sx={{
            py: 1.2,
            borderRadius: 2.5,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            bgcolor: tokens.color.primary,
            '&:hover': {
              bgcolor: tokens.color.primaryDark,
            },
            boxShadow: `0 4px 14px 0 rgba(37, 207, 122, 0.39)`,
          }}
        >
          {t('version.staleSnackbar.cta')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TripStaleDialog;
