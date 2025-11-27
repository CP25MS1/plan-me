import { useMutation } from '@tanstack/react-query';

import { followUser } from '@/api/users';

export const useFollowUser = () =>
  useMutation({
    mutationFn: (userId: number) => followUser(userId),
  });

export default useFollowUser;
