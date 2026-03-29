'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Menu,
  MenuItem,
  DialogTitle,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ConfirmDialog from '@/components/common/dialog/confirm-dialog';
import { useDeleteMemories } from '../hooks/use-delete-memories';
import { useRefreshMemorySignedUrl } from '../hooks/use-refresh-memory-signed-url';
import { MemoryItemDto } from '@/api/memory/type';
import Image from 'next/image';
import { formatFileSize } from '../utils/format-file-size';
import { needsRefresh } from '../utils/refresh';
import { useWheelPageScroll } from '../hooks/use-wheel-page-scroll';
import { downloadBlobAndSave } from '../utils/download-blob';
import { useTouchPageScroll } from '../hooks/use-touch-page-scroll';

interface Props {
  memories: MemoryItemDto[];
  currentIndex: number;
  tripName: string;
  tripId: number;
  onClose: () => void;
}

export default function MemoryViewer({ memories, currentIndex, tripName, tripId, onClose }: Props) {
  const [index, setIndex] = useState<number>(currentIndex);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openInfo, setOpenInfo] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const { mutate: deleteMemory, isPending: isDeleting } = useDeleteMemories();
  const { mutateAsync: refreshSignedUrl, isPending: isRefreshing } = useRefreshMemorySignedUrl();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const initializingRef = useRef<boolean>(false);
  const wheelLockRef = useRef<boolean>(false);

  useEffect(() => {
    setIndex(currentIndex);

    initializingRef.current = true;

    const tryScroll = () => {
      const container = containerRef.current;
      if (!container) {
        requestAnimationFrame(tryScroll);
        return;
      }

      const height = container.clientHeight || window.innerHeight;

      container.scrollTop = currentIndex * height;

      setTimeout(() => {
        initializingRef.current = false;
      }, 60);
    };

    requestAnimationFrame(tryScroll);
  }, [currentIndex]);

  useWheelPageScroll({
    containerRef,
    index,
    setIndex,
    length: memories.length,
    wheelLockRef,
  });

  useTouchPageScroll({
    containerRef,
    index,
    setIndex,
    length: memories.length,
  });

  const currentMemory = memories[index];
  if (!currentMemory) return null;

  const disableActions = isDownloading || isRefreshing || isDeleting;
  const isDownloadLoading = isDownloading || isRefreshing;

  // ===== Sync index with scroll =====
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (initializingRef.current) return;

    const el = e.currentTarget;
    const scrollTop = el.scrollTop;
    const height = el.clientHeight || window.innerHeight;

    const newIndex = Math.round(scrollTop / height);

    if (newIndex !== index && newIndex >= 0 && newIndex < memories.length) {
      setIndex(newIndex);
    }
  };

  const handleDownload = async () => {
    if (disableActions) return;

    setIsDownloading(true);

    try {
      let signedUrlToUse = currentMemory.signedUrl;

      if (needsRefresh(currentMemory.signedUrlExpiresAt)) {
        const res = await refreshSignedUrl({
          tripId,
          memoryId: currentMemory.id,
          extension: currentMemory.fileExtension,
        });

        signedUrlToUse = res.signedUrl;
      }

      await downloadBlobAndSave(signedUrlToUse, currentMemory.originalFilename);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    deleteMemory(
      { tripId, memoryIds: [currentMemory.id] },
      {
        onSuccess: () => {
          setOpenDelete(false);
          onClose();
        },
      }
    );
  };

  return (
    <>
      <Dialog open fullScreen>
        <DialogContent
          sx={{
            backgroundColor: 'black',
            p: 0,
            overflow: 'hidden',
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              right: 16,
              display: 'flex',
              justifyContent: 'space-between',
              color: 'white',
              zIndex: 10,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={onClose} sx={{ color: 'white' }}>
                <ArrowBackIcon />
              </IconButton>

              <Box>
                <Typography fontWeight={600}>{tripName}</Typography>
                <Typography variant="caption">
                  Uploaded by {currentMemory.uploader?.username ?? '-'}
                </Typography>
              </Box>
            </Box>

            <Box>
              <IconButton
                onClick={handleDownload}
                disabled={disableActions}
                sx={{ color: 'white' }}
              >
                {isDownloadLoading ? (
                  <CircularProgress size={20} sx={{ color: '#fff' }} />
                ) : (
                  <DownloadIcon />
                )}
              </IconButton>

              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'white' }}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>

          {/* CONTENT */}
          <Box
            ref={containerRef}
            onScroll={handleScroll}
            sx={{
              height: '100vh',
              overflowY: 'auto',

              scrollSnapType: 'y mandatory',

              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorY: 'contain',

              touchAction: 'pan-y',
            }}
          >
            {memories.map((memory) => (
              <Box
                key={memory.id}
                sx={{
                  height: '100vh',
                  minHeight: '100vh',

                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always',

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {memory.memoryType === 'VIDEO' ? (
                  <video
                    src={memory.signedUrl}
                    controls
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: 'relative',
                      height: '100vh',
                      width: '100%',
                    }}
                  >
                    <Image
                      src={memory.signedUrl}
                      alt={memory.originalFilename}
                      fill
                      unoptimized
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                )}
              </Box>
            ))}
            {/* INDEX INDICATOR */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 24,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <Typography
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.4)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {index + 1} / {memories.length}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setOpenInfo(true);
          }}
        >
          <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          รายละเอียด
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setOpenDelete(true);
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          ลบรูป/วิดีโอ
        </MenuItem>
      </Menu>

      {/* INFO */}
      <Dialog open={openInfo} onClose={() => setOpenInfo(false)}>
        <DialogTitle>รายละเอียดไฟล์</DialogTitle>
        <DialogContent>
          <Typography>อัปโหลดโดย: {currentMemory.uploader?.username}</Typography>
          <Typography>
            วันที่อัปโหลด: {new Date(currentMemory.createdAt).toLocaleString()}
          </Typography>
          <Typography>ขนาดไฟล์: {formatFileSize(currentMemory.sizeBytes)}</Typography>
          <Typography>ประเภทไฟล์: {currentMemory.contentType}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInfo(false)}>ปิด</Button>
        </DialogActions>
      </Dialog>

      {/* DELETE */}
      <ConfirmDialog
        open={openDelete}
        onClose={() => !isDeleting && setOpenDelete(false)}
        onConfirm={handleDelete}
        confirmLoading={isDeleting}
        confirmLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        color="error"
        content={<Typography>คุณต้องการลบรูปภาพหรือวิดีโอนี้ใช่หรือไม่?</Typography>}
      />
    </>
  );
}
