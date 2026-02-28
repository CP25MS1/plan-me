import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTripAlbum } from '@/api/memory/api';
import { CreateAlbumResponseDto } from '@/api/memory/type';

interface CreateTripAlbumVariables {
  tripId: number;
  formData: FormData;
}

export const useCreateTripAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateAlbumResponseDto, Error, CreateTripAlbumVariables>({
    mutationFn: ({ tripId, formData }) => createTripAlbum(tripId, formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['my-accessible-albums'],
      });

      queryClient.invalidateQueries({
        queryKey: ['memories-in-album', data.album.tripId],
      });
    },
  });
};
