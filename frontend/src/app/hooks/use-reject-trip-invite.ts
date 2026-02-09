'use client';

import { useMutation } from '@tanstack/react-query';

import { rejectTripInvite } from '@/api/invite/api';

export const useRejectTripInvite = (tripId: number) => {
  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: number }) => rejectTripInvite(tripId, inviteId),
  });
};
