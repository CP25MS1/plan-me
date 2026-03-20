'use client';

import { useEffect } from 'react';

import { deleteTripAddPresence, putTripAddPresence } from '@/api/realtime';
import type { TripRealtimeSection } from '@/api/realtime';

const RENEW_INTERVAL_MS = 20_000;

export const useTripAddPresenceEffect = ({
  tripId,
  enabled,
  section,
  planId,
}: {
  tripId: number;
  enabled: boolean;
  section: TripRealtimeSection;
  planId?: number;
}) => {
  useEffect(() => {
    if (!enabled) return;
    if (!Number.isFinite(tripId) || tripId <= 0) return;

    let canceled = false;

    const upsert = async () => {
      try {
        await putTripAddPresence({ tripId, section, planId });
      } catch {
        // ignore (best-effort presence)
      }
    };

    void upsert();

    const timer = window.setInterval(() => {
      if (canceled) return;
      void upsert();
    }, RENEW_INTERVAL_MS);

    return () => {
      canceled = true;
      window.clearInterval(timer);
      void deleteTripAddPresence(tripId);
    };
  }, [enabled, planId, section, tripId]);
};

export default useTripAddPresenceEffect;

