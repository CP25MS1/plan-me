import { useQuery } from '@tanstack/react-query';
import { getChecklistItems } from '@/api/checklist/api';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setTripChecklist } from '@/store/trip-detail-slice';
import { RootState } from '@/store';

export const useGetTripChecklist = (tripId: number) => {
  const dispatch = useDispatch();

  const itemsInStore = useSelector((s: RootState) => s.tripDetail.checklist?.[tripId]);

  const query = useQuery({
    queryKey: ['trip-checklist', tripId],
    queryFn: () => getChecklistItems(tripId),
    enabled: !itemsInStore, // ถ้ามีแล้วไม่ต้องยิง
  });

  useEffect(() => {
    if (query.data) {
      dispatch(
        setTripChecklist({
          tripId,
          items: query.data,
        })
      );
    }
  }, [query.data, tripId, dispatch]);

  return {
    ...query,
    data: itemsInStore ?? query.data,
  };
};
