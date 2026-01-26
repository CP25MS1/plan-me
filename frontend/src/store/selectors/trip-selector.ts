import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const useTripSelector = () => {
  const tripOverview = useSelector((s: RootState) => s.tripDetail.overview);

  return {
    tripOverview,
  };
};
