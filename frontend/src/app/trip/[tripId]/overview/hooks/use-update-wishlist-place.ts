import { useMutation } from '@tanstack/react-query';
import { updateWishlistPlaceNote } from '@/api/trips';

export const useUpdateWishlistPlace = () => {
  return useMutation({
    mutationFn: ({ tripId, placeId, notes }: { tripId: number; placeId: number; notes: string }) =>
      updateWishlistPlaceNote({ tripId, placeId, notes }),
  });
};

export default useUpdateWishlistPlace;
