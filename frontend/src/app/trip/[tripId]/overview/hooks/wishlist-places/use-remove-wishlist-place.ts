import { useMutation } from '@tanstack/react-query';

import { removePlaceFromWishlist } from '@/api/trips';

export const useRemoveWishlistPlace = () => {
  return useMutation({
    mutationFn: ({ tripId, placeId }: { tripId: number; placeId: number }) =>
      removePlaceFromWishlist({ tripId, placeId }),
  });
};

export default useRemoveWishlistPlace;
