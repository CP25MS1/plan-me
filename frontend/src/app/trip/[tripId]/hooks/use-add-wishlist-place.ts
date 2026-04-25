import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addPlaceToWishlist } from '@/api/trips';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useAddWishlistPlace = (tripId: number) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: (ggmpId: string) => addPlaceToWishlist({ tripId, ggmpId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-wishlist-places', tripId] });
      showSuccess(t('notification.success.add_wishlist'));
    },
    onError: () => {
      showError(t('notification.error.add_wishlist'));
    },
  });
};

export default useAddWishlistPlace;
