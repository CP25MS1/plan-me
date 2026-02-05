import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Box, Button, Divider, SwipeableDrawer, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Trash } from 'lucide-react';

import { useGetPlaceById } from '@/app/trip/[tripId]/hooks/use-search-for-places';
import { ScheduledPlace } from '@/api/trips';
import { PlaceLocationInfo, PlaceOverview } from '@/app/trip/[tripId]/components/place-details';
import { PLACEHOLDER_IMAGE } from '@/constants/link';
import { ConfirmDialog } from '@/components/common/dialog';
import { removeScheduledPlace } from '@/store/trip-detail-slice';
import { useRemoveScheduledPlace } from '@/app/trip/[tripId]/@daily/hooks/use-scheduled-place-mutation';
import { useParams } from 'next/navigation';

type PlaceBottomSheetProps = {
  planId: number | null;
  place: ScheduledPlace | null;
  onClose: () => void;
};

const PlaceBottomSheet = ({ planId, place, onClose }: PlaceBottomSheetProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation('trip_overview');
  const params = useParams<{ tripId: string }>();

  const tripId = Number(params.tripId);
  const { data: ggmp } = useGetPlaceById(place?.ggmp.ggmpId ?? '');
  const [isRemoveDialogOpened, setIsRemoveDialogOpened] = useState(false);

  const [isDrawerOpened, setIsDrawerOpened] = useState(false);
  const { mutate: remove, isPending: isRemoving } = useRemoveScheduledPlace();
  const confirmRemove = () => {
    if (!planId || !place) return;
    remove(
      { tripId, placeId: place.id },
      {
        onSuccess: () => {
          dispatch(removeScheduledPlace({ planId, placeId: place.id }));
          setIsRemoveDialogOpened(false);
          setIsDrawerOpened(false);
        },
      }
    );
  };

  useEffect(() => {
    if (ggmp) setIsDrawerOpened(true);
  }, [ggmp])

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={isDrawerOpened}
        onClose={() => {
          onClose();
          setIsDrawerOpened(false);
        }}
        onOpen={() => {}}
        swipeAreaWidth={24}
        disableSwipeToOpen={false}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              height: '50vh',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              p: 2,
            },
          },
        }}
      >
        {/* Content */}
        {ggmp && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                width: 40,
                height: 4,
                bgcolor: 'grey.400',
                borderRadius: 2,
                mx: 'auto',
                mb: 2,
              }}
            />

            <PlaceOverview place={ggmp} />

            <Divider sx={{ my: 2 }} />

            <PlaceLocationInfo place={ggmp} />

            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 220, md: 320 },
                borderRadius: 2,
                overflow: 'hidden',
                marginTop: 2,
              }}
            >
              <Image
                src={ggmp.defaultPicUrl ?? PLACEHOLDER_IMAGE}
                alt={ggmp.thName || ggmp.enName}
                fill
                style={{ objectFit: 'cover' }}
              />
            </Box>

            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash size={14} />}
              sx={{ marginY: 2 }}
              onClick={() => setIsRemoveDialogOpened(true)}
            >
              ลบสถานที่
            </Button>
          </Box>
        )}
      </SwipeableDrawer>

      <ConfirmDialog
        open={isRemoveDialogOpened}
        onClose={() => setIsRemoveDialogOpened(false)}
        onConfirm={confirmRemove}
        content={<Typography>{t('sectionCard.dailyPlan.remove.confirm_message')}</Typography>}
        confirmLabel={t('sectionCard.dailyPlan.remove.confirm_label')}
        confirmLoading={isRemoving}
        color="error"
      />
    </>
  );
};

export default PlaceBottomSheet;
