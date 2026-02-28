import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadMemories } from '@/api/memory/api';
import { UploadMemoriesResponseDto } from '@/api/memory/type';

interface UploadMemoriesVariables {
  tripId: number;
  formData: FormData;
}

export const useUploadMemories = () => {
  const queryClient = useQueryClient();

  return useMutation<UploadMemoriesResponseDto, Error, UploadMemoriesVariables>({
    mutationFn: ({ tripId, formData }) => uploadMemories(tripId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['memories-in-album', variables.tripId],
      });

      queryClient.invalidateQueries({
        queryKey: ['my-accessible-albums'],
      });
    },
  });
};
