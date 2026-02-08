'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import InviteByLink from './invite-by-link';
import InviteByFriends from './invite-by-friends';

export default function InviteTabs({ tripId }: { tripId: number }) {
  return (
    <Tabs defaultValue="link" variant="underline" fullWidth className="mt-4">
      <TabsList>
        <TabsTrigger value="link">ผ่านลิงก์</TabsTrigger>
        <TabsTrigger value="friends">ผ่านรายชื่อเพื่อน</TabsTrigger>
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
