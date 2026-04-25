import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removePlaceFromWishlist } from '@/api/trips';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useRemoveWishlistPlace = (tripId: number) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: (placeId: number) => removePlaceFromWishlist({ tripId, placeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-wishlist-places', tripId] });
      showSuccess(t('notification.success.remove_wishlist'));
    },
    onError: () => {
      showError(t('notification.error.remove_wishlist'));
    },
  });
};

export default useRemoveWishlistPlace;
