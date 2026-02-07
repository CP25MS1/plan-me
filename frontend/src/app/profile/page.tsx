'use client';

import Image from 'next/image';
import Link from 'next/link';
import FullPageLoading from '@/components/full-page-loading';
import { LangSwitcher } from '@/components/profile';
import { TruncatedTooltip } from '@/components/atoms';
import { useAppSelector } from '@/store';
import { useTranslation } from 'react-i18next';
import { TripList } from '@/app/profile/all-trip/trip-list';
import { useGetAllTrips } from '@/app/profile/all-trip/hooks/use-get-all-trips';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const currentUser = useAppSelector((s) => s.profile.currentUser);
  const { t } = useTranslation('common');
  const router = useRouter();

  const { data: trips, isLoading, isError } = useGetAllTrips();

  const handleTripClick = (tripId: number) => {
    router.push(`/trip/${tripId}?tab=overview`);
  };

  if (!currentUser) {
    return <FullPageLoading />;
  }

  return (
    <div className="relative flex flex-col px-6 min-h-[calc(100vh-64px)] overflow-y-auto pb-7">
      {' '}
      <button className="absolute top-4 right-4 flex items-center rounded-full shadow-sm z-10">
        <LangSwitcher />
      </button>
      <div className="flex flex-col items-center pt-5 shrink-0">
        <h1 className="text-xl font-semibold text-black mb-8">
          <TruncatedTooltip className="max-w-1/2" text={currentUser?.username || 'User'} />
        </h1>

        <div className="relative w-28 h-28 mb-3">
          <Image
            src={currentUser?.profilePicUrl ?? ''}
            alt="Profile picture"
            fill
            className="rounded-full object-cover border-4 border-primary/30"
          />
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          {currentUser?.username || 'User'}
        </h2>

        <p className="text-gray-500 text-sm mb-2">{currentUser?.email || '-'}</p>

        <div className="w-3/4 border-b border-gray-200 my-5" />

        <div className="flex items-center justify-center gap-10 text-center">
          <Link href="/profile/followers">
            <p className="text-sm font-semibold text-gray-800">{currentUser?.followers.length}</p>
            <p className="text-sm text-gray-500">{t('profile.followers')}</p>
          </Link>

          <div className="h-8 w-px bg-gray-300" />

          <Link href="/profile/following">
            <p className="text-sm font-semibold text-gray-800">{currentUser?.following.length}</p>
            <p className="text-sm text-gray-500">{t('profile.following')}</p>
          </Link>
        </div>
      </div>
      <div className="w-full pb-6">
        <TripList trips={trips} loading={isLoading} error={isError} onTripClick={handleTripClick} />
      </div>
    </div>
  );
}
