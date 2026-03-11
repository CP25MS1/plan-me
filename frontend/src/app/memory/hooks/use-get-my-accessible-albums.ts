import { useQuery } from '@tanstack/react-query';
import { getMyAccessibleAlbums } from '@/api/memory/api';
import { ListAlbumsResponseDto } from '@/api/memory/type';

interface UseGetMyAccessibleAlbumsParams {
  limit?: number;
  cursor?: string;
}

export const useGetMyAccessibleAlbums = ({ limit, cursor }: UseGetMyAccessibleAlbumsParams) => {
  return useQuery<ListAlbumsResponseDto, Error>({
    queryKey: ['my-accessible-albums'],
    queryFn: () => getMyAccessibleAlbums(limit, cursor),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};
