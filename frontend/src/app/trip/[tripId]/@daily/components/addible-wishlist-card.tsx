'use client';

import { useParams } from 'next/navigation';
import { Box, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { useDispatch } from 'react-redux';

import { tokens } from '@/providers/theme/design-tokens';
import { useSearchForProvince } from '@/app/trip/[tripId]/hooks/use-search-for-places';
import { TruncatedTooltip } from '@/components/atoms';
import useAddWishlistPlace from '@/app/trip/[tripId]/hooks/use-add-wishlist-place';
import useRemoveWishlistPlace from '@/app/trip/[tripId]/hooks/use-remove-wishlist-place';
import { addWishlistPlace, removeWishlistPlace } from '@/store/trip-detail-slice';

type CardProps = {
  ggmpId: string;
  placeId?: number;
  name: string;
  address: string;
  defaultPicUrl: string;
  inWishlist?: boolean;
};

const AddibleWishlistCard = ({
  ggmpId,
  placeId,
  name,
  address,
  defaultPicUrl,
  inWishlist = false,
}: CardProps) => {
  const params = useParams<{ tripId: string }>();
  const tripId = Number(params.tripId);
  const { province } = useSearchForProvince(address);

  const dispatch = useDispatch();
  const { mutate: mutateAdd } = useAddWishlistPlace();
  const { mutate: mutateRemove } = useRemoveWishlistPlace();

  const wishlistAction = () => {
    if (inWishlist && placeId) {
      mutateRemove(
        { tripId, placeId },
        {
          onSuccess: () => {
            dispatch(removeWishlistPlace({ wishlistPlaceId: placeId }));
          },
        }
      );

      return;
    }

    mutateAdd(
      { tripId, ggmpId },
      {
        onSuccess: (wishlistPlace) => {
          dispatch(addWishlistPlace(wishlistPlace));
        },
      }
    );
  };

  return (
    <ListItem alignItems="center" sx={{ gap: 2, '& .MuiListItem-root': { padding: '0' } }}>
      <ListItemText
        primary={<TruncatedTooltip text={name} />}
        secondary={
          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography component="span" variant="body2" color="text.secondary">
              {province}
            </Typography>
          </Box>
        }
      />

      <ListItemIcon sx={{ minWidth: '0' }}>
        <Heart
          color={tokens.color.primary}
          {...(inWishlist ? { fill: tokens.color.primary } : {})}
          onClick={() => wishlistAction()}
        />
      </ListItemIcon>
      <Box sx={{ width: 56, height: 56, position: 'relative', flex: '0 0 56px' }}>
        <Image
          src={defaultPicUrl}
          alt={name}
          fill
          style={{ objectFit: 'cover', borderRadius: 8 }}
          unoptimized
        />
      </Box>
    </ListItem>
  );
};

export default AddibleWishlistCard;
