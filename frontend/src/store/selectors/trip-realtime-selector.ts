import { useSelector } from 'react-redux';

import type {
  TripRealtimeLock,
  TripRealtimeResourceType,
  TripRealtimeSection,
  TripRealtimeUser,
} from '@/api/realtime';
import type { RootState } from '@/store';

const lockKey = (resourceType: TripRealtimeResourceType, resourceId: number) =>
  `${resourceType}:${resourceId}`;

export const useTripRealtimeLock = (
  tripId: number,
  resourceType: TripRealtimeResourceType,
  resourceId: number
): TripRealtimeLock | null => {
  return useSelector((s: RootState) => {
    const map = s.tripRealtime.locksByTripId[tripId];
    return map?.[lockKey(resourceType, resourceId)] ?? null;
  });
};

export const useTripRealtimeLocksMap = (tripId: number): Record<string, TripRealtimeLock> => {
  return useSelector((s: RootState) => s.tripRealtime.locksByTripId[tripId] ?? {});
};

export const useIsLockedByOther = (
  tripId: number,
  resourceType: TripRealtimeResourceType,
  resourceId: number
): { lockedByOther: boolean; lock: TripRealtimeLock | null } => {
  return useSelector((s: RootState) => {
    const map = s.tripRealtime.locksByTripId[tripId];
    const lock = map?.[lockKey(resourceType, resourceId)] ?? null;
    const myUserId = s.profile.currentUser?.id;
    if (!lock) return { lockedByOther: false, lock: null };
    return { lockedByOther: lock.owner.id !== myUserId, lock };
  });
};

export const useTripSectionUsers = (
  tripId: number,
  section: TripRealtimeSection,
  opts?: { planId?: number }
): TripRealtimeUser[] => {
  return useSelector((s: RootState) => {
    const usersById = new Map<number, TripRealtimeUser>();

    const locksMap = s.tripRealtime.locksByTripId[tripId] ?? {};
    Object.values(locksMap).forEach((lock) => {
      if (lock.section !== section) return;
      if (section === 'DAILY_PLAN' && opts?.planId && lock.planId !== opts.planId) return;
      usersById.set(lock.owner.id, lock.owner);
    });

    const presence = s.tripRealtime.addPresenceByTripId[tripId] ?? [];
    presence.forEach((p) => {
      if (p.section !== section) return;
      if (section === 'DAILY_PLAN' && opts?.planId && p.planId !== opts.planId) return;
      usersById.set(p.user.id, p.user);
    });

    return Array.from(usersById.values());
  });
};
