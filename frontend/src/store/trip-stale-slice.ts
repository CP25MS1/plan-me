import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TripStaleState = {
  staleByTripId: Record<number, boolean>;
};

const initialState: TripStaleState = {
  staleByTripId: {},
};

export const tripStaleSlice = createSlice({
  name: 'tripStale',
  initialState,
  reducers: {
    markStale: (state, action: PayloadAction<number>) => {
      state.staleByTripId[action.payload] = true;
    },
    clearStale: (state, action: PayloadAction<number>) => {
      delete state.staleByTripId[action.payload];
    },
  },
});

export const { markStale, clearStale } = tripStaleSlice.actions;

export default tripStaleSlice.reducer;
