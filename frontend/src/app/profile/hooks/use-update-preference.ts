import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { updatePreference, UserPreference } from '@/api/users';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

export const useUpdatePreference = () => {
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: (preference: UserPreference) => updatePreference(preference),
    onSuccess: () => {
      showSuccess(t('notification.success.update'));
    },
    onError: () => {
      showError(t('notification.error.update'));
    },
  });
};

export default useUpdatePreference;
