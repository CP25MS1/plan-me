import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { followUser } from '@/api/users';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

export const useFollowUser = () => {
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: (userId: number) => followUser(userId),
    onSuccess: () => {
      showSuccess(t('notification.success.follow'));
    },
    onError: () => {
      showError(t('notification.error.follow'));
    },
  });
};

export default useFollowUser;
