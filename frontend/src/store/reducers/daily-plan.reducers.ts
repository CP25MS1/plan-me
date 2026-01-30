import { TripDetailState } from '@/store/trip-detail-slice';
import { PayloadAction } from '@reduxjs/toolkit';
import { ScheduledPlace } from '@/api/trips';

type UpsertPayload = {
  planId: number;
  scheduledPlace: ScheduledPlace;
};

export const dailyPlanReducers = {
  addScheduledPlace: (state: TripDetailState, action: PayloadAction<UpsertPayload>) => {
    if (!state.overview?.dailyPlans) return;

    const planId = action.payload.planId;
    const planIndex = state.overview.dailyPlans.findIndex((plan) => plan.id === planId);

    if (planIndex === -1) return;

    state.overview.dailyPlans[planIndex].scheduledPlaces.push(action.payload.scheduledPlace);
  },
};
