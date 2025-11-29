'use client';

import { use, useCallback, useState } from 'react';
import { Container, Box, List, ListItem, Button } from '@mui/material';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Hand, Mail, Upload } from 'lucide-react';
import ManualReservation from './components/manual-reservation';
import UploadReservation from './components/upload-reservation';
import EmailReservation from './components/email-reservation';

import OverviewHeader from '@/components/trip/overview/overview-header';
import OverviewTabs from '@/components/trip/overview/overview-tabs';
import SectionCard from '@/components/trip/overview/section-card';
import { useFullPageLoading } from '@/components/full-page-loading';
import CustomMap from '@/components/trip/map-component';
import AddItemButton from '@/components/trip/overview/add-item-button';
import { useFullScreenDialog } from '@/components/common/dialog';

import useGetTripOverview from '../hooks/use-get-trip-overview';
import useUpdateTripOverview from '../hooks/use-update-trip-overview';
import { UpsertTrip, WishlistPlace } from '@/api/trips';
import {
  SearchAddWishlistPlace,
  WishlistPlaceCard,
  WishlistPlaceDetailContent,
} from './components';
import { setTripOverview } from '@/store/trip-detail-slice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TripOverviewPage = ({ params }: { params: Promise<{ tripId: string }> }) => {
  const dispatch = useDispatch();
  const { tripId } = use(params);
  const tripIdAsNumber = Number(tripId);
  const { overview: tripOverview, isLoading } = useGetTripOverview(tripIdAsNumber);
  const { FullPageLoading } = useFullPageLoading();
  const { mutate: updateTrip } = useUpdateTripOverview(tripIdAsNumber);
  const { t } = useTranslation('trip_overview');

  // {Manual}
  const [isManualReservationDialogOpen, setManualReservationDialogOpen] = useState(false);

  const openManualReservationDialog = () => setManualReservationDialogOpen(true);
  const closeManualReservationDialog = () => setManualReservationDialogOpen(false);

  // {Upload}
  const [isUploadReservationDialogOpen, setUploadReservationDialogOpen] = useState(false);

  const openUploadReservationDialog = () => setUploadReservationDialogOpen(true);
  const closeUploadReservationDialog = () => setUploadReservationDialogOpen(false);

  // {Email}
  const [isEmailReservationDialogOpen, setEmailReservationDialogOpen] = useState(false);

  const openEmailReservationDialog = () => setEmailReservationDialogOpen(true);
  const closeEmailReservationDialog = () => setEmailReservationDialogOpen(false);

  const {
    Dialog: WishlistPlaceDialog,
    open: isWishlistPlaceDialogOpened,
    handleClickOpen: openWishlistPlaceDialog,
  } = useFullScreenDialog({
    EntryElement: <AddItemButton label={t('sectionCard.wishlistPlace.button')} />,
    Content: SearchAddWishlistPlace,
    contentProps: { tripId: tripIdAsNumber },
  });

  const { Dialog: WishlistPlaceDetailDialog, openWithProps: openWishlistPlaceDetail } =
    useFullScreenDialog<{ wishlistItem: WishlistPlace }>({
      Content: ({ wishlistItem, onCloseAction }) => (
        <WishlistPlaceDetailContent wishlistItem={wishlistItem} onCloseAction={onCloseAction} />
      ),
    });

  const handleSave = useCallback(
    (updates: UpsertTrip) => {
      updateTrip(
        {
          ...updates,
        },
        {
          onSuccess: (data) => {
            dispatch(setTripOverview(data));
          },
        }
      );
    },
    [updateTrip, dispatch]
  );

  <ManualReservation open={isManualReservationDialogOpen} onClose={closeManualReservationDialog} />;

  if (isLoading || !tripOverview) return <FullPageLoading />;

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <OverviewHeader
        tripName={tripOverview.name}
        members={[tripOverview.owner.profilePicUrl ?? '']}
        objectives={tripOverview.objectives}
        startDate={tripOverview.startDate}
        endDate={tripOverview.endDate}
        onUpdateTripName={(name) => handleSave({ ...tripOverview, name })}
        onUpdateDates={(start, end) =>
          handleSave({ ...tripOverview, startDate: start, endDate: end })
        }
        onUpdateObjectives={(objectives) => handleSave({ ...tripOverview, objectives })}
      />

      <OverviewTabs value={0} onChange={() => {}} />

      <Box sx={{ mt: 2 }}>
        <SectionCard title={t('sectionCard.map')}>
          <Box sx={{ width: '100%' }}>
            <CustomMap />
          </Box>
        </SectionCard>

        <SectionCard title={t('sectionCard.reservation.title')} asEmpty>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <AddItemButton label={t('sectionCard.reservation.button')} />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-35" align="center">
              <DropdownMenuItem
                className="flex items-center gap-3"
                onClick={() => {
                  openManualReservationDialog();
                }}
              >
                <Hand size={18} />
                {t('sectionCard.reservation.dropdown.Manual')}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center gap-3"
                onClick={() => {
                  openEmailReservationDialog();
                }}
              >
                <Mail size={18} />
                {t('sectionCard.reservation.dropdown.Email')}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex items-center gap-3"
                onClick={() => {
                  openUploadReservationDialog();
                }}
              >
                <Upload size={18} />
                {t('sectionCard.reservation.dropdown.Upload')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SectionCard>

        <SectionCard
          title={t('sectionCard.wishlistPlace.title')}
          asEmpty={!tripOverview.wishlistPlaces.length}
        >
          {tripOverview.wishlistPlaces.length && !isWishlistPlaceDialogOpened ? (
            <>
              <Box>
                <List>
                  {tripOverview.wishlistPlaces.map((wp) => {
                    return (
                      <ListItem
                        key={wp.place.ggmpId}
                        alignItems="center"
                        sx={{ padding: 0, marginBottom: '1rem' }}
                      >
                        <WishlistPlaceCard
                          tripId={tripIdAsNumber}
                          data={wp}
                          onOpenDetailAction={() => openWishlistPlaceDetail({ wishlistItem: wp })}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
              <Button variant="contained" onClick={openWishlistPlaceDialog} startIcon={<Plus />}>
                {t('sectionCard.wishlistPlace.button')}
              </Button>
            </>
          ) : (
            WishlistPlaceDialog
          )}

          {WishlistPlaceDetailDialog}
        </SectionCard>
      </Box>
      <ManualReservation
        open={isManualReservationDialogOpen}
        onClose={closeManualReservationDialog}
      />
      <UploadReservation
        open={isUploadReservationDialogOpen}
        onClose={closeUploadReservationDialog}
      />
      <EmailReservation open={isEmailReservationDialogOpen} onClose={closeEmailReservationDialog} />
    </Container>
  );
};

export default TripOverviewPage;
