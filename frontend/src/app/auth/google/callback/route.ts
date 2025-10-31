import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code)
    return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const res = await fetch(
    `${process.env.BACKEND_URL}/auth/google/callback?code=${code}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await res.json();
  // const data = {
  //   registered: true,
  //   username: "PUTTINAT LERTWECH",
  //   email: "puttinat.lert@mail.kmutt.ac.th",
  //   idp: "GG",
  //   idpId: "104333330352182786904",
  //   profilePicUrl:
  //     "https://lh3.googleusercontent.com/a/ACg8ocJB9-4Dwn-C6v5cSzXbdV4Vsoi06B3gB12lkU19qYirn9mSWQ=s96-c",
  // };

  const redirectUrl = data.registered
    ? `${process.env.FRONTEND_URL}/home`
    : `${process.env.FRONTEND_URL}/login`;

  const response = NextResponse.redirect(redirectUrl);

  // เซ็ต cookie user_tmp สำหรับหน้า login (หรือใช้ใน /home ก็ได้)
  response.cookies.set("user_tmp", JSON.stringify(data), {
    httpOnly: false,
    path: "/",
    maxAge: 3600,
  });

  console.log(data);

  return response;
}
