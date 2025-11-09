'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { TruncatedTooltip, EmptyState } from '@/components/atoms';
import { BackButton } from '@/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserListCta, ConfirmUnfollow } from '@/components/profile';

import { useAppSelector } from '@/store';
import { useFollowersWithCta } from './helpers/use-followers-with-cta';

import { useTranslation } from 'react-i18next';

type Props = { defaultTab?: 'followers' | 'following' };

const FollowListClient: React.FC<Props> = ({ defaultTab = 'followers' }) => {
  const router = useRouter();
  const currentUser = useAppSelector((s) => s.profile.currentUser);
  const { t } = useTranslation('common');

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
  };

  return (
    <div className="flex flex-col w-full h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background">
        <div className="flex items-center gap-3 pt-2 pb-4">
          <Link href="/profile">
            <BackButton onBack={() => router.push('/profile')} />
          </Link>
          <h1 className="scroll-m-20 text-lg h-fit font-semibold tracking-tight">
            <TruncatedTooltip text={username} className="max-w-[60vw]!" />
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={handleChange}
        variant="underline"
        fullWidth
        className="h-full"
      >
        <TabsList className="bg-background">
          <TabsTrigger value="followers">
            <Link href="/profile/followers">
              {t('profile.followers_count', { count: followers.length })}
            </Link>
          </TabsTrigger>

          <TabsTrigger value="following">
            <Link href="/profile/following">
              {t('profile.following_count', { count: following.length })}
            </Link>
          </TabsTrigger>
        </TabsList>

        {/* Followers */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <TabsContent value="followers" className="h-full">
            <UserListCta
              users={followersWithCta}
              empty={
                <EmptyState
                  title={t('profile.followers_empty_title')}
                  description={t('profile.followers_empty_description')}
                />
              }
            />
          </TabsContent>

          {/* Following */}
          <TabsContent value="following" className="h-full">
            <UserListCta
              users={following.map((u) => ({
                ...u,
                cta: <ConfirmUnfollow key={`unf-${u.id}`} id={u.id} username={u.username} />,
              }))}
              empty={
                <EmptyState
                  title={t('profile.following_empty_title')}
                  description={t('profile.following_empty_description')}
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
