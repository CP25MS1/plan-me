'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';

import InviteByLink from './invite-by-link';
import InviteByFriends from './invite-by-friends';

export default function InviteTabs({ tripId }: { tripId: number }) {
  const { t } = useTranslation('trip_overview');

  return (
    <Tabs defaultValue="link" variant="underline" fullWidth className="mt-4">
      <TabsList>
        <TabsTrigger value="link">{t('inviteDialog.tabs.link')}</TabsTrigger>
        <TabsTrigger value="friends">{t('inviteDialog.tabs.friends')}</TabsTrigger>
      </TabsList>

      <div className="flex-1 mt-4">
        <TabsContent value="link">
          <InviteByLink tripId={tripId} />
        </TabsContent>

        <TabsContent value="friends">
          <InviteByFriends tripId={tripId} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
