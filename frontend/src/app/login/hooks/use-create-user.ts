import { useMutation } from '@tanstack/react-query';

import { createUser, CreateUserPayload } from '@/api/users';

const useCreateUser = () =>
  useMutation({
    mutationFn: (user: CreateUserPayload) => createUser(user),
  });

export default useCreateUser;
