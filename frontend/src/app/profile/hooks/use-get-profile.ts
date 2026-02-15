import { useQuery } from '@tanstack/react-query';
import { USERS } from '@/constants/query-keys';
import { getProfile } from '@/api/users/api';

export const useGetProfile = (userId: number) => {
  return useQuery({
    queryKey: [USERS.PROFILE, userId],
    queryFn: () => getProfile(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
    gcTime: 0,
  });
};

export default useGetProfile;
