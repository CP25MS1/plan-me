'use client';

import { use, useCallback, useState } from 'react';
import { Container, Box, List, ListItem, Button } from '@mui/material';
import { Plus, Hand, Mail, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

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

import { addReservation, setTripOverview } from '@/store/trip-detail-slice';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  FlightDetails,
  ReservationDto,
} from '@/api/reservations/type';

import LodgingCard from './components/cards/lodging';
import RestaurantCard from './components/cards/restaurant';
import FlightCard from './components/cards/flight';
import TrainCard from './components/cards/train';
import BusCard from './components/cards/bus';
import FerryCard from './components/cards/ferry';
import CarRentalCard from './components/cards/carrental';

const TripOverviewPage = ({ params }: { params: Promise<{ tripId: string }> }) => {
  const dispatch = useDispatch();
  const { tripId } = use(params);
  const tripIdAsNumber = Number(tripId);

  const { overview: tripOverview, isLoading } = useGetTripOverview(tripIdAsNumber);
  const { FullPageLoading } = useFullPageLoading();
  const { mutate: updateTrip } = useUpdateTripOverview(tripIdAsNumber);
  const { t } = useTranslation('trip_overview');

  // ===== Dialog states =====
  const [isManualReservationDialogOpen, setManualReservationDialogOpen] = useState(false);
  const [isUploadReservationDialogOpen, setUploadReservationDialogOpen] = useState(false);
  const [isEmailReservationDialogOpen, setEmailReservationDialogOpen] = useState(false);

  // ⭐ state สำหรับ Edit reservation
  const [editingReservation, setEditingReservation] =
    useState<ReservationDto | undefined>(undefined);

  const openManualReservationDialog = () => setManualReservationDialogOpen(true);
  const closeManualReservationDialog = () => setManualReservationDialogOpen(false);

  const openUploadReservationDialog = () => setUploadReservationDialogOpen(true);
  const closeUploadReservationDialog = () => setUploadReservationDialogOpen(false);

  const openEmailReservationDialog = () => setEmailReservationDialogOpen(true);
  const closeEmailReservationDialog = () => setEmailReservationDialogOpen(false);

  // ===== Wishlist dialogs =====
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
        <WishlistPlaceDetailContent
          wishlistItem={wishlistItem}
          onCloseAction={onCloseAction}
        />
      ),
    });

  // ===== Trip update =====
  const handleSave = useCallback(
    (updates: UpsertTrip) => {
      updateTrip(updates, {
        onSuccess: (data) => dispatch(setTripOverview(data)),
      });
    },
    [updateTrip, dispatch]
  );

  const handleNewReservation = (reservation: ReservationDto) => {
    if (!tripOverview) return;
    dispatch(addReservation(reservation));
  };

  if (isLoading || !tripOverview) return <FullPageLoading />;

  const hasReservation =
    tripOverview.reservations && tripOverview.reservations.length > 0;

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
        onUpdateObjectives={(objectives) =>
          handleSave({ ...tripOverview, objectives })
        }
      />

      <OverviewTabs value={0} onChange={() => {}} />

      <Box sx={{ mt: 2 }}>
        {/* Map */}
        <SectionCard title={t('sectionCard.map')}>
          <CustomMap />
        </SectionCard>

        {/* Reservation */}
        <SectionCard title={t('sectionCard.reservation.title')} asEmpty={!hasReservation}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {hasReservation && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {tripOverview.reservations
                  .slice()
                  .sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0))
                  .flatMap((res) => {
                    if (res.type === 'FLIGHT') {
                      return (res.details as FlightDetails)?.passengers?.map((_, idx) => (
                        <FlightCard
                          key={`${res.id}-${idx}`}
                          data={{ ...res.details, ...res }}
                          onClick={() => {
                            setEditingReservation({ ...res });
                            openManualReservationDialog();
                          }}
                        />
                      ));
                    }

                    const commonProps = {
                      key: res.id,
                      data: { ...res.details, ...res },
                      onClick: () => {
                        setEditingReservation({ ...res });
                        openManualReservationDialog();
                      },
                    };

                    switch (res.type) {
                      case 'LODGING':
                        return <LodgingCard {...commonProps} />;
                      case 'RESTAURANT':
                        return <RestaurantCard {...commonProps} />;
                      case 'TRAIN':
                        return <TrainCard {...commonProps} />;
                      case 'BUS':
                        return <BusCard {...commonProps} />;
                      case 'FERRY':
                        return <FerryCard {...commonProps} />;
                      case 'CAR_RENTAL':
                        return <CarRentalCard {...commonProps} />;
                      default:
                        return null;
                    }
                  })}
              </Box>
            )}

            {/* Add reservation */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AddItemButton label={t('sectionCard.reservation.button')} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem onClick={openManualReservationDialog}>
                    <Hand size={18} />
                    {t('sectionCard.reservation.dropdown.Manual')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={openEmailReservationDialog}>
                    <Mail size={18} />
                    {t('sectionCard.reservation.dropdown.Email')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={openUploadReservationDialog}>
                    <Upload size={18} />
                    {t('sectionCard.reservation.dropdown.Upload')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Box>
          </Box>
        </SectionCard>

        {/* Wishlist */}
        <SectionCard
          title={t('sectionCard.wishlistPlace.title')}
          asEmpty={!tripOverview.wishlistPlaces.length}
        >
          {tripOverview.wishlistPlaces.length && !isWishlistPlaceDialogOpened ? (
            <>
              <List>
                {tripOverview.wishlistPlaces.map((wp) => (
                  <ListItem key={wp.place.ggmpId} sx={{ p: 0, mb: 2 }}>
                    <WishlistPlaceCard
                      tripId={tripIdAsNumber}
                      data={wp}
                      onOpenDetailAction={() =>
                        openWishlistPlaceDetail({ wishlistItem: wp })
                      }
                    />
                  </ListItem>
                ))}
              </List>
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

      {/* Dialogs */}
      <ManualReservation
        open={isManualReservationDialogOpen}
        onClose={() => {
          closeManualReservationDialog();
          setEditingReservation(undefined);
        }}
        tripId={tripIdAsNumber}
        onReservationCreated={handleNewReservation}
        initialReservation={editingReservation}
      />

      <UploadReservation
        open={isUploadReservationDialogOpen}
        onClose={closeUploadReservationDialog}
      />

      <EmailReservation
        open={isEmailReservationDialogOpen}
        onClose={closeEmailReservationDialog}
      />
    </Container>
  );
};

export default TripOverviewPage;
