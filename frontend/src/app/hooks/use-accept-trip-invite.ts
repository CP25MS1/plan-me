'use client';

import { useMutation } from '@tanstack/react-query';

import { acceptTripInvite } from '@/api/invite/api';

export const useAcceptTripInvite = (tripId: number) => {
  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: number }) => acceptTripInvite(tripId, inviteId),
  });
};
