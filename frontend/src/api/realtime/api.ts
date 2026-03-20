import { apiClient } from '@/api/client';
import type {
  AcquireLockResult,
  RenewLockResult,
  ReleaseLockResult,
  TripRealtimeAcquireLockRequest,
  TripRealtimeLock,
  TripRealtimeLockKeyRequest,
  TripRealtimeSection,
} from './type';

export const putTripAddPresence = async ({
  tripId,
  section,
  planId,
}: {
  tripId: number;
  section: TripRealtimeSection;
  planId?: number;
}): Promise<void> => {
  await apiClient.put(`/realtime/trips/${tripId}/add-presence`, { section, planId });
};

export const deleteTripAddPresence = async (tripId: number): Promise<void> => {
  await apiClient.delete(`/realtime/trips/${tripId}/add-presence`);
};

export const acquireTripLock = async (
  tripId: number,
  payload: TripRealtimeAcquireLockRequest
): Promise<AcquireLockResult> => {
  const res = await apiClient.post<TripRealtimeLock>(
    `/realtime/trips/${tripId}/locks/acquire`,
    payload,
    { validateStatus: (s) => s === 200 || s === 409 }
  );

  if (res.status === 200) return { status: 'acquired', lock: res.data };
  return { status: 'conflict', lock: res.data };
};

export const renewTripLock = async (
  tripId: number,
  payload: TripRealtimeLockKeyRequest
): Promise<RenewLockResult> => {
  const res = await apiClient.post<TripRealtimeLock>(
    `/realtime/trips/${tripId}/locks/renew`,
    payload,
    { validateStatus: (s) => s === 200 || s === 404 || s === 409 }
  );

  if (res.status === 200) return { status: 'renewed', lock: res.data };
  if (res.status === 409) return { status: 'conflict', lock: res.data };
  return { status: 'not_found' };
};

export const releaseTripLock = async (
  tripId: number,
  payload: TripRealtimeLockKeyRequest
): Promise<ReleaseLockResult> => {
  const res = await apiClient.post(
    `/realtime/trips/${tripId}/locks/release`,
    payload,
    { validateStatus: (s) => s === 204 || s === 403 || s === 404 }
  );

  if (res.status === 204) return { status: 'released' };
  if (res.status === 403) return { status: 'forbidden' };
  return { status: 'not_found' };
};
