'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@/store';
import { useAcceptTripInvite, useRejectTripInvite } from '@/app/hooks';
import { removeInvitation } from '@/store/profile-slice';

export const useDirectInvitationAction = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { inviteId } = useParams<{ inviteId: string }>();

  const tripId = Number(searchParams.get('tripId'));
  const tripName = searchParams.get('tripName') ?? '';

  const invitations = useSelector((s: RootState) => s.profile.invitations);
  const invitation = invitations.find((i) => i.invitationId === Number(inviteId));

  const { mutate: acceptInvite, isPending: isAccepting } = useAcceptTripInvite(tripId);
  const { mutate: rejectInvite, isPending: isRejecting } = useRejectTripInvite(tripId);

  const isLoading = isAccepting || isRejecting;

  const clearInvitation = () => {
    if (!invitation) return;
    dispatch(removeInvitation({ invitationId: invitation.invitationId }));
  };

  const onAccept = () => {
    if (!invitation) return;

    acceptInvite(
      { inviteId: invitation.invitationId },
      {
        onSuccess: () => {
          clearInvitation();
          router.replace(`/trip/${tripId}`);
        },
      }
    );
  };

  const onReject = () => {
    if (!invitation) return;

    rejectInvite(
      { inviteId: invitation.invitationId },
      {
        onSuccess: () => {
          clearInvitation();
          router.replace('/notifications');
        },
      }
    );
  };

  return {
    invitation,
    inviter: invitation?.inviter,
    tripName,
    isLoading,
    onAccept,
    onReject,
  };
};
