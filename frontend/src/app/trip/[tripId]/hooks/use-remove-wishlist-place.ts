import { useMutation, useQueryClient } from '@tanstack/react-query';

import { removePlaceFromWishlist } from '@/api/trips';

export const useRemoveWishlistPlace = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeId: number) => removePlaceFromWishlist({ tripId, placeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-wishlist-places', tripId] });
    },
  });
};

export default useRemoveWishlistPlace;
