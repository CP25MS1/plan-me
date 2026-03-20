import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTripOverview, UpsertTrip } from '@/api/trips';

export const useUpdateTripOverview = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripInfo: UpsertTrip) => updateTripOverview(tripId, tripInfo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip-header', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-daily-plans', tripId] });
    },
  });
};

export default useUpdateTripOverview;
