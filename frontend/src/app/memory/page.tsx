'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { ImagePlus } from 'lucide-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

import { getMyAccessibleAlbums, getMemoriesInAlbum } from '@/api/memory/api';
import { useGetAlbumSignedUrls } from './hooks/use-get-album-signed-urls';
import { ListAlbumsResponseDto, AlbumDto, ListMemoriesResponseDto } from '@/api/memory/type';
import { useDeleteTripAlbum } from './hooks/use-delete-trip-album';
import ConfirmDialog from '@/components/common/dialog/confirm-dialog';
import { useAppSelector } from '@/store';
import CreateTripAlbumModal from './components/create-trip-album-modal';
import UploadMemoryDialog from './components/upload-memory-dialog';

export default function MemoryPage() {
  const router = useRouter();
  const me = useAppSelector((s) => s.profile.currentUser);

  const [openCreateModal, setOpenCreateModal] = React.useState(false);

  // upload dialog state (opened when selecting "เพิ่มความทรงจำ" from kebab)
  const [openUploadDialog, setOpenUploadDialog] = React.useState(false);
  const [uploadTripId, setUploadTripId] = React.useState<number | null>(null);

  const { data, isLoading, isError, error } = useQuery<ListAlbumsResponseDto>({
    queryKey: ['my-accessible-albums'],
    queryFn: () => getMyAccessibleAlbums(100),
  });

  const sortedAlbums = React.useMemo(() => {
    const albums = data?.items ?? [];
    return [...albums].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data?.items]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={4}>
        <Typography color="error">เกิดข้อผิดพลาด: {(error as Error)?.message}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3} pb={10}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>
          ความทรงจำ
        </Typography>
        <Typography color="text.secondary">เพิ่มอัลบั้มความทรงจำให้ทริปของคุณ</Typography>
      </Box>

      {/* Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2.5,
        }}
      >
        {/* ADD CARD */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 2,
            cursor: 'pointer',
            transition: '0.25s ease',
            background: 'linear-gradient(135deg, #fff 0%, #fafafa 100%)',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
            },
          }}
          onClick={() => setOpenCreateModal(true)}
        >
          <Box
            sx={{
              height: 170,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <ImagePlus size={42} />
            <Typography mt={3} fontWeight={600}>
              เพิ่มความทรงจำ
            </Typography>
          </Box>
        </Card>

        {/* ALBUM CARDS */}
        {sortedAlbums.map((album) => {
          const isOwner =
            !!me?.id && !!album.createdBy?.id && String(me.id) === String(album.createdBy.id);

          return (
            <AlbumCard
              key={album.albumId}
              album={album}
              isOwner={isOwner}
              onOpenUpload={(tId) => {
                setUploadTripId(tId);
                setOpenUploadDialog(true);
              }}
              onOpenAlbum={(tId) => router.push(`/memory/${tId}/memories`)}
            />
          );
        })}
      </Box>

      {/* CREATE MODAL */}
      <CreateTripAlbumModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        // optional onCreated handled inside modal if it redirects
      />

      {/* UPLOAD DIALOG (opened from kebab "เพิ่มความทรงจำ") */}
      <UploadMemoryDialog
        open={openUploadDialog}
        onClose={() => {
          setOpenUploadDialog(false);
          setUploadTripId(null);
        }}
        tripId={uploadTripId ?? 0}
        existingTotalBytes={0}
      />
    </Box>
  );
}

/* =================== ALBUM CARD ====================== */
type AlbumCardProps = {
  album: AlbumDto;
  isOwner: boolean;
  onOpenUpload: (tripId: number) => void;
  onOpenAlbum: (tripId: number) => void;
};

