import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMemories } from '@/api/memory/api';

interface DeleteMemoriesVariables {
  tripId: number;
  memoryIds: number[];
}

export const useDeleteMemories = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteMemoriesVariables>({
    mutationFn: ({ tripId, memoryIds }) => deleteMemories(tripId, memoryIds),
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
