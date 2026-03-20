'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';

import type {
  TripRealtimeAddPresence,
  TripRealtimeDataChanged,
  TripRealtimeLock,
  TripRealtimeScope,
  TripRealtimeSnapshot,
} from '@/api/realtime';
import { removeAddPresence, removeLock, setSnapshot, upsertAddPresence, upsertLock } from '@/store/trip-realtime-slice';
import { RESERVATIONS } from '@/constants/query-keys';

const parseJsonEvent = <T,>(event: MessageEvent): T | null => {
  try {
    return JSON.parse(event.data) as T;
  } catch {
    return null;
  }
};

export const useTripRealtimeSse = (tripId: number) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const baseUrl = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_BACKEND_URL;
    return raw ? raw.replace(/\/$/, '') : null;
  }, []);

  const pendingScopesRef = useRef<Set<TripRealtimeScope>>(new Set());
  const invalidateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!baseUrl) return;
    if (!Number.isFinite(tripId) || tripId <= 0) return;

    const url = `${baseUrl}/realtime/trips/${tripId}/stream`;
    const eventSource = new EventSource(url, { withCredentials: true });

    const scheduleInvalidate = (scopes: TripRealtimeScope[]) => {
      for (const scope of scopes) pendingScopesRef.current.add(scope);
      if (invalidateTimerRef.current) return;

      invalidateTimerRef.current = window.setTimeout(() => {
        const scopesToApply = Array.from(pendingScopesRef.current);
        pendingScopesRef.current.clear();
        invalidateTimerRef.current = null;

        for (const scope of scopesToApply) {
          switch (scope) {
            case 'HEADER':
              queryClient.invalidateQueries({ queryKey: ['trip-header', tripId] });
              break;
            case 'RESERVATIONS':
              queryClient.invalidateQueries({ queryKey: ['trip-reservations', tripId] });
              queryClient.invalidateQueries({ queryKey: [RESERVATIONS.PLACES, tripId] });
              break;
            case 'WISHLIST':
              queryClient.invalidateQueries({ queryKey: ['trip-wishlist-places', tripId] });
              break;
            case 'DAILY_PLANS':
              queryClient.invalidateQueries({ queryKey: ['trip-daily-plans', tripId] });
              break;
            default:
              break;
          }
        }
      }, 150);
    };

    const onSnapshot = (event: MessageEvent) => {
      const data = parseJsonEvent<TripRealtimeSnapshot>(event);
      if (!data) return;
      dispatch(setSnapshot({ tripId, locks: data.locks, addPresence: data.addPresence }));
    };

    const onLockUpsert = (event: MessageEvent) => {
      const lock = parseJsonEvent<TripRealtimeLock>(event);
      if (!lock) return;
      dispatch(upsertLock({ tripId, lock }));
    };

    const onLockRemove = (event: MessageEvent) => {
      const lock = parseJsonEvent<TripRealtimeLock>(event);
      if (!lock) return;
      dispatch(removeLock({ tripId, lock }));
    };

    const onPresenceUpsert = (event: MessageEvent) => {
      const entry = parseJsonEvent<TripRealtimeAddPresence>(event);
      if (!entry) return;
      dispatch(upsertAddPresence({ tripId, entry }));
    };

    const onPresenceRemove = (event: MessageEvent) => {
      const entry = parseJsonEvent<TripRealtimeAddPresence>(event);
      if (!entry) return;
      dispatch(removeAddPresence({ tripId, entry }));
    };

    const onDataChanged = (event: MessageEvent) => {
      const data = parseJsonEvent<TripRealtimeDataChanged>(event);
      if (!data) return;
      scheduleInvalidate(data.scopes);
    };

    eventSource.addEventListener('snapshot', onSnapshot);
    eventSource.addEventListener('lock_acquired', onLockUpsert);
    eventSource.addEventListener('lock_released', onLockRemove);
    eventSource.addEventListener('lock_expired', onLockRemove);
    eventSource.addEventListener('add_presence_upserted', onPresenceUpsert);
    eventSource.addEventListener('add_presence_cleared', onPresenceRemove);
    eventSource.addEventListener('data_changed', onDataChanged);

    return () => {
      if (invalidateTimerRef.current) {
        window.clearTimeout(invalidateTimerRef.current);
        invalidateTimerRef.current = null;
      }
      pendingScopesRef.current.clear();
      eventSource.close();
    };
  }, [baseUrl, dispatch, queryClient, tripId]);
};

export default useTripRealtimeSse;
