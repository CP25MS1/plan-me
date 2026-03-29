'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { getMemoryCount } from '../../utils/memory-count';
import { useGetMemoriesInAlbum } from '../../hooks/use-get-memories-in-album';
import { useGetMyAccessibleAlbums } from '../../hooks/use-get-my-accessible-albums';
import { useGetAlbumSignedUrls } from '../../hooks/use-get-album-signed-urls';
import { useDeleteTripAlbum } from '../../hooks/use-delete-trip-album';
import MemoryViewer from '../../components/memory-viewer';
import UploadMemoryDialog from '../../components/upload-memory-dialog';
import { useAppSelector } from '@/store';
import { downloadBlobAndSave } from '../../utils/download-blob';
export default function AlbumMemoriesPage() {
  const router = useRouter();
  const params = useParams();

  const tripId = Number(params.tripId);

  const { data: albumsData, isLoading: albumsLoading } = useGetMyAccessibleAlbums({});

  const {
    data: memoriesData,
    isLoading: memoriesLoading,
    isError,
  } = useGetMemoriesInAlbum({
    tripId,
  });

  const {
    data: albumSignedData,
    isFetching: isFetchingSignedUrls,
    isLoading: isLoadingSignedUrls,
    refetch: refetchAlbumSignedUrls,
  } = useGetAlbumSignedUrls(tripId);

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [openUpload, setOpenUpload] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDeleteAlbumConfirm, setOpenDeleteAlbumConfirm] = useState(false);
  const [isDownloadingAlbum, setIsDownloadingAlbum] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ done: number; total: number } | null>(
    null
  );

  const currentAlbum = useMemo(() => {
    return albumsData?.items.find((album) => album.tripId === tripId);
  }, [albumsData, tripId]);

  const tripName = currentAlbum?.tripName ?? `Trip #${tripId}`;

  const memories = useMemo(() => {
    return (memoriesData?.items ?? [])
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [memoriesData]);

  const { imageCount, videoCount } = React.useMemo(() => {
    return getMemoryCount(memories);
  }, [memories]);

  const existingTotalBytes = memories.reduce((sum, m) => sum + (m.sizeBytes ?? 0), 0);

  const me = useAppSelector((s) => s.profile.currentUser);

  const isOwner =
    !!me?.id &&
    !!currentAlbum?.createdBy?.id &&
    String(me.id) === String(currentAlbum.createdBy.id);

  const { mutate: deleteAlbum, isPending: isDeletingAlbum } = useDeleteTripAlbum();

  const loadingAny =
    albumsLoading ||
    memoriesLoading ||
    isFetchingSignedUrls ||
    isLoadingSignedUrls ||
    isDownloadingAlbum ||
    isDeletingAlbum;

  if (!tripId || Number.isNaN(tripId)) {
    return <Typography color="error">TripId ไม่ถูกต้อง</Typography>;
  }

  if (albumsLoading || memoriesLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress size={20} thickness={5} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (isError) {
    return <Typography color="error">โหลดไม่สำเร็จ</Typography>;
  }

  const handleDownloadAlbum = async () => {
    if (loadingAny) return;

    try {
      setIsDownloadingAlbum(true);
      setDownloadProgress({ done: 0, total: albumSignedData?.totalItems ?? 0 });

      const signed = albumSignedData ?? (await refetchAlbumSignedUrls().then((r) => r.data));
      const items = signed?.items ?? [];

      for (let i = 0; i < items.length; i += 1) {
        const it = items[i];
        try {
          await downloadBlobAndSave(it.signedUrl, it.originalFilename);
        } catch (err) {
          console.error('Failed to download item', it.memoryId, err);
        } finally {
          setDownloadProgress((prev) => ({
            done: prev ? prev.done + 1 : i + 1,
            total: items.length,
          }));
        }
      }
    } catch (err) {
      console.error('Download album failed', err);
    } finally {
      setTimeout(() => {
        setIsDownloadingAlbum(false);
        setDownloadProgress(null);
      }, 300);
    }
  };

  const handleDeleteAlbum = () => {
    if (!currentAlbum) return;
    deleteAlbum(
      { albumId: currentAlbum.albumId },
      {
        onSuccess: () => {
          setOpenDeleteAlbumConfirm(false);
          router.push('/memory');
        },
        onError: (err) => {
          console.error('Delete album failed', err);
        },
      }
    );
  };

  return (
    <Box p={3} pb={10}>
      {/* Back + Title + Kebab */}
      <Box display="flex" alignItems="center" mb={2} justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => router.push('/memory')} disabled={loadingAny}>
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={700} ml={1}>
            {tripName}
          </Typography>
        </Box>

        {/* Kebab */}
        <Box>
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            disabled={loadingAny}
            aria-label="menu"
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setOpenUpload(true);
              }}
            >
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>เพิ่มความทรงจำ</ListItemText>
            </MenuItem>

            <MenuItem
              onClick={async () => {
                setAnchorEl(null);
                await handleDownloadAlbum();
              }}
            >
              <ListItemIcon>
                {isDownloadingAlbum ? (
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                ) : (
                  <DownloadIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText>
                ดาวน์โหลดอัลบั้ม
                {downloadProgress ? ` (${downloadProgress.done}/${downloadProgress.total})` : ''}
              </ListItemText>
            </MenuItem>

            {isOwner && (
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setOpenDeleteAlbumConfirm(true);
                }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>ลบอัลบั้ม</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Box>

      {/* Metadata */}
      <Typography variant="body2" color="text.secondary" mb={2}>
        {imageCount} รูป {videoCount} วิดีโอ
      </Typography>

      {/* Empty */}
      {memories.length === 0 && (
        <Box textAlign="center" mt={10}>
          <Typography variant="h6" mb={1}>
            ยังไม่มีความทรงจำ
          </Typography>
        </Box>
      )}

      {/* Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          opacity: loadingAny ? 0.6 : 1,
          pointerEvents: loadingAny ? 'none' : 'auto',
        }}
      >
        {memories.map((memory, index) => {
          const isVideo = memory.memoryType === 'VIDEO';

          return (
            <Box
              key={memory.id}
              onClick={() => {
                if (loadingAny) return;
                setViewerIndex(index);
              }}
              sx={{
                cursor: loadingAny ? 'default' : 'pointer',
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {isVideo ? (
                <Box
                  component="video"
                  src={memory.signedUrl}
                  muted
                  preload="metadata"
                  playsInline
                  sx={{
                    width: '100%',
                    height: 150,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                <Box
                  component="img"
                  src={memory.signedUrl}
                  alt={memory.originalFilename}
                  sx={{
                    width: '100%',
                    height: 150,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              )}

              {isVideo && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.25)',
                  }}
                >
                  <PlayArrowIcon
                    sx={{
                      fontSize: 50,
                      color: 'white',
                      bgcolor: 'rgba(0,0,0,0.4)',
                      borderRadius: '50%',
                      p: 1,
                    }}
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* FAB */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={() => setOpenUpload(true)}
        disabled={loadingAny}
      >
        <AddIcon />
      </Fab>

      {/* Viewer */}
      {viewerIndex !== null && (
        <MemoryViewer
          key={viewerIndex}
          memories={memories}
          currentIndex={viewerIndex}
          tripName={tripName}
          onClose={() => setViewerIndex(null)}
          tripId={tripId}
        />
      )}

      {/* Upload */}
      <UploadMemoryDialog
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        tripId={tripId}
        existingTotalBytes={existingTotalBytes}
      />

      {/* Delete Album Confirm */}
      <ConfirmDeleteAlbumDialog
        open={openDeleteAlbumConfirm}
        loading={isDeletingAlbum}
        onClose={() => setOpenDeleteAlbumConfirm(false)}
        onConfirm={handleDeleteAlbum}
      />
    </Box>
  );
}

/* Small confirm dialog component for deleting album (kept local to this file) */
function ConfirmDeleteAlbumDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={() => !loading && onClose()}>
      <Box sx={{ p: 2 }}>
        <Typography mb={2}>คุณต้องการลบอัลบั้มนี้ใช่หรือไม่?</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} disabled={loading}>
            ยกเลิก
          </Button>

          <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
            {loading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'ลบ'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
