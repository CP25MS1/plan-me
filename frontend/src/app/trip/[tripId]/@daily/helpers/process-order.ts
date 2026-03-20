import { DropResult } from '@hello-pangea/dnd';

import { DailyPlan } from '@/api/trips';
import { simulateReorder } from './simulate-reorder';
import { hasAnyAdjacentDuplicateGgmp } from './validate-no-adjacent-duplicate';
import { useUpdateScheduledPlace } from '../hooks/use-scheduled-place-mutation';

type OnDragEndArgs = {
  result: DropResult;
  dailyPlans: DailyPlan[];
  update: ReturnType<typeof useUpdateScheduledPlace>['mutate'];
};

export const processReorder = ({ result, dailyPlans, update }: OnDragEndArgs) => {
  const { source, destination } = result;
  if (!destination) return;

  // NO-OP GUARD
  if (source.droppableId === destination.droppableId && source.index === destination.index) {
    return;
  }

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
    finalTargetPlaces = simulateReorder(fromPlaces, source.index, destination.index);
  } else {
    const targetPlaces = [...toPlan.scheduledPlaces].sort((a, b) => a.order - b.order);
    finalTargetPlaces = [...targetPlaces];
    finalTargetPlaces.splice(destination.index, 0, movedPlace);
  }

  // validate final state
  if (hasAnyAdjacentDuplicateGgmp(finalTargetPlaces)) return;

  update(
    {
      placeId: movedPlace.id,
      payload: {
        planId: toPlanId,
        order: destination.index + 1,
      },
    },
    {}
  );
};
