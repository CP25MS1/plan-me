import { useQuery } from '@tanstack/react-query';
import { USERS } from '@/constants/query-keys';
import { profile } from '@/api/users/api';

const useGetProfile = (userId: string) => {
  return useQuery({
    queryKey: [USERS.PROFILE, userId],
    queryFn: () => profile(userId),
    enabled: !!userId,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export default useGetProfile;
