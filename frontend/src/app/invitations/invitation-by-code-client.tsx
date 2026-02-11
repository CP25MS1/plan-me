'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import InvitationActionPage from './invitation-action-page';
import { decodeBase64Json } from '@/lib/base64-json';
import { PublicUserInfo } from '@/api/users';
import { useRespondToInvitation } from '@/app/invitations/use-respond-to-invitation';

export type InvitationByCodeParams = {
  tripId: number;
  tripName: string;
  invitationCode: string;
  inviter: PublicUserInfo;
};

const InvitationByCodeClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  const { mutate: respondInvitation } = useRespondToInvitation();

  if (!ref) return null;

  const { tripId, tripName, invitationCode, inviter } =
    decodeBase64Json<InvitationByCodeParams>(ref);

  const handleAccept = () => {
    respondInvitation(
      { tripId, request: { status: 'ACCEPTED', invitationCode } },
      { onSuccess: () => router.replace(`/trip/${tripId}`) }
    );
  };

  const handleReject = () => {
    respondInvitation(
      { tripId, request: { status: 'REJECTED', invitationCode } },
      { onSuccess: () => router.replace('/home') }
    );
  };

  return (
    <InvitationActionPage
      tripName={tripName}
      inviter={inviter}
      onAccept={handleAccept}
      onReject={handleReject}
      onBack={() => router.push('/home')}
    />
  );
}

export default InvitationByCodeClient;
