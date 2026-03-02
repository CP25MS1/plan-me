import { useQuery } from '@tanstack/react-query';
import { getAlbumSignedUrls } from '@/api/memory/api';
import { AlbumSignedUrlsResponseDto } from '@/api/memory/type';

export const useGetAlbumSignedUrls = (tripId?: number) => {
  return useQuery<AlbumSignedUrlsResponseDto, Error>({
    queryKey: ['album-signed-urls', tripId],
    queryFn: () => {
      if (!tripId) {
        throw new Error('tripId is required');
      }
      return getAlbumSignedUrls(tripId);
    },
    enabled: Boolean(tripId),
    staleTime: 30_000,
  });
};
