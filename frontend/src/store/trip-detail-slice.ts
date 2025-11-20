import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TripOverview } from '@/api/trips/type';

interface TripOverviewState {
  data: TripOverview | null;
  isLoaded: boolean;
}

const initialState: TripOverviewState = {
  data: null,
  isLoaded: false,
};

const tripOverviewSlice = createSlice({
  name: 'tripOverview',
  initialState,
  reducers: {
    setTripOverview: (state, action: PayloadAction<TripOverview>) => {
      state.data = action.payload;
      state.isLoaded = true;
    },
    updateTripOverview: (state, action: PayloadAction<Partial<TripOverview>>) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    clearTripOverview: (state) => {
      state.data = null;
      state.isLoaded = false;
    },
  },
});

export const { setTripOverview, updateTripOverview, clearTripOverview } = tripOverviewSlice.actions;

export default tripOverviewSlice.reducer;
