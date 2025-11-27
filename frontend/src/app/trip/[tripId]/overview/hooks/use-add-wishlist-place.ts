import { useMutation } from '@tanstack/react-query';

import { addPlaceToWishlist } from '@/api/trips';

export const useAddWishlistPlace = () => {
  return useMutation({
    mutationFn: ({ tripId, ggmpId }: { tripId: number; ggmpId: string }) =>
      addPlaceToWishlist({ tripId, ggmpId }),
  });
};

export default useAddWishlistPlace;
