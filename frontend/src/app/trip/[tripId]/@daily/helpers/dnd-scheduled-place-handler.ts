import { Dispatch } from 'redux';

import { DropResult } from '@hello-pangea/dnd';
import { useUpdateScheduledPlace } from '@/app/trip/[tripId]/@daily/hooks/use-scheduled-place-mutation';
import { DailyPlan } from '@/api/trips';
import { reorderScheduledPlace } from '@/store/trip-detail-slice';

type OnDragEndArgs = {
  result: DropResult;
  dailyPlans: DailyPlan[];
  tripId: number;
  update: ReturnType<typeof useUpdateScheduledPlace>['mutate'];
  dispatch: Dispatch;
};

export const processReorder = ({ result, dailyPlans, tripId, update, dispatch }: OnDragEndArgs) => {
  const { source, destination } = result;
  if (!destination) return;

  if (source.droppableId === destination.droppableId && source.index === destination.index) {
    return;
  }

  const fromPlanId = Number(source.droppableId);
  const toPlanId = Number(destination.droppableId);

  const sourcePlan = dailyPlans.find((p) => p.id === fromPlanId);
  if (!sourcePlan) return;

  const sortedPlaces = [...sourcePlan.scheduledPlaces].sort((a, b) => a.order - b.order);

  const movedPlace = sortedPlaces[source.index];
  if (!movedPlace) return;

  update(
    {
      tripId,
      placeId: movedPlace.id,
      payload: {
        planId: toPlanId,
        order: destination.index + 1,
      },
    },
    {
      onSuccess: () => {
        dispatch(
          reorderScheduledPlace({
            fromPlanId,
            toPlanId,
            placeId: movedPlace.id,
            toOrder: destination.index + 1,
          })
        );
      },
    }
  );
};
