'use client';

// import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getUserFromToken } from '@/lib/auth-client';
import useGetProfile from './hooks/use-get-profile';
import { useRouter } from 'next/navigation';
import FullPageLoading from '@/components/full-page-loading';

export default function ProfilePage() {
  const router = useRouter();
  const [lang, setLang] = useState<'TH' | 'EN'>('TH');
  const userId = 3;

  useEffect(() => {
    const user = getUserFromToken();
    if (user?.sub) {
    }
  }, []);

  const { data: profileData, isFetching } = useGetProfile(`${userId}` || '');
  const handleToggle = () => {
    setLang(lang === 'TH' ? 'EN' : 'TH');
  };

  if (isFetching) {
    return <FullPageLoading />;
  }

  return (
    <div className="relative flex flex-col items-center px-6 h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      <button
        onClick={handleToggle}
        className="absolute top-4 right-4 flex items-center rounded-full shadow-sm px-2 py-1.5"
        style={{ backgroundColor: '#D7D8DB' }}
      >
        <div className="relative flex w-16 h-6 items-center justify-between text-xs font-medium transition-all">
          <span
            className={`w-1/2 text-center z-10 transition-colors ${
              lang === 'TH' ? 'text-white' : 'text-gray-700'
            }`}
          >
            TH
          </span>
          <span
            className={`w-1/2 text-center z-10 transition-colors ${
              lang === 'EN' ? 'text-white' : 'text-gray-700'
            }`}
          >
            EN
          </span>
          <span
            className={`absolute top-0 left-0 h-full w-1/2 rounded-full bg-primary transition-transform duration-300 ${
              lang === 'EN' ? 'translate-x-full' : 'translate-x-0'
            }`}
          />
        </div>
      </button>
      <div className="flex flex-col items-center justify-start h-full pt-5">
        <h1 className="text-2xl font-bold text-black mb-8">{profileData?.username || 'User'}</h1>

        <div className="relative w-28 h-28 mb-3">
          <Image
            src={profileData?.profilePicUrl}
            alt="Profile picture"
            fill
            className="rounded-full object-cover border-4 border-primary/30"
          />
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          {profileData?.username || 'User'}
        </h2>
        <p className="text-gray-500 text-sm mb-2">{profileData?.email || '-'}</p>

        {/* <Button
          variant="outline"
          className="w-[300px] border-green-500 text-green-600 bg-transparent hover:bg-green-50"
        >
          ออกจากระบบ
        </Button> */}

        <div className="w-3/4 border-b border-gray-200 my-5" />

        <div className="flex items-center justify-center gap-10 text-center">
          <div>
            <p className="text-sm font-semibold text-gray-800">{profileData?.followers.length}</p>
            <p className="text-sm text-gray-500">ผู้ติดตาม</p>
          </div>
          <div className="h-8 w-[1px] bg-gray-300" />
          <div>
            <p className="text-sm font-semibold text-gray-800">{profileData?.following.length}</p>
            <p className="text-sm text-gray-500">กำลังติดตาม</p>
          </div>
        </div>
      </div>
    </div>
  );
}
