import { NextResponse } from 'next/server';
import { clearMemberSessionCookie } from '@/lib/auth/member-session';

export async function POST() {
  await clearMemberSessionCookie();
  return NextResponse.json({ success: true });
}
