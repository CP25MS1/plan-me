import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTripAlbum } from '@/api/memory/api';

export const useDeleteTripAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (tripId) => deleteTripAlbum(tripId),
    onSuccess: (_, tripId) => {
      queryClient.invalidateQueries({
        queryKey: ['my-accessible-albums'],
      });

      queryClient.invalidateQueries({
        queryKey: ['memories-in-album', tripId],
      });
    },
  });
};
