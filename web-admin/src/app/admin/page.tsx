'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.communities?.length) {
      const communityId = user.communities[0]._id;
      router.push(`/admin/community/${communityId}/members`);
    }
  }, [user, router]);

  return null;
}
