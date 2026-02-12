import { useMutation } from '@tanstack/react-query';
import { deleteChecklistItem } from '@/api/checklist/api';
import { useDispatch } from 'react-redux';
import { removeChecklistItem } from '@/store/trip-detail-slice';

export const useDeleteTripChecklist = (tripId: number) => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (itemId: string) => deleteChecklistItem(tripId, itemId),

    onSuccess: (_, itemId) => {
      dispatch(
        removeChecklistItem({
          tripId,
          itemId,
        })
      );
    },
  });
};
