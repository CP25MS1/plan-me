'use client';

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useTripLockLease } from '@/app/trip/[tripId]/realtime/hooks/use-trip-lock-lease';
import { useTripVersionMutationLock } from '@/store/selectors';

import { tokens } from '@/providers/theme/design-tokens';

type ApplyVersionDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
};

export const ApplyVersionDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: ApplyVersionDialogProps) => {
  const { t } = useTranslation('trip_overview');

  const releaseRef = useRef<(() => Promise<void>) | null>(null);
  const [isAcquiringLock, setIsAcquiringLock] = useState(false);
  const searchParams = useSearchParams();
  const tripIdParam = searchParams.get('tripId');
  const tripIdAsNumber = Number(tripIdParam);
  const { acquireLease } = useTripLockLease(tripIdAsNumber);
  const { lockedByOther } = useTripVersionMutationLock(tripIdAsNumber);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    (async () => {
      if (lockedByOther) return;
      setIsAcquiringLock(true);
      try {
        const res = await acquireLease({
          resourceType: 'TRIP',
          resourceId: tripIdAsNumber,
          purpose: 'VERSION_APPLY',
        });

        if (res.status === 'acquired' && mounted) {
          releaseRef.current = res.release;
        }
      } finally {
        if (mounted) setIsAcquiringLock(false);
      }
    })();

    return () => {
      mounted = false;
      if (releaseRef.current) {
        void releaseRef.current();
        releaseRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
      <Dialog
      open={open}
      onClose={async () => {
        if (isLoading) return;
        if (releaseRef.current) {
          await releaseRef.current();
          releaseRef.current = null;
        }
        onClose();
      }}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 152, 0, 0.1)',
              color: '#F57C00',
            }}
          >
            <AlertCircle size={20} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: tokens.color.textPrimary }}>
              {t('version.viewLayout.applyConfirm.title')}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: '8px !important' }}>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: tokens.color.textSecondary }}>
            {t('version.viewLayout.applyConfirm.message')}
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255, 152, 0, 0.08)',
              border: '1px solid rgba(255, 152, 0, 0.2)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#F57C00', fontWeight: 600 }}>
              {t('version.viewLayout.applyConfirm.checklistWarning')}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={async () => {
          if (isAcquiringLock) return;
          if (releaseRef.current) {
            await releaseRef.current();
            releaseRef.current = null;
          }
          onClose();
        }} disabled={isLoading || isAcquiringLock} color="inherit">
          {t('version.viewLayout.applyConfirm.cancel')}
        </Button>
        <Button
          onClick={async () => {
            await onConfirm();
            if (releaseRef.current) {
              await releaseRef.current();
              releaseRef.current = null;
            }
          }}
          variant="contained"
          disabled={isLoading || isAcquiringLock || lockedByOther}
          startIcon={isLoading || isAcquiringLock ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            borderRadius: 2,
            bgcolor: tokens.color.primary,
            '&:hover': {
              bgcolor: tokens.color.primaryDark,
            },
          }}
        >
          {isLoading ? t('version.create.saving') : t('version.viewLayout.applyConfirm.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplyVersionDialog;
