import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { createTrip, UpsertTrip } from '@/api/trips';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

export const useCreateTrip = () => {
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: (tripInfo: UpsertTrip) => createTrip(tripInfo),
    onSuccess: () => {
      showSuccess(t('notification.success.create'));
    },
    onError: () => {
      showError(t('notification.error.create'));
    },
  });
};

export default useCreateTrip;
