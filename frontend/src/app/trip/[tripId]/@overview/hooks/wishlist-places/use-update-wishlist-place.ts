import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWishlistPlaceNote } from '@/api/trips';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useUpdateWishlistPlace = (tripId: number) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation({
    mutationFn: ({ placeId, notes }: { placeId: number; notes: string }) =>
      updateWishlistPlaceNote({ tripId, placeId, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-wishlist-places', tripId] });
      showSuccess(t('notification.success.update'));
    },
    onError: () => {
      showError(t('notification.error.update'));
    },
  });
};

export default useUpdateWishlistPlace;
