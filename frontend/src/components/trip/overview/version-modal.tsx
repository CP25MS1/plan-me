'use client';

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { History, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { TripVersion } from '@/api/trips';
import { tokens } from '@/providers/theme/design-tokens';
import VersionCard from './version-card';

const MAX_VERSIONS = 3;

type VersionModalProps = {
  open: boolean;
  onClose: () => void;
  versions: TripVersion[];
  onAddVersion: () => void;
  onDeleteVersion: (versionId: number) => Promise<void>;
  isLoading?: boolean;
  isOwner: boolean;
};

export const VersionModal = ({
  open,
  onClose,
  versions,
  onAddVersion,
  onDeleteVersion,
  isLoading = false,
  isOwner,
}: VersionModalProps) => {
  const { t } = useTranslation('trip_overview');
  const isEmpty = versions.length === 0;
  const canAddMore = versions.length < MAX_VERSIONS;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
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

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: tokens.color.textPrimary }}>
              {t('version.modal.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.color.textSecondary }}>
              {t('version.modal.count', { current: versions.length, max: MAX_VERSIONS })}
            </Typography>
          </Box>

          <IconButton onClick={onClose}>
            <X size={18} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: '8px !important' }}>
        {isLoading && isEmpty ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress sx={{ color: tokens.color.primary }} />
          </Box>
        ) : null}

        {!isLoading && isEmpty ? (
          <Box
            sx={{
              py: 5,
              px: 3,
              textAlign: 'center',
              border: `1px dashed ${tokens.color.primary}`,
              borderRadius: 2,
              bgcolor: tokens.color.lightBackground,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: tokens.color.textPrimary, mb: 0.5 }}>
              {t('version.modal.empty.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.color.textSecondary, mb: 2 }}>
              {t('version.modal.empty.description')}
            </Typography>

            {isOwner && (
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={onAddVersion}
                sx={{
                  borderRadius: 2,
                  bgcolor: tokens.color.primary,
                  '&:hover': {
                    bgcolor: tokens.color.primaryDark,
                  },
                }}
              >
                {t('version.modal.empty.cta')}
              </Button>
            )}
          </Box>
        ) : null}

        {!isEmpty ? (
          <Stack spacing={1}>
            {versions.map((version) => (
              <VersionCard
                key={version.id}
                tripId={version.tripId}
                version={version}
                onDelete={onDeleteVersion}
                isOwner={isOwner}
              />
            ))}
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'center' }}>
        {isOwner && !isEmpty && (
          <Button
            variant="contained"
            onClick={onAddVersion}
            disabled={!canAddMore || isLoading}
            startIcon={
              isLoading ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />
            }
            sx={{
              borderRadius: 2,
              bgcolor: tokens.color.primary,
              '&:hover': { bgcolor: tokens.color.primaryDark },
            }}
          >
            {canAddMore ? t('version.modal.addVersion') : t('version.modal.addVersionFull')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VersionModal;
