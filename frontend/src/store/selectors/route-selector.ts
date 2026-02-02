import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { makeRouteKey } from '@/store/route-slice';

export const useSelectRoute = (startPlaceId: string, endPlaceId: string, mode: string) => {
  const route = useSelector((s: RootState) => s.route);
  return route.entities[makeRouteKey(startPlaceId, endPlaceId, mode)];
};
