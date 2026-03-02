import { useMutation, useQueryClient } from '@tanstack/react-query';
import { refreshMemorySignedUrl } from '@/api/memory/api';
import {
  RefreshSignedUrlResponseDto,
  SupportedFileExtension,
  ListMemoriesResponseDto,
} from '@/api/memory/type';

interface RefreshSignedUrlVariables {
  tripId: number;
  memoryId: number;
  extension?: SupportedFileExtension;
}

export const useRefreshMemorySignedUrl = () => {
  const queryClient = useQueryClient();

  return useMutation<RefreshSignedUrlResponseDto, Error, RefreshSignedUrlVariables>({
    mutationFn: ({ tripId, memoryId, extension }) =>
      refreshMemorySignedUrl(tripId, memoryId, extension),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['memories-in-album', variables.tripId],
      });

      queryClient.invalidateQueries({
        queryKey: ['album-signed-urls', variables.tripId],
      });

      queryClient.setQueryData<ListMemoriesResponseDto>(
        ['memories-in-album', variables.tripId],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            items: oldData.items.map((memory) =>
              memory.id === variables.memoryId
                ? {
                    ...memory,
                    signedUrl: data.signedUrl,
                    signedUrlExpiresAt: data.signedUrlExpiresAt,
                  }
                : memory
            ),
          };
        }
      );
    },
  });
};
