'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rejectTripInvite } from '@/api/invite/api';

import { TRIPMATES_QUERY_KEY } from './use-get-tripmates';
import { NOTIFICATIONS_QUERY_KEY } from '@/app/home/hooks/use-get-notifications';

export const useRejectTripInvite = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: number }) => rejectTripInvite(tripId, inviteId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TRIPMATES_QUERY_KEY(tripId),
      });

      queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });
    },
  });
};
