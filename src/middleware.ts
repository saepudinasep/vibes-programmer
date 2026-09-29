import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // protect chat page
  if (pathname.startsWith('/chat') && !token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // protect the setup-profile page
  if (pathname.startsWith('/auth/setup-profile') && !token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (token && (pathname === '/' || pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/chat', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat', '/auth/setup-profile', '/', '/auth/signup'],
};
