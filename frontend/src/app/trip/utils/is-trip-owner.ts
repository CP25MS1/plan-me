import { TripOverview } from '@/api/trips/type';
import { PublicUserInfo } from '@/api/users/type';

export function isTripOwner(me?: PublicUserInfo | null, trip?: TripOverview | null): boolean {
  if (!me || !trip?.owner) return false;

  return String(me.id) === String(trip.owner.id);
}
