'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Card, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ImagePlus } from 'lucide-react';

import { getMyAccessibleAlbums } from '@/api/memory/api';
import { ListAlbumsResponseDto } from '@/api/memory/type';

import { useAppSelector } from '@/store';

import AlbumCard from './components/album-card';
import CreateTripAlbumModal from './components/create-trip-album-modal';
import UploadMemoryDialog from './components/upload-memory-dialog';

export default function MemoryPage() {
  const router = useRouter();
  const me = useAppSelector((s) => s.profile.currentUser);

  const [openCreateModal, setOpenCreateModal] = React.useState(false);

  const [openUploadDialog, setOpenUploadDialog] = React.useState(false);
  const [uploadTripId, setUploadTripId] = React.useState<number | null>(null);

  const { data, isLoading, isError, error } = useQuery<ListAlbumsResponseDto>({
    queryKey: ['my-accessible-albums'],
    queryFn: () => getMyAccessibleAlbums(100),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
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
      {/* HEADER */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>
          ความทรงจำ
        </Typography>
        <Typography color="text.secondary">เพิ่มอัลบั้มความทรงจำให้ทริปของคุณ</Typography>
      </Box>

      {/* GRID */}
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
              สร้างอัลบั้ม
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
              onOpenUpload={(tripId) => {
                setUploadTripId(tripId);
                setOpenUploadDialog(true);
              }}
              onOpenAlbum={(tripId) => router.push(`/memory/${tripId}/memories`)}
            />
          );
        })}
      </Box>

      {/* CREATE ALBUM MODAL */}
      <CreateTripAlbumModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} />

      {/* UPLOAD MEMORY DIALOG */}
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
