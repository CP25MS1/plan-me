'use client';

import { useState } from 'react';
import { Box, Button, IconButton, List, ListItem, Typography } from '@mui/material';
import { Hand, Mail, Plus, Trash2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import ManualReservation from './components/manual-reservation';
import EditReservation from './components/edit-reservation';
import UploadReservation from './components/upload-reservation';
import EmailReservation from './components/email-reservation';
import { addReservation, removeReservation } from '@/store/trip-detail-slice';
import SectionCard from '@/components/trip/overview/section-card';
import { useFullPageLoading } from '@/components/full-page-loading';
import CustomMap from '@/components/trip/map-component';
import AddItemButton from '@/components/trip/overview/add-item-button';
import { useFullScreenDialog } from '@/components/common/dialog';

import { WishlistPlace } from '@/api/trips';
import {
  SearchAddWishlistPlace,
  WishlistPlaceCard,
  WishlistPlaceDetailContent,
} from './components';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { FlightDetails, ReservationDto } from '@/api/reservations/type';

import LodgingCard from './components/cards/lodging';
import RestaurantCard from './components/cards/restaurant';
import FlightCard from './components/cards/flight';
import TrainCard from './components/cards/train';
import BusCard from './components/cards/bus';
import FerryCard from './components/cards/ferry';
import CarRentalCard from './components/cards/carrental';
import ConfirmDialog from '@/components/common/dialog/confirm-dialog';
import { SwipeReveal } from '@/components/common/card';
import { useDeleteReservation } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-delete-reservation';
import { useTripSelector } from '@/store/selectors';

const TripOverviewPage = () => {
  const dispatch = useDispatch();
  const { tripOverview } = useTripSelector();
  const { mutate: deleteReservation, isPending } = useDeleteReservation();

  const { FullPageLoading } = useFullPageLoading();

  const { t } = useTranslation('trip_overview');

  // ===== Dialog states =====
  const [isManualReservationDialogOpen, setManualReservationDialogOpen] = useState(false);
  const [isUploadReservationDialogOpen, setUploadReservationDialogOpen] = useState(false);
  const [isEmailReservationDialogOpen, setEmailReservationDialogOpen] = useState(false);

  // state สำหรับ Edit reservation
  const [editingReservation, setEditingReservation] = useState<ReservationDto | null>(null);

  const openManualReservationDialog = () => {
    setEditingReservation(null);
    setManualReservationDialogOpen(true);
  };

  const openUploadReservationDialog = () => setUploadReservationDialogOpen(true);
  const closeUploadReservationDialog = () => setUploadReservationDialogOpen(false);

  const openEmailReservationDialog = () => setEmailReservationDialogOpen(true);
  const closeEmailReservationDialog = () => setEmailReservationDialogOpen(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const renderDeleteAction = (reservationId: number) => (
    <IconButton
      aria-label="delete reservation"
      onClick={(e) => {
        e.stopPropagation();
        setPendingDeleteId(reservationId);
        setConfirmOpen(true);
      }}
      sx={{ color: 'common.white' }}
    >
      <Trash2 size={20} />
    </IconButton>
  );

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;

    deleteReservation(pendingDeleteId, {
      onSuccess: () => {
        dispatch(removeReservation({ reservationId: pendingDeleteId }));
        setConfirmOpen(false);
        setPendingDeleteId(null);
      },
    });
  };

  // ===== Wishlist dialogs =====
  const {
    Dialog: WishlistPlaceDialog,
    open: isWishlistPlaceDialogOpened,
    handleClickOpen: openWishlistPlaceDialog,
  } = useFullScreenDialog({
    EntryElement: <AddItemButton label={t('sectionCard.wishlistPlace.button')} />,
    Content: SearchAddWishlistPlace,
    contentProps: { tripId: tripOverview?.id ?? -1 },
  });

  const { Dialog: WishlistPlaceDetailDialog, openWithProps: openWishlistPlaceDetail } =
    useFullScreenDialog<{ wishlistItem: WishlistPlace }>({
      Content: ({ wishlistItem, onCloseAction }) => (
        <WishlistPlaceDetailContent wishlistItem={wishlistItem} onCloseAction={onCloseAction} />
      ),
    });

  const handleNewReservation = (reservation: ReservationDto) => {
    if (!tripOverview) return;
    dispatch(addReservation(reservation));
  };

  if (!tripOverview) return <FullPageLoading />;

  const hasReservation = tripOverview.reservations && tripOverview.reservations.length > 0;

  return (
    <>
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
                      const flightDetails = res.details as FlightDetails | undefined;

                      return flightDetails?.passengers?.map(
                        (_, idx) =>
                          res.id && (
                            <SwipeReveal
                              key={`${res.id}-${idx}`}
                              actionNode={renderDeleteAction(res.id)}
                              actionWidth={80}
                              actionSide="right"
                              actionSx={{ bgcolor: 'error.main' }}
                            >
                              <Box
                                onClick={() => {
                                  setEditingReservation(res);
                                }}
                                sx={{ cursor: 'pointer', width: '100%' }}
                              >
                                <FlightCard
                                  data={{ ...flightDetails, ...res }}
                                  passengerIndex={idx}
                                />
                              </Box>
                            </SwipeReveal>
                          )
                      );
                    }

                    return (
                      res.id && (
                        <SwipeReveal
                          key={res.id}
                          actionNode={renderDeleteAction(res.id)}
                          actionWidth={80}
                          actionSide="right"
                          actionSx={{ bgcolor: 'error.main' }}
                        >
                          <Box
                            onClick={() => {
                              setEditingReservation(res);
                            }}
                            sx={{ cursor: 'pointer', width: '100%' }}
                          >
                            {res.type === 'LODGING' && (
                              <LodgingCard data={{ ...res.details, ...res }} />
                            )}
                            {res.type === 'RESTAURANT' && (
                              <RestaurantCard data={{ ...res.details, ...res }} />
                            )}
                            {res.type === 'TRAIN' && (
                              <TrainCard data={{ ...res.details, ...res }} />
                            )}
                            {res.type === 'BUS' && <BusCard data={{ ...res.details, ...res }} />}
                            {res.type === 'FERRY' && (
                              <FerryCard data={{ ...res.details, ...res }} />
                            )}
                            {res.type === 'CAR_RENTAL' && (
                              <CarRentalCard data={{ ...res.details, ...res }} />
                            )}
                          </Box>
                        </SwipeReveal>
                      )
                    );
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
                      tripId={tripOverview.id}
                      data={wp}
                      onOpenDetailAction={() => openWishlistPlaceDetail({ wishlistItem: wp })}
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
        onClose={() => setManualReservationDialogOpen(false)}
        tripId={tripOverview.id}
        onReservationCreated={handleNewReservation}
      />

      {editingReservation && (
        <EditReservation
          open={true}
          onClose={() => setEditingReservation(null)}
          tripId={tripOverview.id}
          reservation={editingReservation}
        />
      )}

      <UploadReservation
        open={isUploadReservationDialogOpen}
        onClose={closeUploadReservationDialog}
      />

      <EmailReservation open={isEmailReservationDialogOpen} onClose={closeEmailReservationDialog} />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        confirmLoading={isPending}
        color="error"
        content={<Typography>ต้องการลบข้อมูลการจองนี้ใช่หรือไม่?</Typography>}
      />
    </>
  );
};

export default TripOverviewPage;
