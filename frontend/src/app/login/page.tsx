'use client';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCookie, deleteCookie } from '@/lib/cookie';

import { GoogleCallbackResponse } from '../auth/google/callback';
import { startGoogleLogin } from './actions';
import useCreateUser from './hooks/use-create-user';

const useUserTmp = () => {
  const [userTmp, setUserTmp] = useState<GoogleCallbackResponse | null>(null);
  useEffect(() => {
    const cookie = getCookie('user_tmp');
    if (cookie) {
      try {
        setUserTmp(JSON.parse(cookie));
      } catch {
        console.error('Invalid cookie data');
      }
    }
  }, []);
  return userTmp;
};

const LoginPage = () => {
  const router = useRouter();
  const userTmp = useUserTmp();
  const [showDialog, setShowDialog] = useState(false);
  const createUserMutation = useCreateUser();

  useEffect(() => {
    if (!userTmp) return;
    if (userTmp.registered) {
      router.push('/home');
    } else {
      setShowDialog(true);
    }
  }, [userTmp, router]);

  const handleLogin = useCallback(() => startGoogleLogin(), []);
  const handleCreateAccount = useCallback(() => {
    if (!userTmp) return;
    createUserMutation.mutate(userTmp, {
      onSuccess: () => {
        setShowDialog(false);
        deleteCookie('user_tmp');
        router.push('/home');
      },
      onError: console.error,
    });
  }, [userTmp, createUserMutation, router]);

  //TODO: Dialog component needs to be refactored for standard usage
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4 text-primary">PLAN ME</h1>

      <Button variant="outline" onClick={handleLogin}>
        <Image src="/images/google-icon.png" width={25} height={25} alt="Google" className="mr-2" />
        เข้าสู่ระบบด้วย Google
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>สร้างบัญชีใหม่</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 my-2">
            ไม่พบข้อมูลบัญชี PLAN ME ที่เชื่อมกับ Google ของคุณ
            <br />
            คุณต้องการสร้างบัญชีใหม่หรือไม่
          </p>
          <div className="flex justify-center gap-3 mt-3">
            <Button onClick={handleCreateAccount} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? 'กำลังสร้าง...' : 'สร้างบัญชีใหม่'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
