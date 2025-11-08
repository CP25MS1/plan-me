import { useMutation } from '@tanstack/react-query';

import { removeFollower } from '@/api/users';

export const useRemoveFollower = () =>
  useMutation({
    mutationFn: (userId: number) => removeFollower(userId),
  });

export default useRemoveFollower;