function AlbumCard({ album, isOwner, onOpenUpload, onOpenAlbum }: AlbumCardProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [progress, setProgress] = React.useState<{ done: number; total: number } | null>(null);

  const { mutate: deleteAlbum, isPending: isDeleting } = useDeleteTripAlbum();

  const { data } = useQuery<ListMemoriesResponseDto>({
    queryKey: ['album-preview', album.albumId],
    queryFn: () =>
      getMemoriesInAlbum(album.tripId, {
        limit: 100,
      }),
  });

  const { imageCount, videoCount, coverImage } = React.useMemo(() => {
    const memories = data?.items ?? [];

    let image = 0;
    let video = 0;
    let firstImage: string | null = null;

    for (const memory of memories) {
      if (memory.memoryType === 'IMAGE') {
        image++;
        if (!firstImage) firstImage = memory.signedUrl;
      } else if (memory.memoryType === 'VIDEO') {
        video++;
      }
    }

    return {
      imageCount: image,
      videoCount: video,
      coverImage: firstImage,
    };
  }, [data?.items]);

  const handleDelete = () => {
    deleteAlbum(
      { albumId: album.albumId },
      {
        onSuccess: () => {
          setOpenDeleteDialog(false);
        },
      }
    );
  };

  // ---------- Album-level signed URLs hook ----------
  const {
    data: signedData,
    refetch: refetchSignedUrls,
    isFetching: isFetchingSigned,
  } = useGetAlbumSignedUrls(album.tripId);

  // helper to download blob and save
  const downloadBlobAndSave = async (url: string, filename: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${filename}: ${res.status}`);
    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  // sequential download whole album (called from kebab)
  const handleDownloadAlbum = async () => {
    if (isDownloading) return;
    try {
      setIsDownloading(true);
      setProgress({ done: 0, total: signedData?.totalItems ?? 0 });

      // ensure we have signed URLs (refetch if needed)
      const signed = signedData ?? (await refetchSignedUrls().then((r) => r.data));
      const items = signed?.items ?? [];

      for (let i = 0; i < items.length; i += 1) {
        const it = items[i];
        try {
          await downloadBlobAndSave(it.signedUrl, it.originalFilename);
        } catch (err) {
          console.error('Failed to download item', it.memoryId, err);
        } finally {
          setProgress((p) => ({ done: (p?.done ?? 0) + 1, total: items.length }));
        }
      }
    } catch (err) {
      console.error('Download album failed', err);
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setProgress(null);
      }, 300);
    }
  };

  return (
    <>
      <Card
        sx={{
          position: 'relative',
          borderRadius: 3,
          boxShadow: 2,
          cursor: 'pointer',
          transition: '0.25s ease',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #fff 0%, #fafafa 100%)',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-4px)',
          },
        }}
        onClick={() => onOpenAlbum(album.tripId)}
      >
        {/* KEBAB */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(e.currentTarget);
          }}
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            zIndex: 2,
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
          disabled={isDownloading || isDeleting || isFetchingSigned}
        >
          {isDownloading ? (
            <CircularProgress size={18} sx={{ color: 'white' }} />
          ) : (
            <MoreVertIcon fontSize="small" />
          )}
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              // open upload dialog for this album's trip
              onOpenUpload(album.tripId);
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
              {isDownloading ? (
                <CircularProgress size={18} sx={{ color: 'white' }} />
              ) : (
                <DownloadIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              ดาวน์โหลดอัลบั้ม
              {progress ? ` (${progress.done}/${progress.total})` : ''}
            </ListItemText>
          </MenuItem>

          {isOwner && (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setOpenDeleteDialog(true);
              }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>ลบอัลบั้ม</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* COVER */}
        <Box
          sx={{
            height: 120,
            backgroundColor: '#f4f4f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {coverImage ? (
            <Box
              component="img"
              src={coverImage}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <ImagePlus size={40} opacity={0.3} />
          )}
        </Box>

        {/* INFO */}
        <Box sx={{ p: 1.2 }}>
          <Typography fontWeight={600} noWrap>
            {album.tripName}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {imageCount} รูป {videoCount} วิดีโอ
          </Typography>
        </Box>
      </Card>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDelete}
        confirmLabel="delete"
        cancelLabel="cancel"
        confirmLoading={isDeleting}
        color="error"
        content={<Typography>คุณต้องการลบอัลบั้มนี้ใช่หรือไม่?</Typography>}
      />
    </>
  );
}
