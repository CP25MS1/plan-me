"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { getCookie, setCookie } from "@/lib/cookie";
import { startGoogleLogin } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const userTmp = getCookie("user_tmp");
    if (userTmp) {
      try {
        const data = JSON.parse(userTmp);
        if (data.registered) {
          router.push("/home");
        } else {
          setShowDialog(true);
        }
      } catch (err) {
        console.error("Invalid cookie data", err);
      }
    }
  }, [router]);

  const handleLogin = () => {
    startGoogleLogin();
  };

  const handleCreateAccount = async () => {
    const userTmp = getCookie("user_tmp");
    if (!userTmp) return;

    try {
      const data = JSON.parse(userTmp);

      const payload = {
        username: data.username,
        email: data.email,
        idp: data.idp,
        idpId: data.idpId,
        profilePicUrl: data.profilePicUrl,
      };

      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updatedUser = { ...data, registered: true };
        setCookie("user_tmp", JSON.stringify(updatedUser), { path: "/" });

        router.push("/home");
      } else {
        console.error("Failed to create account");
      }
    } catch (err) {
      console.error("Invalid user data", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4 text-primary">PLAN ME</h1>

      <Button variant="outline" onClick={handleLogin}>
        <Image
          alt="Google"
          src="/images/google-icon.png"
          width={25}
          height={25}
          className="mr-2"
        />
        เข้าสู่ระบบด้วย Google
      </Button>

      {showDialog && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent
            className="max-w-sm text-center"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>สร้างบัญชีใหม่</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 my-2">
              ไม่พบข้อมูลบัญชี PLAN ME ที่เชื่อมกับ Google ของคุณ
              <br />
              คุณต้องการสร้างบัญชีใหม่หรือไม่
            </p>
            <div className="flex justify-center gap-3 mt-3">
              <Button onClick={handleCreateAccount}>สร้างบัญชีใหม่</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
