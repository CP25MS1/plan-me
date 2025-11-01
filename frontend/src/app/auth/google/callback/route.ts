import { NextResponse } from 'next/server';

export interface GoogleCallbackResponse {
  registered: boolean;
  username: string;
  email: string;
  idp: string;
  idpId: string;
  profilePicUrl: string;
}

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

  const res = await fetch(`${process.env.BACKEND_URL}/auth/google/callback?code=${code}`);
  const data = (await res.json()) as GoogleCallbackResponse;
  const registered = data.registered;
  const redirectUrl = `${process.env.FRONTEND_URL}/${registered ? 'home' : 'login'}`;
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set('user_tmp', JSON.stringify(data), {
    httpOnly: false,
    path: '/',
    maxAge: 60,
  });

  return response;
};
