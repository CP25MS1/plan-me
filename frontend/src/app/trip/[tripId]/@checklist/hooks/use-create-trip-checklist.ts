import { useMutation } from '@tanstack/react-query';
import { createChecklistItem } from '@/api/checklist/api';
import { useDispatch } from 'react-redux';
import { addChecklistItem } from '@/store/trip-detail-slice';

export const useCreateTripChecklist = (tripId: number) => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (name: string) => createChecklistItem(tripId, { name }),

    onSuccess: (item) => {
      dispatch(addChecklistItem(item));
    },
  });
};
