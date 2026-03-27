'use client';

import { useEffect, useState } from 'react';
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

import { tokens } from '@/providers/theme/design-tokens';

const MAX_VERSION_NAME_LENGTH = 30;

type CreateVersionDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (versionName: string) => Promise<void>;
  isLoading?: boolean;
};

export const CreateVersionDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: CreateVersionDialogProps) => {
  const [versionName, setVersionName] = useState('');

  useEffect(() => {
    if (!open) {
      setVersionName('');
    }
  }, [open]);

  const trimmedVersionName = versionName.trim();
  const isSubmitDisabled = !trimmedVersionName || isLoading;

  const handleConfirm = async () => {
    if (isSubmitDisabled) {
      return;
    }

    await onConfirm(trimmedVersionName);
  };

  return (
    <Dialog
      open={open}
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
              เพิ่มบันทึกเวอร์ชัน
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.color.textSecondary }}>
              บันทึกเวอร์ชันของทริปนี้ไว้เพื่อกลับมาดูในภายหลัง
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: '8px !important' }}>
        <Stack spacing={1}>
          {/* ✅ Label อยู่ด้านบน */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: tokens.color.textPrimary,
            }}
          >
            ชื่อเวอร์ชัน
          </Typography>

          <TextField
            autoFocus
            fullWidth
            value={versionName}
            placeholder="e.g. เวอร์ชันที่ 1"
            onChange={(event) =>
              setVersionName(event.target.value.slice(0, MAX_VERSION_NAME_LENGTH))
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleConfirm();
              }
            }}
            disabled={isLoading}
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
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={isLoading} color="inherit">
          ยกเลิก
        </Button>
        <Button
          onClick={() => void handleConfirm()}
          variant="contained"
          disabled={isSubmitDisabled}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            borderRadius: 2,
            bgcolor: tokens.color.primary,
            '&:hover': {
              bgcolor: tokens.color.primary,
            },
          }}
        >
          {isLoading ? 'กำลังบันทึก' : 'บันทึกเวอร์ชัน'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateVersionDialog;
