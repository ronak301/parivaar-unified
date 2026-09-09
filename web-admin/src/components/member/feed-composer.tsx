'use client';

import { useState } from 'react';
import type { Business } from '@parivaar/shared';
import { useMemberAuth } from '@/context/member-auth-context';
import { useCachedFetch } from '@/lib/member/use-cached-fetch';
import { useCommunityFeatures } from '@/lib/member/use-community-features';
import { FeedFab, type FeedAction } from './feed-fab';
import { AddMatrimonialSheet } from './add-matrimonial-sheet';
import { AddEnquirySheet } from './add-enquiry-sheet';
import { AddBusinessSheet } from './add-business-sheet';

export const FEED_SUBMITTED_EVENT = 'parivaar:feed-submitted';

/**
 * FAB + the three "add to feed" sheets. Mounted once in the tabs layout so it
 * shows on every tab; hidden entirely when the community's feed flag is off.
 */
export function FeedComposer() {
  const { user } = useMemberAuth();
  const { feedEnabled } = useCommunityFeatures(user?.communityIds?.[0]);
  const [sheet, setSheet] = useState<FeedAction | null>(null);

  const { data: mineData } = useCachedFetch<{ business: Business | null }>(
    user && feedEnabled ? `business-owner:${user._id}` : null,
    () => fetch(`/api/member/business/owner/${user!._id}`).then((r) => r.json()),
  );

  if (!user || !feedEnabled) return null;

  const close = (o: boolean) => !o && setSheet(null);
  const submitted = () => window.dispatchEvent(new Event(FEED_SUBMITTED_EVENT));

  return (
    <>
      <FeedFab onAction={setSheet} hideBusiness={!!mineData?.business} />
      <AddMatrimonialSheet open={sheet === 'matrimonial'} onOpenChange={close} user={user} onSubmitted={submitted} />
      <AddEnquirySheet open={sheet === 'enquiry'} onOpenChange={close} user={user} onSubmitted={submitted} />
      <AddBusinessSheet open={sheet === 'business'} onOpenChange={close} user={user} onSubmitted={submitted} />
    </>
  );
}
