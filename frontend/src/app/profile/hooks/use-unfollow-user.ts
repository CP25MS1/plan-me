import { useMutation } from '@tanstack/react-query';

import { unfollowUser } from '@/api/users';

export const useUnfollowUser = () =>
  useMutation({
    mutationFn: (userId: number) => unfollowUser(userId),
  });

export default useUnfollowUser;
