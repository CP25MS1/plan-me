//! PRODUCTION CRITICAL FILE
import { type NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';

const BASE_PATH = '/capstone25/cp25ms1';

export const middleware = async (request: NextRequest) => {
  const { nextUrl, cookies } = request;
  const pathname = nextUrl.pathname;

  const homeUrl = new URL(`${BASE_PATH}/home`, nextUrl.origin);
  const loginUrl = new URL(`${BASE_PATH}/login`, nextUrl.origin);

  // static assets
  if (pathname.startsWith('/_next') || /\.(.*)$/.test(pathname)) {
    return NextResponse.next();
  }

  // /login
  if (pathname === '/login') {
    const token = cookies.get('jwt')?.value;

    if (token && (await verifyJwt(token))) {
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  }

  // /
  if (pathname === '/') {
    return NextResponse.redirect(homeUrl);
  }

  // protected routes
  const token = cookies.get('jwt')?.value;

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  const valid = await verifyJwt(token);

  if (!valid) {
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
