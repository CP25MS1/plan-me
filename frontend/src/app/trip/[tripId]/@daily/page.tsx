'use client';

import { useMemo, useRef, useState } from 'react';
import { Box, Button, List, ListItem } from '@mui/material';
import { DragDropContext, Draggable, Droppable, DropResult, DragStart } from '@hello-pangea/dnd';

import { useFullPageLoading } from '@/components/full-page-loading';
import SectionCard from '@/components/trip/overview/section-card';
import AddItemButton from '@/components/trip/overview/add-item-button';
import ScheduledPlaceCard from './components/scheduled-place-card';

import { useI18nSelector, useTripRealtimeLocksMap } from '@/store/selectors';
import { formatDateByLocale, sortByDateAsc } from '@/lib/date';
import { Plus } from 'lucide-react';
import SearchForScheduledPlacesDialog from './components/search-for-scheduled-places-dialog';
import { DailyPlanContext } from './context/daily-plan-context';
import { useOpeningDialogContext } from './context/opening-dialog-context';
import { useUpdateScheduledPlace } from './hooks/use-scheduled-place-mutation';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import TravelSegmentSelect from './components/travel-segment-select';
import { sanitizeStyle } from './helpers/sanitize-transform';
import EmptyDailyPlanState from './components/empty-daily-plan-state';
import { useTripDailyPlans } from '@/api/trips';
import SectionPresenceGroup from '@/app/trip/[tripId]/realtime/components/section-presence-group';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useTripLockLease } from '@/app/trip/[tripId]/realtime/hooks/use-trip-lock-lease';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

