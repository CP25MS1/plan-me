import { Suspense } from 'react';
import InvitationByCodeClient from './invitation-by-code-client';

export default function InvitationsPage() {
  return (
    <Suspense fallback={null}>
      <InvitationByCodeClient />
    </Suspense>
  );
}
