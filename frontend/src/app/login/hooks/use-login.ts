import { useQuery } from '@tanstack/react-query';
import { USERS } from '@/constants/query-keys';
import { login } from '@/api/users';

const useLogin = (code: string) => {
  return useQuery({
    queryKey: [USERS.LOGIN, code],
    queryFn: () => login(code),
    enabled: !!code,
  });
};

export default useLogin;
