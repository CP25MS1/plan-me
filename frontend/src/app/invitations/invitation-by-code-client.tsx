'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import InvitationActionPage from './invitation-action-page';
import { decodeBase64Json } from '@/lib/base64-json';
import { PublicUserInfo } from '@/api/users';
import { useRespondToInvitation } from '@/app/invitations/use-respond-to-invitation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useTripHeader } from '@/api/trips/hooks';
import { useEffect, useMemo } from 'react';

export type InvitationByCodeParams = {
  tripId: number;
  tripName: string;
  invitationCode: string;
  inviter: PublicUserInfo;
};

const InvitationByCodeClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useSelector((s: RootState) => s.profile.currentUser);
  const ref = searchParams.get('ref');

  const { mutate: respondInvitation } = useRespondToInvitation();

  const decoded = useMemo(() => {
    if (!ref) return null;
    try {
      return decodeBase64Json<InvitationByCodeParams>(ref);
    } catch {
      return null;
    }
  }, [ref]);

  const { data: tripHeader, isSuccess } = useTripHeader(decoded?.tripId ?? 0);

  useEffect(() => {
    if (isSuccess && tripHeader && decoded) {
      router.replace(`/trip/${decoded.tripId}`);
    }
  }, [isSuccess, tripHeader, decoded, router]);

  useEffect(() => {
    if (currentUser && decoded && decoded.inviter.id === currentUser.id) {
      router.push(`/trip/${decoded.tripId}`);
    }
  }, [currentUser, decoded, router]);

  if (!ref || !currentUser || !decoded) return null;

  const { tripId, tripName, invitationCode, inviter } = decoded;

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
};

export default InvitationByCodeClient;