const DailyPlanPage = () => {
  const { locale } = useI18nSelector();
  const { t } = useTranslation('trip_overview');
  const params = useParams<{ tripId: string }>();
  const tripId = Number(params.tripId);

  const { data: dailyPlans = [], isLoading } = useTripDailyPlans(tripId);
  const locksMap = useTripRealtimeLocksMap(tripId);
  const presence = useSelector((s: RootState) => s.tripRealtime.addPresenceByTripId[tripId] ?? []);
  const myUserId = useSelector((s: RootState) => s.profile.currentUser?.id);

  const { acquireLease } = useTripLockLease(tripId);
  const dragLeaseRef = useRef<null | { placeId: number; release: () => Promise<void> }>(null);
  const dragAcquireRef = useRef<null | {
    placeId: number;
    promise: ReturnType<typeof acquireLease>;
  }>(null);

  const { FullPageLoading } = useFullPageLoading();

  const [focusedPlanId, setFocusedPlanId] = useState(-1);
  const dailyPlanContext = useMemo(() => ({ planId: focusedPlanId }), [focusedPlanId]);

  const { isSearchDialogOpened, openSearchDialog, closeSearchDialog } = useOpeningDialogContext();
  const handleOpenDialog = (planId: number) => {
    setFocusedPlanId(planId);
    openSearchDialog();
  };

  const { mutate: updateScheduledPlace } = useUpdateScheduledPlace(tripId);

  const { showWarning } = useSnackbar();

  const releaseDragLease = async () => {
    if (!dragLeaseRef.current) return;
    const release = dragLeaseRef.current.release;
    dragLeaseRef.current = null;
    await release();
  };

  if (isLoading) return <FullPageLoading />;

  const getSectionUsersForPlan = (planId: number) => {
    const usersById = new Map<
      number,
      { id: number; username: string; profilePicUrl: string | null }
    >();

    Object.values(locksMap).forEach((lock) => {
      if (lock.section !== 'DAILY_PLAN') return;
      if (lock.planId !== planId) return;
      usersById.set(lock.owner.id, lock.owner);
    });

    presence.forEach((p) => {
      if (p.section !== 'DAILY_PLAN') return;
      if (p.planId !== planId) return;
      usersById.set(p.user.id, p.user);
    });

    return Array.from(usersById.values());
  };

  const onDragStart = (start: DragStart) => {
    const placeId = Number(start.draggableId);
    dragAcquireRef.current = {
      placeId,
      promise: acquireLease({
        resourceType: 'SCHEDULED_PLACE',
        resourceId: placeId,
        purpose: 'REORDER',
      }),
    };
  };

  const onDragEnd = (result: DropResult) => {
    void (async () => {
      const { source, destination } = result;
      const placeId = Number(result.draggableId);

      const acquired =
        dragAcquireRef.current?.placeId === placeId ? await dragAcquireRef.current.promise : null;
      dragAcquireRef.current = null;

      if (!acquired) return;

      if (acquired.status === 'conflict') {
        showWarning(`Locked by ${acquired.lock.owner.username}`);
        return;
      }

      dragLeaseRef.current = { placeId, release: acquired.release };

      try {
        if (!destination) {
          await releaseDragLease();
          return;
        }

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
          await releaseDragLease();
          return;
        }

        const fromPlanId = Number(source.droppableId);
        const toPlanId = Number(destination.droppableId);
        const fromPlan = dailyPlans.find((p) => p.id === fromPlanId);
        if (!fromPlan) {
          await releaseDragLease();
          return;
        }

        const fromPlaces = [...(fromPlan.scheduledPlaces ?? [])].sort((a, b) => a.order - b.order);
        const movedPlace = fromPlaces[source.index];
        if (!movedPlace) {
          await releaseDragLease();
          return;
        }

        updateScheduledPlace(
          {
            placeId: movedPlace.id,
            payload: {
              planId: toPlanId,
              order: destination.index + 1,
            },
          },
          {
            onSettled: () => {
              void releaseDragLease();
            },
          }
        );
      } catch {
        await releaseDragLease();
      }
    })();
  };

  return dailyPlans.length > 0 ? (
    <>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Box sx={{ mt: 2 }}>
          {sortByDateAsc(dailyPlans).map((plan, index) => {
            const planTitle = `${t('daily.day_label', { day: index + 1 })}: ${formatDateByLocale(plan.date, locale)}`;
            const scheduledPlaces = plan.scheduledPlaces;
            const hasPlace = !!scheduledPlaces?.length;
            return (
              <Droppable droppableId={String(plan.id)} key={plan.id} direction="vertical">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <SectionCard
                      key={plan.id}
                      title={planTitle}
                      asEmpty={!hasPlace}
                      titleEndAdornment={
                        <SectionPresenceGroup
                          users={getSectionUsersForPlan(plan.id)}
                          dialogTitle={t('presence.in_section', {
                            section: t('daily.day_label', { day: index + 1 }),
                          })}
                        />
                      }
                    >
                      {hasPlace ? (
                        <>
                          <List>
                            {scheduledPlaces
                              .toSorted((pA, pB) => pA.order - pB.order)
                              .map((place, idx, arr) => {
                                const prevPlace = arr[idx - 1];
                                const lock = locksMap[`SCHEDULED_PLACE:${place.id}`];
                                const lockedByOther =
                                  Boolean(lock) && Boolean(myUserId) && lock!.owner.id !== myUserId;

                                return (
                                  <Draggable
                                    key={place.id}
                                    draggableId={String(place.id)}
                                    index={idx}
                                  >
                                    {(provided, snapshot) => (
                                      <ListItem
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        style={sanitizeStyle(provided.draggableProps.style)}
                                        sx={{ p: 0, mb: 2, width: '100%', display: 'block' }}
                                      >
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                          {!snapshot.isDragging && prevPlace && (
                                            <TravelSegmentSelect
                                              start={prevPlace.ggmp.ggmpId}
                                              end={place.ggmp.ggmpId}
                                            />
                                          )}

                                          <ScheduledPlaceCard
                                            planId={plan.id}
                                            scheduledPlace={place}
                                            locale={locale}
                                            dragHandleProps={
                                              lockedByOther ? null : provided.dragHandleProps
                                            }
                                            isDragging={snapshot.isDragging}
                                            disabled={lockedByOther}
                                            lockOwnerName={
                                              lockedByOther ? lock!.owner.username : undefined
                                            }
                                          />
                                        </Box>
                                      </ListItem>
                                    )}
                                  </Draggable>
                                );
                              })}
                            {provided.placeholder}
                          </List>

                          <Button
                            variant="contained"
                            onClick={() => handleOpenDialog(plan.id)}
                            startIcon={<Plus />}
                          >
                            {t('daily.add_place')}
                          </Button>
                        </>
                      ) : (
                        <AddItemButton
                          label={t('daily.add_place')}
                          onClick={() => handleOpenDialog(plan.id)}
                        />
                      )}
                    </SectionCard>
                  </div>
                )}
              </Droppable>
            );
          })}
        </Box>
      </DragDropContext>

      <DailyPlanContext.Provider value={dailyPlanContext}>
        <SearchForScheduledPlacesDialog
          isOpened={isSearchDialogOpened}
          onClose={() => closeSearchDialog()}
        />
      </DailyPlanContext.Provider>

    </>
  ) : (
    <EmptyDailyPlanState />
  );
};

export default DailyPlanPage;
