import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Box, Button, Divider, SwipeableDrawer, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Trash } from 'lucide-react';

import { useGetPlaceById } from '@/app/trip/[tripId]/hooks/use-search-for-places';
import { ScheduledPlace } from '@/api/trips';
import { PlaceLocationInfo, PlaceOverview } from '@/app/trip/[tripId]/components/place-details';
import { PLACEHOLDER_IMAGE } from '@/constants/link';
import { ConfirmDialog } from '@/components/common/dialog';
import { useRemoveScheduledPlace } from '@/app/trip/[tripId]/@daily/hooks/use-scheduled-place-mutation';
import { useParams } from 'next/navigation';
import { useTripLockLease } from '@/app/trip/[tripId]/realtime/hooks/use-trip-lock-lease';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

type PlaceBottomSheetProps = {
  planId: number | null;
  place: ScheduledPlace | null;
  onClose: () => void;
  readOnly?: boolean;
};

const PlaceBottomSheet = ({ planId, place, onClose, readOnly = false }: PlaceBottomSheetProps) => {
  const { t } = useTranslation('trip_overview');
  const params = useParams<{ tripId: string }>();

  const tripId = Number(params.tripId);
  const { acquireLease } = useTripLockLease(tripId);
  const { data: ggmp } = useGetPlaceById(place?.ggmp.ggmpId ?? '');
  const [isRemoveDialogOpened, setIsRemoveDialogOpened] = useState(false);
  const deleteReleaseRef = useRef<null | (() => Promise<void>)>(null);
  const { showWarning } = useSnackbar();

  const [isDrawerOpened, setIsDrawerOpened] = useState(false);
  const { mutate: remove, isPending: isRemoving } = useRemoveScheduledPlace(tripId);
  const confirmRemove = () => {
    if (!planId || !place) return;
    remove(place.id, {
      onSettled: () => {
        void deleteReleaseRef.current?.();
        deleteReleaseRef.current = null;
      },
      onSuccess: () => {
        setIsRemoveDialogOpened(false);
        setIsDrawerOpened(false);
      },
    });
  };

  useEffect(() => {
    if (ggmp) setIsDrawerOpened(true);
  }, [ggmp]);

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
              height: '70vh',
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

            {!readOnly && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Trash size={14} />}
                sx={{ marginY: 2 }}
                onClick={() => {
                  if (!place) return;
                  void (async () => {
                    const lease = await acquireLease({
                      resourceType: 'SCHEDULED_PLACE',
                      resourceId: place.id,
                      purpose: 'DELETE',
                    });
                    if (lease.status === 'conflict') {
                      showWarning(t('lock.by_user', { username: lease.lock.owner.username }));
                      return;
                    }

                    deleteReleaseRef.current = lease.release;
                    setIsRemoveDialogOpened(true);
                  })();
                }}
              >
                {t('map.place.removeButton')}
              </Button>
            )}
          </Box>
        )}
      </SwipeableDrawer>

      {!readOnly && (
        <ConfirmDialog
          open={isRemoveDialogOpened}
          onClose={() => {
            setIsRemoveDialogOpened(false);
            void deleteReleaseRef.current?.();
            deleteReleaseRef.current = null;
          }}
          onConfirm={confirmRemove}
          content={<Typography>{t('sectionCard.dailyPlan.remove.confirm_message')}</Typography>}
          confirmLabel={t('sectionCard.dailyPlan.remove.confirm_label')}
          confirmLoading={isRemoving}
          color="error"
        />
      )}

    </>
  );
};

export default PlaceBottomSheet;
