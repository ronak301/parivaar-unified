import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'parivaar_admin_session';

export function middleware(request: NextRequest) {
  // Auth disabled for development — direct access allowed
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
