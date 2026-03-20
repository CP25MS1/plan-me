import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { TripRealtimeAddPresence, TripRealtimeLock } from '@/api/realtime';

export type TripRealtimeState = {
  locksByTripId: Record<number, Record<string, TripRealtimeLock>>;
  addPresenceByTripId: Record<number, TripRealtimeAddPresence[]>;
};

const initialState: TripRealtimeState = {
  locksByTripId: {},
  addPresenceByTripId: {},
};

const lockKey = (lock: { resourceType: string; resourceId: number }) =>
  `${lock.resourceType}:${lock.resourceId}`;

export const tripRealtimeSlice = createSlice({
  name: 'tripRealtime',
  initialState,
  reducers: {
    setSnapshot: (
      state,
      action: PayloadAction<{
        tripId: number;
        locks: TripRealtimeLock[];
        addPresence: TripRealtimeAddPresence[];
      }>
    ) => {
      const { tripId, locks, addPresence } = action.payload;

      const lockMap: Record<string, TripRealtimeLock> = {};
      for (const lock of locks) {
        lockMap[lockKey(lock)] = lock;
      }

      state.locksByTripId[tripId] = lockMap;
      state.addPresenceByTripId[tripId] = addPresence;
    },

    upsertLock: (state, action: PayloadAction<{ tripId: number; lock: TripRealtimeLock }>) => {
      const { tripId, lock } = action.payload;
      const map = state.locksByTripId[tripId] ?? {};
      map[lockKey(lock)] = lock;
      state.locksByTripId[tripId] = map;
    },

    removeLock: (state, action: PayloadAction<{ tripId: number; lock: TripRealtimeLock }>) => {
      const { tripId, lock } = action.payload;
      const map = state.locksByTripId[tripId];
      if (!map) return;
      delete map[lockKey(lock)];
    },

    upsertAddPresence: (
      state,
      action: PayloadAction<{ tripId: number; entry: TripRealtimeAddPresence }>
    ) => {
      const { tripId, entry } = action.payload;
      const list = state.addPresenceByTripId[tripId] ?? [];

      const idx = list.findIndex((p) => p.user.id === entry.user.id);
      if (idx === -1) {
        list.push(entry);
      } else {
        list[idx] = entry;
      }

      state.addPresenceByTripId[tripId] = list;
    },

    removeAddPresence: (
      state,
      action: PayloadAction<{ tripId: number; entry: TripRealtimeAddPresence }>
    ) => {
      const { tripId, entry } = action.payload;
      const list = state.addPresenceByTripId[tripId];
      if (!list) return;

      state.addPresenceByTripId[tripId] = list.filter((p) => p.user.id !== entry.user.id);
    },
  },
});

export const { setSnapshot, upsertLock, removeLock, upsertAddPresence, removeAddPresence } =
  tripRealtimeSlice.actions;

export default tripRealtimeSlice.reducer;

