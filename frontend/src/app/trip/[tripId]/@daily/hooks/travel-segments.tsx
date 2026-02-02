import { useMutation } from '@tanstack/react-query';
import { createTravelSegment } from '@/api/trips/api';
import { ComputeRouteRequestDto } from '@/api/trips/type';
import { useDispatch } from 'react-redux';
import { upsertRoute } from '@/store/route-slice';

export const useCreateTravelSegment = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (payload: ComputeRouteRequestDto) => createTravelSegment(payload),

    onSuccess: (data) => {
      dispatch(upsertRoute(data));
    },
  });
};
