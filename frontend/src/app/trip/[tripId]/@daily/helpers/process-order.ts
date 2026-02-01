import { Dispatch } from 'redux';
import { DropResult } from '@hello-pangea/dnd';

import { DailyPlan } from '@/api/trips';
import { reorderScheduledPlace } from '@/store/trip-detail-slice';
import { simulateReorder } from './simulate-reorder';
import { hasAnyAdjacentDuplicateGgmp } from './validate-no-adjacent-duplicate';
import { useUpdateScheduledPlace } from '../hooks/use-scheduled-place-mutation';

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

  const fromPlanId = Number(source.droppableId);
  const toPlanId = Number(destination.droppableId);
  const isSamePlan = fromPlanId === toPlanId;

  const fromPlan = dailyPlans.find((p) => p.id === fromPlanId);
  const toPlan = dailyPlans.find((p) => p.id === toPlanId);
  if (!fromPlan || !toPlan) return;

  const fromPlaces = [...fromPlan.scheduledPlaces].sort((a, b) => a.order - b.order);
  const movedPlace = fromPlaces[source.index];
  if (!movedPlace) return;

  let finalTargetPlaces: typeof fromPlaces;

  if (isSamePlan) {
    // 🔑 simulate ผลลัพธ์สุดท้ายจริง
    finalTargetPlaces = simulateReorder(fromPlaces, source.index, destination.index);
  } else {
    // cross-plan → simulate insert
    const targetPlaces = [...toPlan.scheduledPlaces].sort((a, b) => a.order - b.order);
    finalTargetPlaces = [...targetPlaces];
    finalTargetPlaces.splice(destination.index, 0, movedPlace);
  }

  // 🔥 validate ทั้ง list
  if (hasAnyAdjacentDuplicateGgmp(finalTargetPlaces)) {
    console.warn('Adjacent duplicate ggmpId is not allowed');
    return;
  }

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
