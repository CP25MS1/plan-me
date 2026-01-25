//! PRODUCTION CRITICAL FILE
import { type NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';

const detectBasePath = (pathname: string) => {
  const BASE = '/capstone25/cp25ms1';

  if (pathname.startsWith(BASE)) {
    return {
      basePath: BASE,
      pathname: pathname.slice(BASE.length) || '/',
    };
  }

  return {
    basePath: '',
    pathname,
  };
};

export const middleware = async (request: NextRequest) => {
  const { nextUrl, cookies } = request;

  const { basePath, pathname } = detectBasePath(nextUrl.pathname);

  const homeUrl = new URL(`${basePath}/home`, nextUrl.origin);
  const loginUrl = new URL(`${basePath}/login`, nextUrl.origin);

  // /
  if (pathname === '/') {
    return NextResponse.redirect(homeUrl);
  }

  if (
    pathname.startsWith('/_next') ||
    new RegExp(/\.(.*)$/).exec(pathname) // static asset
  ) {
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

  // protected
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
