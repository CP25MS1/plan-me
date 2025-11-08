import { NextResponse, type NextRequest } from 'next/server';

import { verifyJwt } from '@/lib/auth';

export const middleware = async (request: NextRequest) => {
  const { nextUrl: url, cookies } = request;
  const pathname = url.pathname;
  const homeUrl = new URL('/home', request.url);

  if (pathname === '/') {
    return NextResponse.redirect(homeUrl);
  }

  if (
    pathname.startsWith('/_next') ||
    new RegExp(/\.(.*)$/).exec(pathname) // static asset
  ) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.match(/\.(.*)$/) // static asset
  ) {
    return NextResponse.next();
  }

  if (pathname === '/login') {
    const token = cookies.get('jwt')?.value;

    if (token && (await verifyJwt(token))) {
      return NextResponse.redirect(homeUrl);
    }

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

  // const payload = await verifyJwt(token)

  return NextResponse.next();
};

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/google/callback).*)'],
};
