import { NextResponse, type NextRequest } from 'next/server';

import { verifyJwt } from '@/lib/auth';

export const middleware = async (request: NextRequest) => {
  const { nextUrl: url, cookies } = request;
  const pathname = url.pathname;

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.match(/\.(.*)$/) // static asset
  ) {
    return NextResponse.next();
  }

  const token = cookies.get('jwt')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const valid = await verifyJwt(token);

  if (!valid) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login') {
    const homeUrl = new URL('/home', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|auth/google/callback).*)'],
};
