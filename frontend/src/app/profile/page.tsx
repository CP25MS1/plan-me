'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import useGetProfile from './hooks/use-get-profile';
import { useRouter } from 'next/navigation';
import FullPageLoading from '@/components/full-page-loading';
import { LangSwitcher } from '@/components/profile';
import { TruncatedTooltip } from '@/components/atoms';
import { useAppSelector } from '@/store';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setCurrentUser } from '@/store/profile-slice';

export default function ProfilePage() {
  const router = useRouter();
  const currentUser = useAppSelector((s) => s.profile.currentUser);
  const userId = useAppSelector((s) => s.profile.currentUserId ?? 0);
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const { data: profileData, isFetching, isSuccess } = useGetProfile(userId ?? 0);

  useEffect(() => {
    if (isSuccess && profileData) {
      dispatch(setCurrentUser(profileData));
    }
  }, [isSuccess, profileData, dispatch]);

  if (isFetching) {
    return <FullPageLoading />;
  }

  return (
    <div className="relative flex flex-col items-center px-6 h-[calc(100vh-64px)] overflow-hidden ">
      <button className="absolute top-4 right-4 flex items-center rounded-full shadow-sm">
        <div className="relative flex items-center justify-center">
          <LangSwitcher />
        </div>
      </button>

      <div className="flex flex-col items-center justify-start h-full pt-5">
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
          <div
            onClick={() => {
              router.push('/profile/followers');
            }}
          >
            <p className="text-sm font-semibold text-gray-800">{currentUser?.followers.length}</p>
            <p className="text-sm text-gray-500">{t('profile.followers')}</p>
          </div>
          <div className="h-8 w-px bg-gray-300" />
          <div
            onClick={() => {
              router.push('/profile/following');
            }}
          >
            <p className="text-sm font-semibold text-gray-800">{currentUser?.following.length}</p>
            <p className="text-sm text-gray-500">{t('profile.following')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
