import { RespondInvitationRequest, respondToInvitation } from '@/api/invite';
import { useMutation } from '@tanstack/react-query';

export const useRespondToInvitation = () => {
  return useMutation({
    mutationFn: ({ tripId, request }: { tripId: number; request: RespondInvitationRequest }) =>
      respondToInvitation(tripId, request),
  });
};
