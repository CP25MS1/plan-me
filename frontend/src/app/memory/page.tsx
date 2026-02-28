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

import { ListAlbumsResponseDto, AlbumDto, ListMemoriesResponseDto } from '@/api/memory/type';

import { useDeleteTripAlbum } from './hooks/use-delete-trip-album';
import ConfirmDialog from '@/components/common/dialog/confirm-dialog';

export default function MemoryPage() {
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery<ListAlbumsResponseDto>({
    queryKey: ['albums', 'me'],
    queryFn: () => getMyAccessibleAlbums(100),
    staleTime: 30_000,
  });

  const albums: AlbumDto[] = data?.items ?? [];

  const sorted = React.useMemo(() => {
    return [...albums].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [albums]);

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
            transition: '0.25s ease',
            background: 'linear-gradient(135deg, #fff 0%, #fafafa 100%)',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
            },
          }}
          onClick={() => router.push('/trip/create')}
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
        {sorted.map((album) => (
          <AlbumCard key={album.albumId} album={album} />
        ))}
      </Box>
    </Box>
  );
}

/*        ALBUM CARD       */

function AlbumCard({ album }: { album: AlbumDto }) {
  const router = useRouter();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);

  const { mutate: deleteAlbum, isPending: isDeleting } = useDeleteTripAlbum();

  const { data } = useQuery<ListMemoriesResponseDto>({
    queryKey: ['album-preview', album.albumId],
    queryFn: () => getMemoriesInAlbum(album.albumId, { limit: 100 }),
  });

  const memories = data?.items ?? [];

  const { imageCount, videoCount, coverImage } = React.useMemo(() => {
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
  }, [memories]);

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
        onClick={() => router.push(`/memory/${album.albumId}/memories`)}
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
        >
          <MoreVertIcon fontSize="small" />
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
            }}
          >
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>เพิ่มความทรงจำ</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              console.log('download album');
            }}
          >
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>ดาวน์โหลดอัลบั้ม</ListItemText>
          </MenuItem>

          {album.isOwner && (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setOpenDeleteDialog(true);
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
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
            {album.albumName}
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
        content={
          <Typography>คุณต้องการลบอัลบั้มนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</Typography>
        }
      />
    </>
  );
}
