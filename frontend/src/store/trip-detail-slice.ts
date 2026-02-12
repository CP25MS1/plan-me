import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TripOverview, WishlistPlace } from '@/api/trips/type';
import { ReservationDto } from '@/api/reservations';
import { dailyPlanReducers } from '@/store/reducers/daily-plan.reducers';
import { TripChecklistDto } from '@/api/checklist/type';

export interface TripDetailState {
  overview: TripOverview | null;
  checklist: Record<number, TripChecklistDto[]>;
}

const initialState: TripDetailState = {
  overview: null,
  checklist: {},
};

const tripDetailSlice = createSlice({
  name: 'tripDetail',
  initialState,
  reducers: {
    setTripOverview: (state, action: PayloadAction<TripOverview>) => {
      state.overview = action.payload;
    },
    addReservation: (state, action: PayloadAction<ReservationDto>) => {
      if (!state.overview) return;
      state.overview.reservations.push(action.payload);
    },
    removeReservation: (state, action: PayloadAction<{ reservationId: number }>) => {
      if (!state.overview) return;
      const removeIndex = state.overview.reservations.findIndex(
        (rs) => rs.id === action.payload.reservationId
      );
      if (removeIndex === -1) return;
      state.overview.reservations.splice(removeIndex, 1);
    },
    updateReservation: (state, action: PayloadAction<ReservationDto>) => {
      if (!state.overview) return;
      const rs = action.payload;
      const updateIndex = state.overview.reservations.findIndex((ors) => ors.id === rs.id);
      const oldReservation = state.overview.reservations[updateIndex];
      state.overview.reservations.splice(updateIndex, 1, {
        ...rs,
        id: oldReservation.id,
        tripId: oldReservation.tripId,
      });
    },
    addWishlistPlace: (state, action: PayloadAction<WishlistPlace>) => {
      if (!state.overview) return;
      state.overview.wishlistPlaces.push(action.payload);
    },
    removeWishlistPlace: (state, action: PayloadAction<{ wishlistPlaceId: number }>) => {
      if (!state.overview) return;
      const removeIndex = state.overview.wishlistPlaces.findIndex(
        (wp) => wp.id === action.payload.wishlistPlaceId
      );
      if (removeIndex === -1) return;
      state.overview.wishlistPlaces.splice(removeIndex, 1);
    },
    updateWishlistPlace: (state, action: PayloadAction<{ wp: WishlistPlace }>) => {
      if (!state.overview) return;
      const { wp } = action.payload;
      const updateIndex = state.overview.wishlistPlaces.findIndex((owp) => owp.id === wp.id);
      const oldWishlistPlace = state.overview.wishlistPlaces[updateIndex];
      state.overview.wishlistPlaces.splice(updateIndex, 1, {
        ...wp,
        id: oldWishlistPlace.id,
        tripId: oldWishlistPlace.tripId,
      });
    },

    ...dailyPlanReducers,
    setTripChecklist: (
      state,
      action: PayloadAction<{
        tripId: number;
        items: TripChecklistDto[];
      }>
    ) => {
      state.checklist[action.payload.tripId] = action.payload.items;
    },

    addChecklistItem: (
      state,
      action: PayloadAction<{
        tripId: number;
        item: TripChecklistDto;
      }>
    ) => {
      const { tripId, item } = action.payload;

      if (!state.checklist[tripId]) {
        state.checklist[tripId] = [];
      }

      state.checklist[tripId].push(item);
    },

    updateChecklistItem: (
      state,
      action: PayloadAction<{
        tripId: number;
        item: TripChecklistDto;
      }>
    ) => {
      const list = state.checklist[action.payload.tripId];
      if (!list) return;

      const idx = list.findIndex((i) => i.id === action.payload.item.id);
      if (idx === -1) return;

      list[idx] = action.payload.item;
    },

    removeChecklistItem: (
      state,
      action: PayloadAction<{
        tripId: number;
        itemId: string;
      }>
    ) => {
      const list = state.checklist[action.payload.tripId];
      if (!list) return;

      state.checklist[action.payload.tripId] = list.filter((i) => i.id !== action.payload.itemId);
    },
  },
});

export const {
  setTripOverview,
  addReservation,
  removeReservation,
  updateReservation,
  addWishlistPlace,
  removeWishlistPlace,
  updateWishlistPlace,
  addScheduledPlace,
  removeScheduledPlace,
  reorderScheduledPlace,
  updateScheduledPlace,
  setTripChecklist,
  addChecklistItem,
  updateChecklistItem,
  removeChecklistItem,
} = tripDetailSlice.actions;

export default tripDetailSlice.reducer;
