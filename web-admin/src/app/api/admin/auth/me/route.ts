import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/admin-client';
import { respondToAuthError } from '@/lib/api/route-error';

interface CommunityRef {
  _id: string;
  name: string;
}

/**
 * Resolves the real logged-in admin from their session token:
 *  - super_admin  → sees every community
 *  - community_admin → sees only the communities on their record
 * The UI (switcher, sidebar, index redirect) scopes itself from this list.
 */
export async function GET() {
  try {
    const client = await getAdminClient();

    const { data: meData } = await client.get('/auth/me');
    const me = meData.user;
    const role: string = me?.role ?? 'member';
    const myCommunityIds: string[] = (me?.communityIds ?? []).map((c: unknown) =>
      typeof c === 'string' ? c : (c as { _id?: string })?._id ?? String(c),
    );

    const { data: listData } = await client.get('/communities');
    const all: CommunityRef[] = listData.communities ?? [];

    const communities =
      role === 'super_admin' ? all : all.filter((c) => myCommunityIds.includes(c._id));

    return NextResponse.json({
      success: true,
      user: {
        _id: me?._id,
        firstName: me?.firstName ?? 'Admin',
        lastName: me?.lastName ?? '',
        fullName: [me?.firstName, me?.lastName].filter(Boolean).join(' ') || 'Admin',
        role,
        profilePicture: me?.profilePicture,
        communities,
      },
    });
  } catch (error) {
    return respondToAuthError(error, 'Auth failed');
  }
}
