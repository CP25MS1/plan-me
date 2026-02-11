'use client';

import { useMemo, useState } from 'react';
import { Box, Button, List, ListItem } from '@mui/material';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

import { useFullPageLoading } from '@/components/full-page-loading';
import SectionCard from '@/components/trip/overview/section-card';
import AddItemButton from '@/components/trip/overview/add-item-button';
import ScheduledPlaceCard from './components/scheduled-place-card';

import { useI18nSelector, useTripSelector } from '@/store/selectors';
import { formatDateByLocale, sortByDateAsc } from '@/lib/date';
import { Plus } from 'lucide-react';
import SearchForScheduledPlacesDialog from './components/search-for-scheduled-places-dialog';
import { DailyPlanContext } from './context/daily-plan-context';
import { useOpeningDialogContext } from './context/opening-dialog-context';
import { processReorder } from './helpers/process-order';
import { useUpdateScheduledPlace } from './hooks/use-scheduled-place-mutation';
import { useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import TravelSegmentSelect from './components/travel-segment-select';
import { sanitizeStyle } from './helpers/sanitize-transform';
import EmptyDailyPlanState from './components/empty-daily-plan-state';

const DailyPlanPage = () => {
  const dispatch = useDispatch();
  const { locale } = useI18nSelector();
  const { tripOverview } = useTripSelector();
  const dailyPlans = tripOverview?.dailyPlans || [];

  const { FullPageLoading } = useFullPageLoading();

  const [focusedPlanId, setFocusedPlanId] = useState(-1);
  const dailyPlanContext = useMemo(() => ({ planId: focusedPlanId }), [focusedPlanId]);

  const { isSearchDialogOpened, openSearchDialog, closeSearchDialog } = useOpeningDialogContext();
  const handleOpenDialog = (planId: number) => {
    setFocusedPlanId(planId);
    openSearchDialog();
  };

  const { mutate: updateScheduledPlace } = useUpdateScheduledPlace();
  const params = useParams<{ tripId: string }>();

  if (!tripOverview) return <FullPageLoading />;

  return dailyPlans.length > 0 ? (
    <>
      <DragDropContext
        onDragEnd={(result) =>
          processReorder({
            result,
            dailyPlans,
            tripId: Number(params.tripId),
            update: updateScheduledPlace,
            dispatch,
          })
        }
      >
        <Box sx={{ mt: 2 }}>
          {sortByDateAsc(dailyPlans).map((plan, index) => {
            const titlePrefix = locale === 'en' ? 'Day' : 'วันที่';
            const planTitle = `${titlePrefix} ${index + 1}: ${formatDateByLocale(plan.date, locale)}`;
            const scheduledPlaces = plan.scheduledPlaces;
            const hasPlace = !!scheduledPlaces?.length;
            return (
              <Droppable droppableId={String(plan.id)} key={plan.id} direction="vertical">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <SectionCard key={plan.id} title={planTitle} asEmpty={!hasPlace}>
                      {hasPlace ? (
                        <>
                          <List>
                            {scheduledPlaces
                              .toSorted((pA, pB) => pA.order - pB.order)
                              .map((place, idx, arr) => {
                                const prevPlace = arr[idx - 1];

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
                                            dragHandleProps={provided.dragHandleProps}
                                            isDragging={snapshot.isDragging}
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
                            {'เพิ่มสถานที่'}
                          </Button>
                        </>
                      ) : (
                        <AddItemButton
                          label={'เพิ่มสถานที่'}
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
