'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { useUploadMemories } from '../hooks/use-upload-memories';
import {
  getFileExtension,
  isSupportedExtension,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
} from '../utils/file';

import { AppSnackbar } from '@/components/common/snackbar/snackbar';

interface Props {
  open: boolean;
  onClose: () => void;
  tripId: number;
  existingTotalBytes: number;
}

export default function UploadMemoryDialog({ open, onClose, tripId, existingTotalBytes }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
    duration?: number;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { mutateAsync, isPending } = useUploadMemories();

  // ===== Preview URLs =====
  const previews = useMemo(() => {
    return files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isVideo: file.type.startsWith('video'),
    }));
  }, [files]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ===== Validate when selecting files =====
  const handleSelectFiles = (newFiles: File[]) => {
    let total = existingTotalBytes + files.reduce((sum, f) => sum + f.size, 0);

    for (const file of newFiles) {
      if (file.size > MAX_FILE_BYTES) {
        setSnackbar({
          open: true,
          message: `ขนาดไฟล์เกิน 1GB`,
          severity: 'error',
        });
        return;
      }

      const ext = getFileExtension(file.name);
      if (!isSupportedExtension(ext)) {
        setSnackbar({
          open: true,
          message: `รองรับไฟล์ประเภท .png, .jpg, .jpeg, .mov, .mp4`,
          severity: 'error',
          duration: 5000,
        });
        return;
      }

      total += file.size;
    }

    if (total > MAX_TOTAL_BYTES) {
      setSnackbar({
        open: true,
        message: 'ขนาดรวมของไฟล์เกิน 3GB',
        severity: 'error',
      });
      return;
    }

    setFiles(newFiles);
  };

  const handleUpload = async () => {
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    try {
      await mutateAsync({ tripId, formData });

      setSnackbar({
        open: true,
        message: 'อัปโหลดสำเร็จ',
        severity: 'success',
      });

      setFiles([]);
      onClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'อัปโหลดไม่สำเร็จ',
        severity: 'error',
      });
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={isPending ? undefined : onClose}
        disableEscapeKeyDown={isPending}
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>เพิ่มความทรงจำ</DialogTitle>

        <DialogContent>
          {/* Upload Area */}
          {files.length === 0 && (
            <Box
              component="label"
              sx={{
                display: 'block',
                width: '100%',
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: '#fafafa',
                mb: 3,
                transition: '0.2s',
                '&:hover': {
                  bgcolor: '#f0f0f0',
                },
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={1}>
                กดเพื่อเลือกไฟล์
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={1}>
                รองรับไฟล์ประเภท
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={1}>
                .png, .jpg, .jpeg, .mov, .mp4
              </Typography>

              <Typography variant="body2" color="text.secondary">
                สูงสุด 1GB ต่อไฟล์ ไม่เกิน 3GB ต่อครั้ง
              </Typography>

              <input
                hidden
                type="file"
                multiple
                onChange={(e) =>
                  handleSelectFiles(e.target.files ? Array.from(e.target.files) : [])
                }
              />
            </Box>
          )}

          {/* ===== Preview Grid ===== */}
          {previews.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 2,
              }}
            >
              {previews.map((preview, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  {preview.isVideo ? (
                    <Box
                      component="video"
                      src={preview.url}
                      muted
                      preload="metadata"
                      sx={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src={preview.url}
                      sx={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                      }}
                    />
                  )}

                  {/* Remove button */}
                  <IconButton
                    size="small"
                    onClick={() => removeFile(index)}
                    disabled={isPending}
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>

                  {/* Video overlay */}
                  {preview.isVideo && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.25)',
                        pointerEvents: 'none',
                      }}
                    >
                      <PlayArrowIcon
                        sx={{
                          fontSize: 40,
                          color: 'white',
                          bgcolor: 'rgba(0,0,0,0.4)',
                          borderRadius: '50%',
                          p: 0.5,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isPending} sx={{ fontWeight: 600 }}>
            ยกเลิก
          </Button>

          <Button
            variant="contained"
            disabled={isPending || files.length === 0}
            onClick={handleUpload}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              minWidth: 120,
            }}
          >
            {isPending ? <CircularProgress size={22} color="inherit" /> : 'อัปโหลด'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Snackbar ===== */}
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        duration={snackbar.duration}
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </>
  );
}
