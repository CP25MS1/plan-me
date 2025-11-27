import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TripOverview, WishlistPlace } from '@/api/trips/type';

interface TripDetailState {
  overview: TripOverview | null;
}

const initialState: TripDetailState = {
  overview: null,
};

const tripDetailSlice = createSlice({
  name: 'tripDetail',
  initialState,
  reducers: {
    setTripOverview: (state, action: PayloadAction<TripOverview>) => {
      state.overview = action.payload;
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
  },
});

export const { setTripOverview, addWishlistPlace, removeWishlistPlace, updateWishlistPlace } =
  tripDetailSlice.actions;

export default tripDetailSlice.reducer;
