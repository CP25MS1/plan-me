import { useMutation } from '@tanstack/react-query';
import { updateChecklistItem } from '@/api/checklist/api';
import { useDispatch } from 'react-redux';
import { updateChecklistItem as updateChecklistInStore } from '@/store/trip-detail-slice';
import { UpdateTripChecklistRequest, TripChecklistDto } from '@/api/checklist/type';

type UpdateVars = {
  itemId: string;
  payload: UpdateTripChecklistRequest;
};

export const useUpdateTripChecklist = (tripId: number) => {
  const dispatch = useDispatch();

  return useMutation<TripChecklistDto, Error, UpdateVars>({
    mutationFn: ({ itemId, payload }) => updateChecklistItem(tripId, itemId, payload),

    onSuccess: (item) => {
      dispatch(updateChecklistInStore(item));
    },
  });
};
