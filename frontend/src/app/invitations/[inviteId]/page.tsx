'use client'

import InvitationActionPage from '@/app/invitations/invitation-action-page';
import { useDirectInvitationAction } from '../use-direct-invitation-action';

const DirectInvitationActionPage = () => {
  const { inviter, tripName, isLoading, onAccept, onReject } = useDirectInvitationAction();
  return (
    <InvitationActionPage
      inviter={inviter}
      tripName={tripName}
      isLoading={isLoading}
      onAccept={onAccept}
      onReject={onReject}
    />
  );
};

export default DirectInvitationActionPage;
