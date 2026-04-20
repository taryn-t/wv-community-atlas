import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = [
  '/verify-human',
  '/api/verify-human',
  '/favicon.ico',
];

async function hasValidCookie(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.RECAPTCHA_COOKIE_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('human_verified')?.value;

  if (!token || !(await hasValidCookie(token))) {
    const url = request.nextUrl.clone();
    url.pathname = '/verify-human';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/public).*)'],
};