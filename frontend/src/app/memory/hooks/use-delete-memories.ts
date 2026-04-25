import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMemories } from '@/api/memory/api';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

interface DeleteMemoriesVariables {
  tripId: number;
  memoryIds: number[];
}

export const useDeleteMemories = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation<void, Error, DeleteMemoriesVariables>({
    mutationFn: ({ tripId, memoryIds }) => deleteMemories(tripId, memoryIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['memories-in-album', variables.tripId],
      });

      queryClient.invalidateQueries({
        queryKey: ['my-accessible-albums'],
      });
      showSuccess(t('notification.success.delete'));
    },
    onError: () => {
      showError(t('notification.error.delete'));
    },
  });
};
