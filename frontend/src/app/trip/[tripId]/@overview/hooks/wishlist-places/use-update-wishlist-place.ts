import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWishlistPlaceNote } from '@/api/trips';

export const useUpdateWishlistPlace = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ placeId, notes }: { placeId: number; notes: string }) =>
      updateWishlistPlaceNote({ tripId, placeId, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-wishlist-places', tripId] });
    },
  });
};

export default useUpdateWishlistPlace;
