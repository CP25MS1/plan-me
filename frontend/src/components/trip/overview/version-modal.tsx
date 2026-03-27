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
import dayjs from 'dayjs';

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
  const isEmpty = versions.length === 0;
  const canAddMore = versions.length < MAX_VERSIONS;
  const latestVersion = versions.reduce<TripVersion | null>((latestItem, version) => {
    if (!latestItem) {
      return version;
    }

    return dayjs(version.createdAt).valueOf() > dayjs(latestItem.createdAt).valueOf()
      ? version
      : latestItem;
  }, null);

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
              บันทึกเวอร์ชัน
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.color.textSecondary }}>
              {versions.length}/{MAX_VERSIONS} จำนวนบันทึกเวอร์ชัน
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
              ยังไม่มีบันทึกเวอร์ชัน
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.color.textSecondary, mb: 2 }}>
              เฉพาะเจ้าของทริปเท่านั้นที่สามารถสร้างบันทึกเวอร์ชันได้
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
                สร้างบันทึกเวอร์ชันใหม่
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
                isLatest={version.id === latestVersion?.id}
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
            {canAddMore ? 'สร้างบันทึกเวอร์ชัน' : 'บันทึกเวอร์ชันครบแล้ว'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VersionModal;
