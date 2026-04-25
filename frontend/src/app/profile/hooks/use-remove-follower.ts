import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { removeFollower } from '@/api/users';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

export const useRemoveFollower = () => {
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: (userId: number) => removeFollower(userId),
    onSuccess: () => {
      showSuccess(t('notification.success.remove'));
    },
    onError: () => {
      showError(t('notification.error.remove'));
    },
  });
};

export default useRemoveFollower;
