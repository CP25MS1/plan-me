'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, CircularProgress, IconButton, Button, Fab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';

import { useGetMemoriesInAlbum } from '../../hooks/use-get-memories-in-album';
import MemoryViewer from '../../components/memory-viewer';
import UploadMemoryDialog from '../../components/upload-memory-dialog';

export default function AlbumMemoriesPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = Number(params.albumId);
  const tripId = Number(params.albumId);
  const { data, isLoading, isError } = useGetMemoriesInAlbum({ tripId: albumId });

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [openUpload, setOpenUpload] = useState(false);

  const memories = useMemo(() => {
    return (data?.items ?? []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data]);
  const existingTotalBytes = memories.reduce((sum, m) => sum + m.sizeBytes, 0);

  const lastUpdated = memories[0]?.createdAt;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Typography color="error">โหลดไม่สำเร็จ</Typography>;
  }

  return (
    <Box p={3} pb={10}>
      {/* Back + Title */}
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => router.push('/memory')}>
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h6" fontWeight={700} ml={1}>
          Album #{albumId}
        </Typography>
      </Box>

      {/* Metadata */}
      <Typography variant="body2" color="text.secondary" mb={3}>
        {memories.length} รูป • อัปเดตล่าสุด{' '}
        {lastUpdated ? new Date(lastUpdated).toLocaleString() : '-'}
      </Typography>

      {/* Empty */}
      {memories.length === 0 && (
        <Box textAlign="center" mt={10}>
          <Typography variant="h6" mb={1}>
            ยังไม่มีความทรงจำ
          </Typography>

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenUpload(true)}>
            เพิ่มความทรงจำ
          </Button>
        </Box>
      )}

      {/* Content */}
      {memories.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
          }}
        >
          {memories.map((memory, index) => (
            <Box key={memory.id} onClick={() => setViewerIndex(index)} sx={{ cursor: 'pointer' }}>
              <Box
                component="img"
                src={memory.signedUrl}
                sx={{
                  width: '100%',
                  height: 150,
                  objectFit: 'cover',
                  borderRadius: 2,
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* FAB */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setOpenUpload(true)}
      >
        <AddIcon />
      </Fab>

      {/* Viewer */}
      {viewerIndex !== null && (
        <MemoryViewer
          memories={memories}
          currentIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

      {/* Upload Dialog */}
      <UploadMemoryDialog
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        tripId={tripId}
        existingTotalBytes={existingTotalBytes}
      />
    </Box>
  );
}
