import { useQuery } from '@tanstack/react-query';
import { getMemoriesInAlbum } from '@/api/memory/api';
import { ListMemoriesResponseDto, SupportedFileExtension } from '@/api/memory/type';

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
  return useQuery<ListMemoriesResponseDto, Error>({
    queryKey: ['memories-in-album', tripId, extensions, limit, cursor],
    queryFn: () =>
      getMemoriesInAlbum(tripId, {
        extensions,
        limit,
        cursor,
      }),
    enabled: tripId > 0,
  });
};
