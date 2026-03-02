'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
} from '@mui/material';

import { useGetAllTrips } from '@/app/profile/all-trip/hooks/use-get-all-trips';
import { TripSummary } from '@/api/all';
import { getMyAccessibleAlbums } from '@/api/memory/api';
import { ListAlbumsResponseDto } from '@/api/memory/type';
import { useCreateTripAlbum } from '../hooks/use-create-trip-album';
import { useAppSelector } from '@/store';
import { useQuery } from '@tanstack/react-query';

interface CreateTripAlbumModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateTripAlbumModal({ open, onClose }: CreateTripAlbumModalProps) {
  const me = useAppSelector((s) => s.profile.currentUser);

  const [selectedTripId, setSelectedTripId] = React.useState<number | ''>('');

  // ✅ ใช้ custom hook แทน
  const { data: trips, isLoading: isTripsLoading } = useGetAllTrips();

  // ✅ ดึง album ที่มีอยู่แล้ว
  const { data: albumsData, isLoading: isAlbumsLoading } = useQuery<ListAlbumsResponseDto>({
    queryKey: ['my-accessible-albums'],
    queryFn: () => getMyAccessibleAlbums(100),
  });

  const { mutate: createAlbum, isPending } = useCreateTripAlbum();

  // ✅ กรองเฉพาะทริปที่เราเป็น owner และยังไม่มี album
  const availableTrips = React.useMemo(() => {
    if (!trips) return [];

    const albums = albumsData?.items ?? [];
    const albumTripIds = new Set<number>(albums.map((a) => a.tripId));

    return trips.filter((trip: TripSummary) => {
      const isOwner = !!me?.id && !!trip.owner?.id && String(me.id) === String(trip.owner.id);

      const hasAlbum = albumTripIds.has(trip.id);

      return isOwner && !hasAlbum;
    });
  }, [trips, albumsData?.items, me?.id]);

  const handleCreate = () => {
    if (!selectedTripId) return;

    const formData = new FormData();

    createAlbum(
      { tripId: Number(selectedTripId), formData },
      {
        onSuccess: () => {
          setSelectedTripId('');
          onClose();
        },
      }
    );
  };

  const isLoading = isTripsLoading || isAlbumsLoading;

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle fontWeight={700}>กรุณาเลือกทริปที่ต้องการสร้าง Album</DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {availableTrips.length === 0 ? (
              <Typography color="text.secondary">ไม่มีทริปที่สามารถสร้าง Album ได้</Typography>
            ) : (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>เลือกทริป</InputLabel>
                <Select
                  value={selectedTripId}
                  label="เลือกทริป"
                  onChange={(e) => setSelectedTripId(Number(e.target.value))}
                >
                  {availableTrips.map((trip) => (
                    <MenuItem key={trip.id} value={trip.id}>
                      {trip.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isPending}>
          ปิด
        </Button>

        <Button variant="contained" onClick={handleCreate} disabled={!selectedTripId || isPending}>
          {isPending ? (
            <CircularProgress size={20} thickness={5} sx={{ color: '#fff' }} />
          ) : (
            'ยืนยัน'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
