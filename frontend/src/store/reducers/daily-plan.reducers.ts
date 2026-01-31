import { TripDetailState } from '@/store/trip-detail-slice';
import { PayloadAction } from '@reduxjs/toolkit';
import { ScheduledPlace } from '@/api/trips';

type UpsertPayload = {
  planId: number;
  scheduledPlace: ScheduledPlace;
};

type RemovePayload = {
  planId: number;
  placeId: number;
};

const findDailyPlan = (state: TripDetailState, planId: number) =>
  state.overview?.dailyPlans?.find((plan) => plan.id === planId);

export const dailyPlanReducers = {
  addScheduledPlace(state: TripDetailState, { payload }: PayloadAction<UpsertPayload>) {
    const plan = findDailyPlan(state, payload.planId);
    if (!plan) return;

    plan.scheduledPlaces.push(payload.scheduledPlace);
  },

  removeScheduledPlace(state: TripDetailState, { payload }: PayloadAction<RemovePayload>) {
    const plan = findDailyPlan(state, payload.planId);
    if (!plan) return;

    const index = plan.scheduledPlaces.findIndex((place) => place.id === payload.placeId);

    if (index === -1) return;

    plan.scheduledPlaces.splice(index, 1);
  },
};
