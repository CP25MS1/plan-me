import { useMutation } from '@tanstack/react-query';
import { refreshMemorySignedUrl } from '@/api/memory/api';
import { RefreshSignedUrlResponseDto, SupportedFileExtension } from '@/api/memory/type';

interface RefreshSignedUrlVariables {
  tripId: number;
  memoryId: number;
  extension?: SupportedFileExtension;
}

export const useRefreshMemorySignedUrl = () => {
  return useMutation<RefreshSignedUrlResponseDto, Error, RefreshSignedUrlVariables>({
    mutationFn: ({ tripId, memoryId, extension }) =>
      refreshMemorySignedUrl(tripId, memoryId, extension),
  });
};
