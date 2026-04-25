import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { createTripAlbum } from '@/api/memory/api';
import { CreateAlbumResponseDto } from '@/api/memory/type';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

interface CreateTripAlbumVariables {
  tripId: number;
  formData: FormData;
}

export const useCreateTripAlbum = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation<CreateAlbumResponseDto, Error, CreateTripAlbumVariables>({
    mutationFn: ({ tripId, formData }) => createTripAlbum(tripId, formData),
    onSuccess: (data) => {
      showSuccess(t('notification.success.create'));
      queryClient.invalidateQueries({
        queryKey: ['my-accessible-albums'],
      });

      queryClient.invalidateQueries({
        queryKey: ['memories-in-album', data.album.tripId],
      });
    },
    onError: () => {
      showError(t('notification.error.create'));
    },
  });
};
