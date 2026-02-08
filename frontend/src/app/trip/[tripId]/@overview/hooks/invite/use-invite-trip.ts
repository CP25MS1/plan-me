'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { inviteTrip } from '@/api/invite/api';
import { InviteTripRequestDto } from '@/api/invite/type';

import { TRIPMATES_QUERY_KEY } from './use-get-tripmates';

export const useInviteTrip = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteTripRequestDto) => inviteTrip(tripId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TRIPMATES_QUERY_KEY(tripId),
      });
    },
  });
};
