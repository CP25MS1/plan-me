import { useMutation } from '@tanstack/react-query';
import { logout } from '@/api/users/api';

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
  });
};
