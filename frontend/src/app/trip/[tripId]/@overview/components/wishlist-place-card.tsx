'use client';

import React, { useState } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import { Map, Star, Trash2 as Trash } from 'lucide-react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { WishlistPlace } from '@/api/trips';
import { RootState } from '@/store';
import { ConfirmDialog } from '@/components/common/dialog';
import { useRemoveWishlistPlace } from '../hooks';
import { removeWishlistPlace } from '@/store/trip-detail-slice';
import { tokens } from '@/providers/theme/design-tokens';
import { SwipeReveal } from '@/components/common/card';

type WishlistPlaceCardProps = {
  tripId: number;
  data: WishlistPlace;
  onOpenDetailAction: () => void;
};

export const WishlistPlaceCard = ({ tripId, data, onOpenDetailAction }: WishlistPlaceCardProps) => {
  const dispatch = useDispatch();
  const locale = useSelector((s: RootState) => s.i18n.locale);
  const { t } = useTranslation('trip_overview');
  const { t: tCommon } = useTranslation('common');
  const removeMutation = useRemoveWishlistPlace();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const placeName =
    locale === 'th' ? data.place.th?.name : data.place.en?.name || data.place.th?.name;

  const rating = data.place.rating;
  const showRating = rating >= 1;

  const onConfirmDelete = () => {
    setConfirmOpen(false);
    removeMutation.mutate(
      { tripId, placeId: data.id },
      {
        onSuccess: () => {
          dispatch(removeWishlistPlace({ wishlistPlaceId: data.id }));
        },
      }
    );
  };

  const actionNode = (
    <IconButton
      aria-label="delete place"
      onClick={(e) => {
        e.stopPropagation();
        setConfirmOpen(true);
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
        cardSx={{ py: 2, pl: 3, pr: 0 }}
      >
        <Box
          onClick={onOpenDetailAction}
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
        onClose={() => setConfirmOpen(false)}
        onConfirm={onConfirmDelete}
        content={<Typography>{t('sectionCard.wishlistPlace.remove.confirm_message')}</Typography>}
        confirmLoading={removeMutation.isPending}
        color="error"
      />
    </>
  );
};

export default WishlistPlaceCard;
