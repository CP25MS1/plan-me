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

interface Props {
  memories: MemoryItemDto[];
  currentIndex: number;
  tripName: string;
  tripId: number;
  onClose: () => void;
}

export default function MemoryViewer({ memories, currentIndex, tripName, tripId, onClose }: Props) {
  // 1) เริ่ม index เป็น currentIndex เลย
  const [index, setIndex] = useState<number>(currentIndex);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openInfo, setOpenInfo] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const { mutate: deleteMemory, isPending: isDeleting } = useDeleteMemories();
  const { mutateAsync: refreshSignedUrl, isPending: isRefreshing } = useRefreshMemorySignedUrl();

  const containerRef = useRef<HTMLDivElement | null>(null);

  // flag เพื่อปิด onScroll ชั่วคราว ขณะกำลัง initial scroll
  const initializingRef = useRef<boolean>(false);

  // เมื่อ parent เปลี่ยน currentIndex (เช่น ผู้ใช้คลิกรูปอื่น) ให้ตั้ง index และ scroll ไปตำแหน่งนั้น 1 ครั้ง
  useEffect(() => {
    setIndex(currentIndex);

    // ถ้าไม่มี container ให้รอจน DOM พร้อม
    initializingRef.current = true;

    const tryScroll = () => {
      const container = containerRef.current;
      if (!container) {
        // ถ้ายังไม่พร้อม ให้ลองอีกเฟรม
        requestAnimationFrame(tryScroll);
        return;
      }

      const height = container.clientHeight || window.innerHeight;
      // ตั้ง scrollTop โดยตรง (ไม่ trigger loop)
      container.scrollTop = currentIndex * height;

      // ปล่อยให้ browser settle แล้วปิด initializing flag
      // small timeout to ensure scroll event finished
      window.setTimeout(() => {
        initializingRef.current = false;
      }, 60);
    };

    requestAnimationFrame(tryScroll);

    // cleanup not needed for requestAnimationFrame here
  }, [currentIndex]);

  // currentMemory ปลอดภัยเพราะ index ถูกตั้งจาก currentIndex ตอน mount
  const currentMemory = memories[index];
  if (!currentMemory) return null;

  const disableActions = isDownloading || isRefreshing || isDeleting;
  const isDownloadLoading = isDownloading || isRefreshing;

  // ===== Scroll Switch =====
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // ถ้าอยู่ช่วง initializing ให้ ignore event เพื่อลด flicker / race
    if (initializingRef.current) return;

    const el = e.currentTarget;
    const scrollTop = el.scrollTop;
    const height = el.clientHeight || window.innerHeight;

    // คำนวณ index จากตำแหน่ง scroll และอัพเดตเฉพาะเมื่อเปลี่ยน
    const newIndex = Math.round(scrollTop / height);
    if (newIndex !== index && newIndex >= 0 && newIndex < memories.length) {
      setIndex(newIndex);
    }
  };

  // ===== Check Expire =====
  const needsRefresh = (expiresAt?: string | null): boolean => {
    if (!expiresAt) return true;
    const expiresMs = new Date(expiresAt).getTime();
    return expiresMs - Date.now() < 60_000;
  };

  // ===== Download Helper =====
  const downloadBlobAndSave = async (url: string, filename: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(objectUrl);
  };

  // ===== Download Action =====
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

  // ===== Delete =====
  const handleDelete = () => {
    deleteMemory(
      { tripId, memoryIds: [currentMemory.id] },
      {
        onSuccess: () => {
          setOpenDelete(false);
          onClose();
        },
        onError: (err) => {
          console.error('Delete failed:', err);
        },
      }
    );
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
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
              <IconButton onClick={onClose} disabled={disableActions} sx={{ color: 'white' }}>
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
                sx={{ color: 'white', width: 40, height: 40 }}
              >
                {isDownloadLoading ? (
                  <CircularProgress size={20} thickness={5} sx={{ color: '#fff' }} />
                ) : (
                  <DownloadIcon />
                )}
              </IconButton>

              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                disabled={disableActions}
                sx={{ color: 'white' }}
              >
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
            }}
          >
            {memories.map((memory) => (
              <Box
                key={memory.id}
                sx={{
                  height: '100vh',
                  scrollSnapAlign: 'start',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {memory.memoryType === 'VIDEO' ? (
                  <video
                    src={memory.signedUrl}
                    controls
                    style={{ maxHeight: '100%', maxWidth: '100%' }}
                  />
                ) : (
                  <Box sx={{ position: 'relative', height: '100vh', width: '100%' }}>
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
          ลบ
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

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        open={openDelete}
        onClose={() => !isDeleting && setOpenDelete(false)}
        onConfirm={handleDelete}
        confirmLoading={isDeleting}
        confirmLabel="delete"
        cancelLabel="cancel"
        color="error"
        content={<Typography>คุณต้องการลบไฟล์นี้ใช่หรือไม่?</Typography>}
      />
    </>
  );
}
