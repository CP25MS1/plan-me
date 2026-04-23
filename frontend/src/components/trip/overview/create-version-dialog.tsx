'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';

import { useTripLockLease } from '@/app/trip/[tripId]/realtime/hooks/use-trip-lock-lease';
import { useTripVersionMutationLock } from '@/store/selectors';

import { tokens } from '@/providers/theme/design-tokens';

const MAX_VERSION_NAME_LENGTH = 30;

type CreateVersionDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (versionName: string) => Promise<void>;
  isLoading?: boolean;
  existingNames?: string[];
};

export const CreateVersionDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  existingNames = [],
}: CreateVersionDialogProps) => {
  const { t } = useTranslation('trip_overview');
  const [versionName, setVersionName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [showConfirmChecklist, setShowConfirmChecklist] = useState(false);
  const releaseRef = useRef<(() => Promise<void>) | null>(null);
  const [isAcquiringLock, setIsAcquiringLock] = useState(false);

  const { tripId } = useParams<{ tripId: string }>();
  const tripIdAsNumber = Number(tripId);
  const { acquireLease } = useTripLockLease(tripIdAsNumber);
  const { lockedByOther } = useTripVersionMutationLock(tripIdAsNumber);

  useEffect(() => {
    if (!open) {
      setVersionName('');
      setError(null);
      setShowConfirmChecklist(false);
    }
  }, [open]);

  const trimmedVersionName = versionName.trim();
  const isSubmitDisabled = !trimmedVersionName || isLoading || !!error;

  const handleConfirm = async () => {
    if (isSubmitDisabled) {
      return;
    }

    if (existingNames.includes(trimmedVersionName)) {
      setError(t('version.create.errors.duplicateName'));
      return;
    }

    if (!showConfirmChecklist) {
      if (lockedByOther) {
        setError(t('version.lock.banner.hint'));
        return;
      }

      setIsAcquiringLock(true);
      try {
        const res = await acquireLease({
          resourceType: 'TRIP',
          resourceId: tripIdAsNumber,
          purpose: 'VERSION_CREATE',
        });

        if (res.status === 'acquired') {
          releaseRef.current = res.release;
          setShowConfirmChecklist(true);
        } else {
          setError(t('version.lock.banner.hint'));
        }
      } finally {
        setIsAcquiringLock(false);
      }

      return;
    }

    setShowConfirmChecklist(false);
    try {
      await onConfirm(trimmedVersionName);
    } finally {
      if (releaseRef.current) {
        await releaseRef.current();
        releaseRef.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (releaseRef.current) {
        void releaseRef.current();
        releaseRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Dialog
        open={open && !showConfirmChecklist}
        onClose={() => {
          if (!isLoading) {
            onClose();
          }
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
                bgcolor: tokens.color.lightBackground,
                color: tokens.color.primaryDark,
              }}
            >
              <History size={20} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: tokens.color.textPrimary }}>
                {t('version.create.title')}
              </Typography>
              <Typography variant="body2" sx={{ color: tokens.color.textSecondary }}>
                {t('version.create.description')}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: '8px !important' }}>
          <Stack spacing={2}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(37, 207, 122, 0.08)',
                border: '1px solid rgba(37, 207, 122, 0.2)',
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: tokens.color.primaryDark, mb: 0.5 }}
              >
                {t('version.create.infoTitle')}
              </Typography>
              <Typography variant="body2" sx={{ color: tokens.color.textSecondary, mb: 1 }}>
                {t('version.create.infoDescription')}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: tokens.color.textSecondary, fontStyle: 'italic', display: 'block' }}
              >
                {t('version.create.checklistWarning')}
              </Typography>
            </Box>

            <Stack spacing={1}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: tokens.color.textPrimary,
                }}
              >
                {t('version.create.nameLabel')}
              </Typography>

              <TextField
                autoFocus
                fullWidth
                value={versionName}
                placeholder={t('version.create.namePlaceholder')}
                onChange={(event) => {
                  const val = event.target.value.slice(0, MAX_VERSION_NAME_LENGTH);
                  setVersionName(val);
                  if (error) setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void handleConfirm();
                  }
                }}
                disabled={isLoading}
                error={!!error}
                helperText={error}
                inputProps={{ maxLength: MAX_VERSION_NAME_LENGTH }}
                InputProps={{
                  endAdornment: (
                    <Typography
                      variant="caption"
                      sx={{
                        color: tokens.color.textSecondary,
                        minWidth: 60,
                        textAlign: 'right',
                      }}
                    >
                      {versionName.length}/{MAX_VERSION_NAME_LENGTH}
                    </Typography>
                  ),
                }}
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={isLoading} color="inherit">
            {t('version.create.cancel')}
          </Button>
          <Button
            onClick={() => void handleConfirm()}
            variant="contained"
            disabled={isSubmitDisabled || isAcquiringLock}
            startIcon={isLoading || isAcquiringLock ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              borderRadius: 2,
              bgcolor: tokens.color.primary,
              '&:hover': {
                bgcolor: tokens.color.primary,
              },
            }}
          >
            {isLoading ? t('version.create.saving') : t('version.create.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showConfirmChecklist}
        onClose={() => setShowConfirmChecklist(false)}
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
        <DialogTitle sx={{ pb: 1 }}>{t('version.create.confirmChecklist.title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: tokens.color.textSecondary }}>
            {t('version.create.confirmChecklist.message')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={async () => {
              if (releaseRef.current) {
                await releaseRef.current();
                releaseRef.current = null;
              }
              setShowConfirmChecklist(false);
            }}
            color="inherit"
            disabled={isAcquiringLock}
          >
            {t('version.create.cancel')}
          </Button>
          <Button
            onClick={() => void handleConfirm()}
            variant="contained"
            disabled={isLoading || isAcquiringLock}
            sx={{
              borderRadius: 2,
              bgcolor: tokens.color.primary,
              '&:hover': {
                bgcolor: tokens.color.primary,
              },
            }}
          >
            {t('version.create.confirmChecklist.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateVersionDialog;
