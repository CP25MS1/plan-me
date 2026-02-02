import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TravelSegmentResponseDto } from '@/api/trips/type';

export interface RouteState {
  entities: Record<string, TravelSegmentResponseDto>;
}

export const makeRouteKey = (startPlaceId: string, endPlaceId: string, mode: string) =>
  `${startPlaceId}|${endPlaceId}|${mode}`;

const initialState: RouteState = {
  entities: {},
};

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    upsertRoute: (state, action: PayloadAction<TravelSegmentResponseDto>) => {
      const { startPlaceId, endPlaceId, mode } = action.payload;
      const key = makeRouteKey(startPlaceId, endPlaceId, mode);

      state.entities[key] = action.payload;
    },
  },
});

export const { upsertRoute } = routeSlice.actions;
export default routeSlice.reducer;
