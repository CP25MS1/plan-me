'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { TruncatedTooltip, EmptyState } from '@/components/atoms';
import { BackButton } from '@/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserListCta, ConfirmUnfollow } from '@/components/profile';

import { useAppSelector } from '@/store';
import { useFollowersWithCta } from './helpers/use-followers-with-cta';

type Props = { defaultTab?: 'followers' | 'following' };

const FollowListClient: React.FC<Props> = ({ defaultTab = 'followers' }) => {
  const router = useRouter();
  const currentUser = useAppSelector((s) => s.profile.currentUser);

  const following = currentUser?.following ?? [];
  const followers = currentUser?.followers ?? [];
  const username = currentUser?.username ?? 'Loading...';

  const followersWithCta = useFollowersWithCta(currentUser);

  const [tab, setTab] = useState<'followers' | 'following'>(defaultTab);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const handleChange = (value: string) => {
    const v = value as 'followers' | 'following';
    setTab(v);
    router.push(`/profile/${v}`);
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="sticky top-0 z-10 bg-background">
        <div className="flex items-center gap-3 pt-2 pb-4">
          <BackButton onBack={() => router.push('/profile')} />
          <h1 className="scroll-m-20 text-lg h-fit font-semibold tracking-tight">
            <TruncatedTooltip text={username} className="max-w-[60vw]!" />
          </h1>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={handleChange}
        variant="underline"
        fullWidth
        className='h-full'
      >
        <TabsList className="bg-background">
          <TabsTrigger value="followers">ผู้ติดตาม {followers.length} คน</TabsTrigger>
          <TabsTrigger value="following">กำลังติดตาม {following.length} คน</TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <TabsContent value="followers" className='h-full'>
            <UserListCta
              users={followersWithCta}
              empty={
                <EmptyState
                  title="ยังไม่มีผู้ติดตาม"
                  description="เมื่อมีคนติดตาม คุณจะเห็นรายชื่อที่นี่"
                />
              }
            />
          </TabsContent>

          <TabsContent value="following" className='h-full'>
            <UserListCta
              users={following.map((u) => ({
                ...u,
                cta: <ConfirmUnfollow key={`unf-${u.id}`} id={u.id} username={u.username} />,
              }))}
              empty={
                <EmptyState
                  title="ยังไม่ได้ติดตามใคร"
                  description="บัญชีที่คุณติดตามจะแสดงในหน้านี้"
                />
              }
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default FollowListClient;
