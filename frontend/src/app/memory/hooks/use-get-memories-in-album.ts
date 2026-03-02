import { useQuery } from '@tanstack/react-query';
import { getMemoriesInAlbum } from '@/api/memory/api';
import { SupportedFileExtension } from '@/api/memory/type';

interface UseGetMemoriesInAlbumParams {
  tripId: number;
  extensions?: SupportedFileExtension[];
  limit?: number;
  cursor?: string;
}

export const useGetMemoriesInAlbum = ({
  tripId,
  extensions,
  limit,
  cursor,
}: UseGetMemoriesInAlbumParams) => {
  return useQuery({
    queryKey: ['memories-in-album', tripId, extensions, limit, cursor],
    queryFn: () =>
      getMemoriesInAlbum(tripId, {
        extensions,
        limit,
        cursor,
      }),
    enabled: tripId > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always', 
    refetchOnWindowFocus: true, 
  });
};
