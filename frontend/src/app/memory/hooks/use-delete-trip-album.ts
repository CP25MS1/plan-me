import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { deleteTripAlbum } from '@/api/memory/api';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

export const useDeleteTripAlbum = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation<void, Error, { tripId: number }>({
    mutationFn: ({ tripId }) => deleteTripAlbum(tripId),

    onSuccess: (_, { tripId }) => {
      showSuccess(t('notification.success.delete'));
      queryClient.invalidateQueries({
        queryKey: ['my-accessible-albums'],
      });

      queryClient.invalidateQueries({
        queryKey: ['memories-in-album', tripId],
      });
    },
    onError: () => {
      showError(t('notification.error.delete'));
    },
  });
};
