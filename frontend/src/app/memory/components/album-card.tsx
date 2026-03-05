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
import { ImagePlus } from 'lucide-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

import { getMemoriesInAlbum } from '@/api/memory/api';
import { useGetAlbumSignedUrls } from '../hooks/use-get-album-signed-urls';
import { AlbumDto, ListMemoriesResponseDto } from '@/api/memory/type';
import { useDeleteTripAlbum } from '../hooks/use-delete-trip-album';
import ConfirmDialog from '@/components/common/dialog/confirm-dialog';
import { getMemoryCount } from '../utils/memory-count';

type AlbumCardProps = {
  album: AlbumDto;
  isOwner: boolean;
  onOpenUpload: (tripId: number) => void;
  onOpenAlbum: (tripId: number) => void;
};

export default function AlbumCard({ album, isOwner, onOpenUpload, onOpenAlbum }: AlbumCardProps) {
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
    staleTime: 0,
  });

  const { imageCount, videoCount, coverImage } = React.useMemo(() => {
    return getMemoryCount(data?.items ?? []);
  }, [data?.items]);

  const handleDelete = () => {
    deleteAlbum(
      { albumId: album.tripId },
      {
        onSuccess: () => {
          setOpenDeleteDialog(false);
        },
      }
    );
  };

  const {
    data: signedData,
    refetch: refetchSignedUrls,
    isFetching: isFetchingSigned,
  } = useGetAlbumSignedUrls(album.tripId);

  const downloadBlobAndSave = async (url: string, filename: string) => {
    const res = await fetch(url);
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

  const handleDownloadAlbum = async () => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      setProgress({ done: 0, total: signedData?.totalItems ?? 0 });

      const signed = signedData ?? (await refetchSignedUrls().then((r) => r.data));
      const items = signed?.items ?? [];

      for (let i = 0; i < items.length; i++) {
        const it = items[i];

        try {
          await downloadBlobAndSave(it.signedUrl, it.originalFilename);
        } finally {
          setProgress((p) => ({
            done: (p?.done ?? 0) + 1,
            total: items.length,
          }));
        }
      }
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
        {/* MENU */}
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
          {isDownloading ? <CircularProgress size={18} /> : <MoreVertIcon fontSize="small" />}
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
              <DownloadIcon fontSize="small" />
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

          <Typography variant="body2" color="text.secondary">
            {imageCount > 0 && `${imageCount} รูป`}
            {imageCount > 0 && videoCount > 0 && ' • '}
            {videoCount > 0 && `${videoCount} วิดีโอ`}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            noWrap
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            สร้างโดย {album.createdBy.username}
          </Typography>
        </Box>
      </Card>

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
