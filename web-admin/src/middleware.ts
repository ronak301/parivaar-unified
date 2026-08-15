import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow public form pages
  if (request.nextUrl.pathname.startsWith('/community/')) {
    return NextResponse.next();
  }

  // Check for auth token
  const hasAuth = request.cookies.get('auth_token');

  // Redirect to login if not authenticated and trying to access admin
  if (!hasAuth && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
