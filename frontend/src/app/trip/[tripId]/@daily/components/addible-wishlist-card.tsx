'use client';

import { MouseEvent } from 'react';
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
import PlaceDetailsDialog from '@/app/trip/[tripId]/components/place-details/place-details-dialog';
import AddScheduledPlaceBtn from '@/app/trip/[tripId]/@daily/components/add-scheduled-place-btn';
import { useDailyPlanContext } from '@/app/trip/[tripId]/@daily/context/daily-plan-context';
import { useOpeningDialogContext } from '@/app/trip/[tripId]/@daily/context/opening-dialog-context';

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
  const { planId } = useDailyPlanContext();
  const { province } = useSearchForProvince(address);

  const dispatch = useDispatch();
  const { mutate: mutateAdd } = useAddWishlistPlace();
  const { mutate: mutateRemove } = useRemoveWishlistPlace();

  const wishlistAction = (event: MouseEvent) => {
    event.stopPropagation();
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

  const {
    isDetailsDialogOpened,
    openDetailsDialog,
    closeDetailsDialog,
    closeSearchDialog,
    selectedGgmpId,
  } = useOpeningDialogContext();

  return (
    <>
      <ListItem
        alignItems="center"
        sx={{ gap: 2, '& .MuiListItem-root': { padding: '0' } }}
        onClick={() => openDetailsDialog(ggmpId)}
      >
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
            onClick={(event) => wishlistAction(event)}
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

      {selectedGgmpId === ggmpId && (
        <PlaceDetailsDialog
          isOpened={isDetailsDialogOpened}
          onClose={() => closeDetailsDialog()}
          ggmpId={ggmpId}
          cta={
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
              <AddScheduledPlaceBtn
                tripId={tripId}
                payload={{ planId, ggmpId }}
                onSuccess={() => {
                  closeDetailsDialog();
                  closeSearchDialog();
                }}
              />
            </Box>
          }
        />
      )}
    </>
  );
};

export default AddibleWishlistCard;
