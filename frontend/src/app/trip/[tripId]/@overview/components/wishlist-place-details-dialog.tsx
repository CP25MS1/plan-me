'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Typography } from '@mui/material';
import { useSelector } from 'react-redux';

import { useTripWishlistPlaces } from '@/api/trips';
import PlaceDetailsDialog from '@/app/trip/[tripId]/components/place-details/place-details-dialog';
import { useUpdateWishlistPlace } from '@/app/trip/[tripId]/@overview/hooks';
import { useTripLockLease } from '@/app/trip/[tripId]/realtime/hooks/use-trip-lock-lease';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { RootState } from '@/store';
import { useTripRealtimeLocksMap } from '@/store/selectors';

type WishlistPlaceDetailsDialogProps = {
  tripId: number;
  wishlistPlaceId: number | null;
  onClose: () => void;
};

export const WishlistPlaceDetailsDialog = ({
  tripId,
  wishlistPlaceId,
  onClose,
}: WishlistPlaceDetailsDialogProps) => {
  const myUserId = useSelector((s: RootState) => s.profile.currentUser?.id);
  const { data: wishlistPlaces = [] } = useTripWishlistPlaces(tripId);
  const locksMap = useTripRealtimeLocksMap(tripId);

  const selected = useMemo(() => {
    if (!wishlistPlaceId) return null;
    return wishlistPlaces.find((wp) => wp.id === wishlistPlaceId) ?? null;
  }, [wishlistPlaceId, wishlistPlaces]);

  const { mutate: updateNotes } = useUpdateWishlistPlace(tripId);
  const { acquireLease } = useTripLockLease(tripId);

  const editReleaseRef = useRef<null | (() => Promise<void>)>(null);
  const { showWarning } = useSnackbar();

  useEffect(() => {
    return () => {
      void editReleaseRef.current?.();
      editReleaseRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (wishlistPlaceId && !selected) {
      onClose();
    }
  }, [onClose, selected, wishlistPlaceId]);

  const handleClose = useCallback(() => {
    void editReleaseRef.current?.();
    editReleaseRef.current = null;
    onClose();
  }, [onClose]);

  const handleSaveNotes = useCallback(
    async (notes: string) => {
      if (!selected) return;
      await new Promise<void>((resolve, reject) => {
        updateNotes(
          { placeId: selected.id, notes },
          {
            onSuccess: () => resolve(),
            onError: (e) => reject(e),
          }
        );
      });
    },
    [selected, updateNotes]
  );

  if (!wishlistPlaceId || !selected) return null;

  const lock = locksMap[`WISHLIST_PLACE:${selected.id}`];
  const lockedByOther = Boolean(lock) && Boolean(myUserId) && lock!.owner.id !== myUserId;

  return (
    <>
      <PlaceDetailsDialog
        isOpened={Boolean(wishlistPlaceId)}
        onClose={handleClose}
        ggmpId={selected.place.ggmpId}
        notableInfo={
          lockedByOther ? (
            <Typography variant="caption" sx={{ display: 'block', color: 'warning.main' }}>
              Locked by {lock?.owner.username ?? 'someone'} — view only
            </Typography>
          ) : null
        }
        notableProps={{
          notes: selected.notes ?? '',
          onSave: handleSaveNotes,
          onBeginEdit: async () => {
            const lease = await acquireLease({
              resourceType: 'WISHLIST_PLACE',
              resourceId: selected.id,
              purpose: 'EDIT',
            });

            if (lease.status === 'conflict') {
              showWarning(`Locked by ${lease.lock.owner.username}`);
              return false;
            }

            editReleaseRef.current = lease.release;
            return true;
          },
          onEndEdit: async () => {
            await editReleaseRef.current?.();
            editReleaseRef.current = null;
          },
        }}
      />

    </>
  );
};

export default WishlistPlaceDetailsDialog;
