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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('trip_memory');
  const me = useAppSelector((s) => s.profile.currentUser);

  const [selectedTripId, setSelectedTripId] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (open) {
      setSelectedTripId(null);
    }
  }, [open]);

  const { data: trips, isLoading: isTripsLoading } = useGetAllTrips();
  const { data: albumsData, isLoading: isAlbumsLoading } = useQuery<ListAlbumsResponseDto>({
    queryKey: ['my-accessible-albums'],
    queryFn: () => getMyAccessibleAlbums(100),
  });
  const { mutate: createAlbum, isPending } = useCreateTripAlbum();

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

    const selectedTrip = availableTrips.find((t) => t.id === selectedTripId);

    const formData = new FormData();
    formData.append('name', selectedTrip?.name ?? t('default_album_name'));

    createAlbum(
      { tripId: Number(selectedTripId), formData },
      {
        onSuccess: () => {
          setSelectedTripId(null);
          onClose();
        },
      }
    );
  };

  const isLoading = isTripsLoading || isAlbumsLoading;

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (isPending) return;
        if (reason === 'backdropClick') return;

        onClose();
      }}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle fontWeight={700}>{t('modal.select_trip_title')}</DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {availableTrips.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center">
                <Typography color="text.secondary">{t('modal.no_available_trip')}</Typography>
              </Box>
            ) : (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>{t('modal.select_trip_label')}</InputLabel>
                <Select
                  value={selectedTripId}
                  label={t('modal.select_trip_label')}
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
          {t('common:cancel')}
        </Button>

        <Button variant="contained" onClick={handleCreate} disabled={!selectedTripId || isPending}>
          {isPending ? (
            <CircularProgress size={20} thickness={5} sx={{ color: '#fff' }} />
          ) : (
            t('common:confirm')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
