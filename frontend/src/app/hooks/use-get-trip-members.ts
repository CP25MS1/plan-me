import React from 'react';
import { useTripHeader } from '@/api/trips';

export const useGetTripMembers = (tripId: number) => {
  const { data: tripHeader } = useTripHeader(tripId);

  return React.useMemo(() => {
    const owner = tripHeader?.owner;
    if (!owner) return [];

    const tripmates = (tripHeader.tripmates ?? []).filter((m) => m.id !== owner.id);
    return [owner, ...tripmates];
  }, [tripHeader]);
};
