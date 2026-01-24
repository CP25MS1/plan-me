'use client';

import Image from 'next/image';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FullPageLoading from '@/components/full-page-loading';

import { startGoogleLogin } from './actions';
import useLogin from './hooks/use-login';
import useCreateUser from './hooks/use-create-user';

const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showDialog, setShowDialog] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const { mutate, isPending: createPending } = useCreateUser();
  const login = useLogin(searchParams.get('code') || '');
  const { isSuccess: loginSuccess, data: userData } = login;

  const handleLogin = useCallback(() => startGoogleLogin(), []);
  const handleCreateAccount = useCallback(() => {
    if (!loginSuccess) return;
    mutate(userData, {
      onSuccess: () => {
        setIsNavigating(false);
        router.push('/home');
      },
      onError: console.error,
    });
  }, [userData, loginSuccess, mutate, router]);

  useEffect(() => {
    if (!loginSuccess) return;

    if (userData.registered) {
      setIsNavigating(true);
      router.push('/home');
    } else {
      setShowDialog(true);
    }
  }, [loginSuccess, userData, router]);

  if (login.isFetching || createPending || isNavigating) {
    return <FullPageLoading />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4 text-primary">PLAN ME</h1>

      <Button variant="outline" onClick={handleLogin}>
        <Image
          src="/capstone25/cp25ms1/images/google-icon.png"
          width={25}
          height={25}
          alt="Google"
          className="mr-2"
        />
        เข้าสู่ระบบด้วย Google
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          className="max-w-sm text-center"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="sm:text-center">
            <DialogTitle className="sm:text-xl">สร้างบัญชีใหม่</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 text-sm sm:text-lg text-gray-600 my-2">
            <p>ไม่พบข้อมูลบัญชี PLAN ME ที่เชื่อมกับ Google ของคุณ</p>
            <p>คุณต้องการสร้างบัญชีใหม่หรือไม่</p>
          </div>
          <div className="flex justify-center gap-3 mt-2">
            <Button onClick={handleCreateAccount} disabled={createPending}>
              {createPending ? 'กำลังสร้าง...' : 'สร้างบัญชีใหม่'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={<FullPageLoading />}>
      <LoginContent />
    </Suspense>
  );
};

export default LoginPage;
