'use client';

import { useCallback, useEffect, useRef } from 'react';

import type { TripRealtimeAcquireLockRequest, TripRealtimeLock } from '@/api/realtime';
import { acquireTripLock, releaseTripLock, renewTripLock } from '@/api/realtime';

const RENEW_INTERVAL_MS = 20_000;

export type AcquireLeaseResult =
  | { status: 'acquired'; lock: TripRealtimeLock; release: () => Promise<void> }
  | { status: 'conflict'; lock: TripRealtimeLock };

export const useTripLockLease = (tripId: number) => {
  const releasesRef = useRef<Array<() => Promise<void>>>([]);

  useEffect(() => {
    return () => {
      const releases = releasesRef.current;
      releasesRef.current = [];
      void Promise.allSettled(releases.map((fn) => fn()));
    };
  }, []);

  const acquireLease = useCallback(
    async (payload: TripRealtimeAcquireLockRequest): Promise<AcquireLeaseResult> => {
      const res = await acquireTripLock(tripId, payload);
      if (res.status === 'conflict') return res;

      let released = false;
      const renewTimer = window.setInterval(async () => {
        if (released) return;
        const renew = await renewTripLock(tripId, {
          resourceType: payload.resourceType,
          resourceId: payload.resourceId,
        });
        if (renew.status !== 'renewed') {
          window.clearInterval(renewTimer);
        }
      }, RENEW_INTERVAL_MS);

      const release = async () => {
        if (released) return;
        released = true;
        window.clearInterval(renewTimer);
        await releaseTripLock(tripId, {
          resourceType: payload.resourceType,
          resourceId: payload.resourceId,
        });
      };

      releasesRef.current.push(release);
      return { status: 'acquired', lock: res.lock, release };
    },
    [tripId]
  );

  return { acquireLease };
};

export default useTripLockLease;

