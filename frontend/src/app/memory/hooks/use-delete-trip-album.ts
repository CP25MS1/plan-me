import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTripAlbum } from '@/api/memory/api';

export const useDeleteTripAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { albumId: number }>({
    mutationFn: ({ albumId }) => deleteTripAlbum(albumId),

    onSuccess: (_, { albumId }) => {
      queryClient.invalidateQueries({
        queryKey: ['my-accessible-albums'],
      });

      queryClient.invalidateQueries({
        queryKey: ['memories-in-album', albumId],
      });
    },
  });
};
