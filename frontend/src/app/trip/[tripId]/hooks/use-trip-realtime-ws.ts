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

type WsMessageWrapper<T = any> = {
  type: string;
  data: T;
};

export const useTripRealtimeWs = (tripId: number) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const wsUrl = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!raw) return null;
    try {
      const urlObj = new URL(raw);
      urlObj.protocol = urlObj.protocol === 'https:' ? 'wss:' : 'ws:';
      const basePath = urlObj.pathname.replace(/\/$/, '');
      return `${urlObj.origin}${basePath}/realtime/trips/${tripId}/ws`;
    } catch {
      return null;
    }
  }, [tripId]);

  const pendingScopesRef = useRef<Set<TripRealtimeScope>>(new Set());
  const invalidateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!wsUrl || !Number.isFinite(tripId) || tripId <= 0) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let isComponentMounted = true;

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
            case 'BUDGET':
              queryClient.invalidateQueries({ queryKey: ['tripBudget', tripId] });
              queryClient.invalidateQueries({ queryKey: ['tripExpenses', tripId] });
              queryClient.invalidateQueries({ queryKey: ['tripDebtSummary', tripId] });
              break;
            case 'CHECKLIST':
              queryClient.invalidateQueries({ queryKey: ['trip-checklist', tripId] });
              queryClient.invalidateQueries({ queryKey: ['trip-checklist-recommended', tripId] });
              break;
            default:
              break;
          }
        }
      }, 150);
    };

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        const wrapper = parseJsonEvent<WsMessageWrapper>(event);
        if (!wrapper) return;

        const { type, data } = wrapper;

        switch (type) {
          case 'snapshot':
            dispatch(setSnapshot({ tripId, locks: data.locks, addPresence: data.addPresence }));
            break;
          case 'lock_acquired':
            dispatch(upsertLock({ tripId, lock: data }));
            break;
          case 'lock_released':
          case 'lock_expired':
            dispatch(removeLock({ tripId, lock: data }));
            break;
          case 'add_presence_upserted':
            dispatch(upsertAddPresence({ tripId, entry: data }));
            break;
          case 'add_presence_cleared':
            dispatch(removeAddPresence({ tripId, entry: data }));
            break;
          case 'data_changed':
            scheduleInvalidate(data.scopes);
            break;
          default:
            break;
        }
      };

      ws.onclose = () => {
        if (isComponentMounted) {
          reconnectTimer = window.setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      isComponentMounted = false;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (invalidateTimerRef.current) {
        window.clearTimeout(invalidateTimerRef.current);
        invalidateTimerRef.current = null;
      }
      pendingScopesRef.current.clear();
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [wsUrl, dispatch, queryClient, tripId]);
};

export default useTripRealtimeWs;
