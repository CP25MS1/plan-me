import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TripOverview, WishlistPlace } from '@/api/trips/type';
import { ReservationDto } from '@/api/reservations';
import { dailyPlanReducers } from '@/store/reducers/daily-plan.reducers';
import { TripChecklistDto } from '@/api/checklist/type';

export interface TripDetailState {
  overview: TripOverview | null;
  checklist: TripChecklistDto[];
}

const initialState: TripDetailState = {
  overview: null,
  checklist: [],
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
    setTripChecklist: (state, action: PayloadAction<TripChecklistDto[]>) => {
      state.checklist = action.payload;
    },

    addChecklistItem: (state, action: PayloadAction<TripChecklistDto>) => {
      state.checklist.push(action.payload);
    },

    updateChecklistItem: (state, action: PayloadAction<TripChecklistDto>) => {
      const idx = state.checklist.findIndex((i) => i.id === action.payload.id);

      if (idx !== -1) {
        state.checklist[idx] = action.payload;
      }
    },

    removeChecklistItem: (state, action: PayloadAction<number>) => {
      state.checklist = state.checklist.filter((i) => i.id !== action.payload);
    },
    resetTripChecklist: (state) => {
      state.checklist = [];
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
  resetTripChecklist,
} = tripDetailSlice.actions;

export default tripDetailSlice.reducer;
