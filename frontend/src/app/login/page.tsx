//! PRODUCTION CRITICAL FILE
'use client';

import Image from 'next/image';
import type { Route } from 'next';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FullPageLoading from '@/components/full-page-loading';

import { startGoogleLogin } from './actions';
import useLogin from './hooks/use-login';
import useCreateUser from './hooks/use-create-user';

const POST_LOGIN_REDIRECT_KEY = 'post-login-redirect-path';
const DEFAULT_REDIRECT_PATH = '/home';

const normalizeRedirectPath = (value: string | null) => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value === '/login') {
    return null;
  }

  return value;
};

const consumePostLoginRedirectPath = () => {
  const stored = normalizeRedirectPath(globalThis.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY));
  globalThis.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  return stored ?? DEFAULT_REDIRECT_PATH;
};

const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showDialog, setShowDialog] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const { mutate, isPending: createPending } = useCreateUser();
  const login = useLogin(searchParams.get('code') || '');
  const { isSuccess: loginSuccess, data: userData } = login;

  useEffect(() => {
    const requestedNextPath = normalizeRedirectPath(searchParams.get('next'));

    if (requestedNextPath) {
      globalThis.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, requestedNextPath);
    }
  }, [searchParams]);

  const handleLogin = useCallback(() => startGoogleLogin(), []);
  const handleCreateAccount = useCallback(() => {
    if (!loginSuccess) return;
    mutate(userData, {
      onSuccess: () => {
        setIsNavigating(false);
        router.push(consumePostLoginRedirectPath() as Route);
      },
      onError: console.error,
    });
  }, [userData, loginSuccess, mutate, router]);

  useEffect(() => {
    if (!loginSuccess) return;

    if (userData.registered) {
      setIsNavigating(true);
      router.push(consumePostLoginRedirectPath() as Route);
    } else {
      setShowDialog(true);
    }
  }, [loginSuccess, userData, router]);

  if (login.isFetching || createPending || isNavigating) {
    return <FullPageLoading />;
  }

  const googleIconImagePath = '/capstone25/cp25ms1/images/google-icon.png';
  // const googleIconImagePath = '/images/google-icon.png';

  const planMeLogoPath = '/capstone25/cp25ms1/images/plan-me-logo.png';
  // const planMeLogoPath = '/images/plan-me-logo.png';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#a8e6c8]">
      <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-xl px-8 py-10 flex flex-col items-center w-[320px]">
        <Image src={planMeLogoPath} alt="PlanMe Logo" width={80} height={80} className="mb-4" />

        <h1 className="text-xl font-bold text-[#1FA968] mb-2">PLAN ME</h1>

        <p className="text-sm text-gray-600 mb-4 text-center">ทริปต่อไปของคุณกำลังรออยู่</p>

        <Button
          variant="outline"
          onClick={handleLogin}
          className="flex items-center justify-center gap-2 rounded-xl border-gray-300"
        >
          <Image src={googleIconImagePath} width={22} height={22} alt="Google" />
          เข้าสู่ระบบด้วย Google
        </Button>
      </div>

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
