import { useQuery } from '@tanstack/react-query';
import { getChecklistItems } from '@/api/checklist/api';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setTripChecklist, resetTripChecklist } from '@/store/trip-detail-slice';
import { RootState } from '@/store';

export const useGetTripChecklist = (tripId: number) => {
  const dispatch = useDispatch();
  const itemsInStore = useSelector((s: RootState) => s.tripDetail.checklist);

  useEffect(() => {
    dispatch(resetTripChecklist());
  }, [tripId, dispatch]);

  const query = useQuery({
    queryKey: ['trip-checklist', tripId],
    queryFn: () => getChecklistItems(tripId),
  });

  useEffect(() => {
    if (query.data) {
      dispatch(setTripChecklist(query.data));
    }
  }, [query.data, dispatch]);

  return {
    ...query,
    data: itemsInStore.length > 0 ? itemsInStore : query.data,
  };
};
