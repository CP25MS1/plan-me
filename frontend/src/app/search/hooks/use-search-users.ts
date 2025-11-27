import { useQuery } from '@tanstack/react-query';

import { searchUsers } from '@/api/users';
import { USERS } from '@/constants/query-keys';

export const useSearchUsers = (page: number, q: string = '') => {
  return useQuery({
    queryKey: [USERS.SEARCH, q, page],
    queryFn: () => searchUsers(q, page),
    refetchOnWindowFocus: false,
  });
};

export default useSearchUsers;
