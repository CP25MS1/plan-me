import { useQuery } from '@tanstack/react-query';
import { getTripInvitationCode } from '@/api/invite';

export const useGetTripInvitationCode = (tripId: number) => {
  return useQuery({
    queryKey: ['INVITATION_CODE', `${tripId}`],
    queryFn: () => getTripInvitationCode(tripId),
    enabled: !!tripId,
    retry: false,
  });
};
