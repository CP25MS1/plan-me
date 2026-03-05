'use client';

import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  CardMedia,
  Box,
} from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { AlbumDto } from '@/api/memory/type';
import { useDeleteTripAlbum } from '../hooks/use-delete-trip-album';
import type { Route } from 'next';
import { useAppSelector } from '@/store';
interface Props {
  album: AlbumDto;
}

export default function AlbumCard({ album }: Props) {
  const router = useRouter();
  const me = useAppSelector((s) => s.profile.currentUser);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const deleteMutation = useDeleteTripAlbum();
  const handleDelete = async () => {
    await deleteMutation.mutateAsync({
      albumId: album.albumId,
    });
    setAnchorEl(null);
  };

  const handleDownload = () => {
    window.open(`/api/trips/${album.tripId}/album/download`);
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    router.push(`/trips/${album.tripId}/album/memories` as Route);
  };
  const isOwner = album.createdBy?.id === me?.id;

  return (
    <Card sx={{ cursor: 'pointer' }} onClick={handleCardClick}>
      {album.thumbnailMemoryId ? (
        <CardMedia component="img" height="160" image={album.thumbnailMemoryId} />
      ) : (
        <CardMedia component="div" sx={{ height: 160, backgroundColor: '#f4f4f4' }} />
      )}

      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box>
            <Typography variant="h6">{album.tripName}</Typography>
            <Typography variant="body2">{album.memoryCount} รูป</Typography>
          </Box>

          {/* IMPORTANT: stopPropagation กันมันเด้งไปหน้า */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={handleDownload}>
            <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
            ดาวน์โหลดอัลบั้ม
          </MenuItem>

          {isOwner && (
            <MenuItem onClick={handleDelete}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              ลบอัลบั้ม
            </MenuItem>
          )}
        </Menu>
      </CardContent>
    </Card>
  );
}
