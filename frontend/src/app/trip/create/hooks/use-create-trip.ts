import { useMutation } from '@tanstack/react-query';

import { createTrip, UpsertTrip } from '@/api/trips';

export const useCreateTrip = () => {
  return useMutation({
    mutationFn: (tripInfo: UpsertTrip) => createTrip(tripInfo),
  });
};

export default useCreateTrip;
