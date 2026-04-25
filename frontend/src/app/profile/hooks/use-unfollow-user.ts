import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { unfollowUser } from '@/api/users';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

export const useUnfollowUser = () => {
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: (userId: number) => unfollowUser(userId),
    onSuccess: () => {
      showSuccess(t('notification.success.unfollow'));
    },
    onError: () => {
      showError(t('notification.error.unfollow'));
    },
  });
};

export default useUnfollowUser;
