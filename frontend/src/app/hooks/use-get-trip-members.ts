import { useTripHeader } from '@/api/trips';

export const useGetTripMembers = (tripId: number) => {
  const { data: tripHeader } = useTripHeader(tripId);

  const owner = tripHeader?.owner;
  if (!owner) return [];

  const tripmates = (tripHeader.tripmates ?? []).filter((m) => m.id !== owner.id);

  return [owner, ...tripmates];
};
