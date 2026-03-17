'use client';

import Image from 'next/image';
import Link from 'next/link';
import FullPageLoading from '@/components/full-page-loading';
import { LangSwitcher } from '@/components/profile';
import { useAppSelector } from '@/store';
import { useTranslation } from 'react-i18next';
import { TripList } from '@/app/profile/all-trip/trip-list';
import { useGetAllTrips } from '@/app/profile/all-trip/hooks/use-get-all-trips';
import { useRouter } from 'next/navigation';
import { useGetProfile } from '@/app/profile/hooks';
import { useEffect, useState } from 'react';
import { setCurrentUser } from '@/store/profile-slice';
import { useDispatch } from 'react-redux';

import { LogOut } from 'lucide-react';
import ConfirmDialog from '@/components/common/dialog/confirm-dialog';
import { Typography, IconButton } from '@mui/material';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const currentUser = useAppSelector((s) => s.profile.currentUser);
  const { t } = useTranslation('common');
  const router = useRouter();

  const { data: trips, isLoading, isError } = useGetAllTrips();

  const handleTripClick = (tripId: number) => {
    router.push(`/trip/${tripId}?tab=overview`);
  };

  const { data: fetchedCurrentUser } = useGetProfile(currentUser?.id ?? 0);

  useEffect(() => {
    dispatch(setCurrentUser(fetchedCurrentUser ?? currentUser));
  }, [currentUser, dispatch, fetchedCurrentUser]);

  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  if (!currentUser) {
    return <FullPageLoading />;
  }

  const handleLogout = () => {
    console.log('logout...');
  };

  return (
    <div className="relative flex flex-col px-6 min-h-[calc(100vh-64px)] overflow-y-auto pb-7">
      {' '}
      <div className="absolute top-4 right-4 flex flex-col items-center gap-4 z-10">
        <div className="rounded-full shadow-sm">
          <LangSwitcher />
        </div>

        <IconButton
          onClick={() => setOpenLogoutDialog(true)}
          sx={{
            backgroundColor: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
            alignSelf: 'flex-end',
          }}
        >
          <LogOut size={24} />
        </IconButton>
      </div>
      <div className="flex flex-col items-center pt-5 shrink-0">
        <div className="mb-8 h-7" />

        <div className="relative w-28 h-28 mb-3">
          <Image
            src={currentUser?.profilePicUrl ?? ''}
            alt="Profile picture"
            fill
            className="rounded-full object-cover border-4 border-primary"
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
        <TripList
          t={t}
          trips={trips}
          loading={isLoading}
          error={isError}
          onTripClick={handleTripClick}
          currentUserId={currentUser?.id}
        />
      </div>
      <ConfirmDialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        onConfirm={handleLogout}
        confirmLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        color="error"
        content={<Typography>คุณต้องการออกจากบัญชีนี้ใช่หรือไม่ ?</Typography>}
      />
    </div>
  );
}
