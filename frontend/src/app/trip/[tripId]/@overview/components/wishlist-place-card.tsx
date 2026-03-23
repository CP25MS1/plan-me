'use client';

import React, { useRef, useState } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import { Map, Star, Trash2 as Trash } from 'lucide-react';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { WishlistPlace } from '@/api/trips';
import { RootState } from '@/store';
import { ConfirmDialog } from '@/components/common/dialog';
import { useRemoveWishlistPlace } from '../hooks';
import { tokens } from '@/providers/theme/design-tokens';
import { SwipeReveal } from '@/components/common/card';
import { useTripLockLease } from '@/app/trip/[tripId]/realtime/hooks/use-trip-lock-lease';
import { useTripRealtimeLocksMap } from '@/store/selectors';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';

type WishlistPlaceCardProps = {
  tripId: number;
  data: WishlistPlace;
  onOpenDetailAction: () => void;
};

export const WishlistPlaceCard = ({ tripId, data, onOpenDetailAction }: WishlistPlaceCardProps) => {
  const { acquireLease } = useTripLockLease(tripId);
  const locale = useSelector((s: RootState) => s.i18n.locale);
  const myUserId = useSelector((s: RootState) => s.profile.currentUser?.id);
  const locksMap = useTripRealtimeLocksMap(tripId);
  const { t } = useTranslation('trip_overview');
  const { t: tCommon } = useTranslation('common');
  const removeMutation = useRemoveWishlistPlace(tripId);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string } | null>(null);

  const deleteReleaseRef = useRef<null | (() => Promise<void>)>(null);

  const lock = locksMap[`WISHLIST_PLACE:${data.id}`];
  const lockedByOther = Boolean(lock) && Boolean(myUserId) && lock!.owner.id !== myUserId;

  const placeName =
    locale === 'th' ? data.place.th?.name : data.place.en?.name || data.place.th?.name;

  const rating = data.place.rating;
  const showRating = rating >= 1;

  const onConfirmDelete = () => {
    setConfirmOpen(false);
    removeMutation.mutate(
      data.id,
      {
        onSuccess: () => {
          void deleteReleaseRef.current?.();
          deleteReleaseRef.current = null;
        },
        onError: () => {
          void deleteReleaseRef.current?.();
          deleteReleaseRef.current = null;
        },
      }
    );
  };

  const actionNode = (
    <IconButton
      aria-label="delete place"
      onClick={(e) => {
        e.stopPropagation();
        void (async () => {
          const lease = await acquireLease({
            resourceType: 'WISHLIST_PLACE',
            resourceId: data.id,
            purpose: 'DELETE',
          });

          if (lease.status === 'conflict') {
            setSnackbar({
              open: true,
              message: `Locked by ${lease.lock.owner.username}`,
            });
            return;
          }

          deleteReleaseRef.current = lease.release;
          setConfirmOpen(true);
        })();
      }}
      size="large"
      sx={{ color: 'common.white' }}
    >
      <Trash size={20} />
    </IconButton>
  );

  return (
    <>
      <SwipeReveal
        actionNode={actionNode}
        actionWidth={80}
        actionSide="right"
        actionSx={{ bgcolor: 'error.main' }}
        disabled={lockedByOther}
        cardSx={{
          py: 2,
          pl: 3,
          pr: 0,
          ...(lockedByOther ? { border: '2px solid', borderColor: 'warning.main' } : {}),
        }}
      >
        <Box
          onClick={() => {
            onOpenDetailAction();
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flex: 1,
            minWidth: 0,
            width: '100%',
            cursor: 'pointer',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            <Map size={20} color={tokens.color.primary} />
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap variant="subtitle1">
                {placeName}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showRating ? (
              <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                <Star size={16} fill={tokens.color.warning} strokeWidth={0} />
                <Typography variant="body2" color="warning" sx={{ ml: 0.5 }}>
                  {Number(rating).toFixed(1)}
                </Typography>
              </Box>
            ) : null}

            <Box
              sx={{
                width: 72,
                height: 56,
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
                mr: 0.5,
              }}
            >
              {data.place.defaultPicUrl ? (
                <Image
                  src={data.place.defaultPicUrl}
                  alt={placeName || 'place image'}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="72px"
                  unoptimized
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.200',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {tCommon('empty.image')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </SwipeReveal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          void deleteReleaseRef.current?.();
          deleteReleaseRef.current = null;
        }}
        onConfirm={onConfirmDelete}
        content={<Typography>{t('sectionCard.wishlistPlace.remove.confirm_message')}</Typography>}
        confirmLoading={removeMutation.isPending}
        color="error"
      />

      <AppSnackbar
        open={Boolean(snackbar?.open)}
        message={snackbar?.message ?? ''}
        severity="warning"
        onClose={() => setSnackbar(null)}
      />
    </>
  );
};

export default WishlistPlaceCard;
