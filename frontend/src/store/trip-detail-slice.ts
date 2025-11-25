import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TripOverview } from '@/api/trips/type';

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
  },
});

export const { setTripOverview } = tripDetailSlice.actions;

export default tripDetailSlice.reducer;
