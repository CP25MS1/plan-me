'use server';

import { redirect } from 'next/navigation';

export async function startGoogleLogin() {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
  const SCOPE = ['openid', 'email', 'profile'].join(' ');

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  });

  redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
