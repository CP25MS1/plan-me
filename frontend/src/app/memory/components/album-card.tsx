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
interface Props {
  album: AlbumDto;
}

export default function AlbumCard({ album }: Props) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const deleteMutation = useDeleteTripAlbum();
  const path: Route = `/trips/${album.tripId}/album/memories`;
  const handleDelete = async () => {
    await deleteMutation.mutateAsync(album.tripId);
    setAnchorEl(null);
  };

  const handleDownload = () => {
    window.open(`/api/trips/${album.tripId}/album/download`);
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    router.push(path);
  };

  return (
    <Card sx={{ cursor: 'pointer' }} onClick={handleCardClick}>
      {album.thumbnailUrl ? (
        <CardMedia component="img" height="160" image={album.thumbnailUrl} />
      ) : (
        <CardMedia component="div" height="160" />
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

          {album.isOwner && (
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
