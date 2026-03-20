import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addPlaceToWishlist } from '@/api/trips';

export const useAddWishlistPlace = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ggmpId: string) => addPlaceToWishlist({ tripId, ggmpId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-wishlist-places', tripId] });
    },
  });
};

export default useAddWishlistPlace;
