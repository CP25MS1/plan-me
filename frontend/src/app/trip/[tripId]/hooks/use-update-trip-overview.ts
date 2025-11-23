import { useMutation } from '@tanstack/react-query';
import { updateTripOverview, UpsertTrip } from '@/api/trips';

export const useUpdateTripOverview = (tripId: number) => {
  return useMutation({
    mutationFn: (tripInfo: UpsertTrip) => updateTripOverview(tripId, tripInfo),
  });
};

export default useUpdateTripOverview;
