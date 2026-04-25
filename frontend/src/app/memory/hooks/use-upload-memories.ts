import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadMemories } from '@/api/memory/api';
import { UploadMemoriesResponseDto } from '@/api/memory/type';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

interface UploadMemoriesVariables {
  tripId: number;
  formData: FormData;
}

export const useUploadMemories = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation<UploadMemoriesResponseDto, Error, UploadMemoriesVariables>({
    mutationFn: ({ tripId, formData }) => uploadMemories(tripId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['memories-in-album', variables.tripId],
      });

      queryClient.invalidateQueries({
        queryKey: ['my-accessible-albums'],
      });
      showSuccess(t('notification.success.upload'));
    },
    onError: () => {
      showError(t('notification.error.upload'));
    },
  });
};
