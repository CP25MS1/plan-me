'use client';

import { useCallback, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, IconButton, List, ListItem, Typography } from '@mui/material';
import { Hand, Mail, Plus, Trash2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import ManualReservation from './components/reservation/manual-reservation';
import EditReservation from './components/reservation/edit-reservation';
import UploadReservation from './components/reservation/upload-reservation';
import EmailReservation from './components/reservation/email-reservation';
import SectionCard from '@/components/trip/overview/section-card';
import { useFullPageLoading } from '@/components/full-page-loading';
import MiniMap from '@/app/trip/[tripId]/components/maps/mini-map';
import AddItemButton from '@/components/trip/overview/add-item-button';
import { useFullScreenDialog } from '@/components/common/dialog';

import {
  SearchAddWishlistPlace,
  WishlistPlaceCard,
  WishlistPlaceDetailsDialog,
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
import { useTripDailyPlans, useTripReservations, useTripWishlistPlaces } from '@/api/trips';
import { useTripRealtimeLocksMap, useTripSectionUsers } from '@/store/selectors';
import { RootState } from '@/store';
import SectionPresenceGroup from '@/app/trip/[tripId]/realtime/components/section-presence-group';
import { useTripLockLease } from '@/app/trip/[tripId]/realtime/hooks/use-trip-lock-lease';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

const TripOverviewPage = () => {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const tripId = Number(params.tripId);

  const currentUserId = useSelector((s: RootState) => s.profile.currentUser?.id);

  const { data: reservations = [], isLoading: isReservationsLoading } = useTripReservations(tripId);
  const { data: wishlistPlaces = [], isLoading: isWishlistLoading } = useTripWishlistPlaces(tripId);
  const { data: dailyPlans = [], isLoading: isDailyPlansLoading } = useTripDailyPlans(tripId);

  const locksMap = useTripRealtimeLocksMap(tripId);
  const reservationUsers = useTripSectionUsers(tripId, 'OVERVIEW_RESERVATIONS');
  const wishlistUsers = useTripSectionUsers(tripId, 'OVERVIEW_WISHLIST');

  const { acquireLease } = useTripLockLease(tripId);

  const { mutate: deleteReservation, isPending } = useDeleteReservation(tripId);

  const { FullPageLoading } = useFullPageLoading();

  const { t } = useTranslation('trip_overview');

  const { showWarning } = useSnackbar();

  const reservationEditReleaseRef = useRef<null | (() => Promise<void>)>(null);
  const reservationDeleteReleaseRef = useRef<null | (() => Promise<void>)>(null);

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
        void (async () => {
          const lease = await acquireLease({
            resourceType: 'RESERVATION',
            resourceId: reservationId,
            purpose: 'DELETE',
          });

          if (lease.status === 'conflict') {
            showWarning(`Locked by ${lease.lock.owner.username}`);
            return;
          }

          reservationDeleteReleaseRef.current = lease.release;
          setPendingDeleteId(reservationId);
          setConfirmOpen(true);
        })();
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
        setConfirmOpen(false);
        setPendingDeleteId(null);
        void reservationDeleteReleaseRef.current?.();
        reservationDeleteReleaseRef.current = null;
      },
      onError: () => {
        void reservationDeleteReleaseRef.current?.();
        reservationDeleteReleaseRef.current = null;
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
    contentProps: { tripId },
  });

  const [selectedWishlistPlaceId, setSelectedWishlistPlaceId] = useState<number | null>(null);
  const closeWishlistDetails = useCallback(() => setSelectedWishlistPlaceId(null), []);

  if (isReservationsLoading || isWishlistLoading || isDailyPlansLoading) return <FullPageLoading />;

  const hasReservation = reservations.length > 0;

  return (
    <>
      <Box sx={{ mt: 2 }}>
        {/* Map */}
        <SectionCard title={t('sectionCard.map')}>
          <Box onClick={() => router.push(`/trip/${tripId}?tab=map`)}>
            <MiniMap selectedDay="ALL" viewOnly dailyPlans={dailyPlans} />
          </Box>
        </SectionCard>

        {/* Reservation */}
        <SectionCard
          title={t('sectionCard.reservation.title')}
          asEmpty={!hasReservation}
          titleEndAdornment={
            <SectionPresenceGroup
              users={reservationUsers}
              dialogTitle={t('presence.in_section', { section: t('sectionCard.reservation.title') })}
            />
          }
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {hasReservation && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {reservations
                  .slice()
                  .sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0))
                  .flatMap((res) => {
                    if (res.type === 'FLIGHT') {
                      const flightDetails = res.details as FlightDetails | undefined;
                      const lock = res.id ? locksMap[`RESERVATION:${res.id}`] : null;
                      const lockedByOther =
                        Boolean(lock) && Boolean(currentUserId) && lock!.owner.id !== currentUserId;

                      return flightDetails?.passengers?.map(
                        (_, idx) =>
                          res.id && (
                            <SwipeReveal
                              key={`${res.id}-${idx}`}
                              actionNode={renderDeleteAction(res.id)}
                              actionWidth={80}
                              actionSide="right"
                              actionSx={{ bgcolor: 'error.main' }}
                              disabled={lockedByOther}
                              cardSx={{
                                ...(lockedByOther
                                  ? { border: '2px solid', borderColor: 'warning.main' }
                                  : {}),
                              }}
                            >
                              <Box
                                onClick={() => {
                                  if (lockedByOther) return;
                                  void (async () => {
                                    const lease = await acquireLease({
                                      resourceType: 'RESERVATION',
                                      resourceId: res.id!,
                                      purpose: 'EDIT',
                                    });

                                    if (lease.status === 'conflict') {
                                      showWarning(`Locked by ${lease.lock.owner.username}`);
                                      return;
                                    }

                                    reservationEditReleaseRef.current = lease.release;
                                    setEditingReservation(res);
                                  })();
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

                    const lock = res.id ? locksMap[`RESERVATION:${res.id}`] : null;
                    const lockedByOther =
                      Boolean(lock) && Boolean(currentUserId) && lock!.owner.id !== currentUserId;

                    return (
                      res.id && (
                        <SwipeReveal
                          key={res.id}
                          actionNode={renderDeleteAction(res.id)}
                          actionWidth={80}
                          actionSide="right"
                          actionSx={{ bgcolor: 'error.main' }}
                          disabled={lockedByOther}
                          cardSx={{
                            ...(lockedByOther
                              ? { border: '2px solid', borderColor: 'warning.main' }
                              : {}),
                          }}
                        >
                          <Box
                            onClick={() => {
                              if (lockedByOther) return;
                              void (async () => {
                                const lease = await acquireLease({
                                  resourceType: 'RESERVATION',
                                  resourceId: res.id!,
                                  purpose: 'EDIT',
                                });

                                if (lease.status === 'conflict') {
                                  showWarning(`Locked by ${lease.lock.owner.username}`);
                                  return;
                                }

                                reservationEditReleaseRef.current = lease.release;
                                setEditingReservation(res);
                              })();
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
            {hasReservation && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="contained" startIcon={<Plus />}>
                      {t('sectionCard.reservation.button')}
                    </Button>
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
        )}
        {!hasReservation && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
            )}
          </Box>
        </SectionCard>

        {/* Wishlist */}
        <SectionCard
          title={t('sectionCard.wishlistPlace.title')}
          asEmpty={!wishlistPlaces.length}
          titleEndAdornment={
            <SectionPresenceGroup
              users={wishlistUsers}
              dialogTitle={t('presence.in_section', { section: t('sectionCard.wishlistPlace.title') })}
            />
          }
        >
          {wishlistPlaces.length && !isWishlistPlaceDialogOpened ? (
            <>
              <List>
                {wishlistPlaces.map((wp) => (
                  <ListItem key={wp.place.ggmpId} sx={{ p: 0, mb: 2 }}>
                    <WishlistPlaceCard
                      tripId={tripId}
                      data={wp}
                      onOpenDetailAction={() => setSelectedWishlistPlaceId(wp.id)}
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
        </SectionCard>
      </Box>

      {/* Dialogs */}
      <ManualReservation
        open={isManualReservationDialogOpen}
        onClose={() => setManualReservationDialogOpen(false)}
        tripId={tripId}
      />

      {editingReservation && (
        <EditReservation
          open={true}
          onClose={() => {
            setEditingReservation(null);
            void reservationEditReleaseRef.current?.();
            reservationEditReleaseRef.current = null;
          }}
          tripId={tripId}
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
          void reservationDeleteReleaseRef.current?.();
          reservationDeleteReleaseRef.current = null;
        }}
        onConfirm={handleConfirmDelete}
        confirmLoading={isPending}
        color="error"
        content={<Typography>{t('sectionCard.reservation.delete.confirm_message')}</Typography>}
        confirmLabel={'sectionCard.reservation.delete.confirm_label'}
      />

      <WishlistPlaceDetailsDialog
        tripId={tripId}
        wishlistPlaceId={selectedWishlistPlaceId}
        onClose={closeWishlistDetails}
      />
    </>
  );
};

export default TripOverviewPage;
