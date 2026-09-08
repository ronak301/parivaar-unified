'use client';

import { useParams } from 'next/navigation';
import { Phone, MessageCircle, Globe, MapPin, Link2, Store } from 'lucide-react';
import type { Business } from '@parivaar/shared';
import { BusinessTypes } from '@parivaar/shared';
import { getBusinessContactPhone, telLink, whatsappLink } from '@/lib/member/contact-links';
import { getBusinessCategoryStyle } from '@/lib/member/business-category-style';
import { useCachedFetch } from '@/lib/member/use-cached-fetch';
import { Skeleton } from '@/components/member/skeleton';
import { OwnerStrip } from '@/components/member/business-widgets';
import { PageBanner } from '@/components/member/page-banner';

interface BusinessDetailResponse {
  success: boolean;
  business: Business & { ownerId?: { firstName: string; lastName?: string; fullName?: string; phone?: string } };
}

export default function MemberBusinessDetailPage() {
  const params = useParams<{ id: string }>();

  const { data, loading } = useCachedFetch<BusinessDetailResponse>(
    `business-detail:${params.id}`,
    () => fetch(`/api/member/business/${params.id}`).then((r) => r.json()),
  );

  const business = data?.business ?? null;

  const header = <PageBanner title="Business Profile" showBack compact />;

  if (loading) {
    return (
      <div>
        {header}
        <div className="flex flex-col gap-4 p-4" role="status" aria-label="Loading business">
          <div className="flex items-center gap-3">
            <Skeleton className="size-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div>
        {header}
        <div className="flex flex-col items-center gap-2 py-16">
          <Store className="size-10 text-m-ink-3" />
          <p className="text-sm text-m-ink-2">Business not found</p>
        </div>
      </div>
    );
  }

  const { icon: Icon, color, bg } = getBusinessCategoryStyle(business.category);
  const categoryLabel = BusinessTypes.find((bt) => bt.id === business.category)?.label;
  const contactPhone = getBusinessContactPhone(business);
  const tel = telLink(contactPhone);
  const wa = whatsappLink(contactPhone);

  return (
    <div>
      {header}

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          {business.logo ? (
            <img src={business.logo} alt={business.name} className="size-16 rounded-xl object-cover" />
          ) : (
            <div
              className="flex size-16 items-center justify-center rounded-xl"
              style={{ backgroundColor: bg, color }}
            >
              <Icon className="size-8" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-m-ink">{business.name}</p>
            {categoryLabel && <p className="text-sm text-m-ink-2">{categoryLabel}</p>}
          </div>
        </div>

        <OwnerStrip business={business} />

        <div className="flex gap-2">
          {tel && (
            <a
              href={tel}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-m-brand py-2.5 text-sm font-medium text-m-on-brand"
            >
              <Phone className="size-4" />
              Call
            </a>
          )}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-m-wa/12 py-2.5 text-sm font-medium text-m-wa-ink"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          )}
        </div>

        {business.description && (
          <p className="text-sm text-m-ink">{business.description}</p>
        )}

        <div className="flex flex-col gap-2 text-sm">
          {business.address && (
            <a
              href={business.googleMapsLink || undefined}
              target={business.googleMapsLink ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-m-ink"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-m-ink-2" />
              {business.address}
            </a>
          )}
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-m-ink"
            >
              <Globe className="size-4 shrink-0 text-m-ink-2" />
              {business.website}
            </a>
          )}
          {business.instagramProfile && (
            <a
              href={business.instagramProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-m-ink"
            >
              <Link2 className="size-4 shrink-0 text-m-ink-2" />
              Instagram
            </a>
          )}
          {business.linkedinProfile && (
            <a
              href={business.linkedinProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-m-ink"
            >
              <Link2 className="size-4 shrink-0 text-m-ink-2" />
              LinkedIn
            </a>
          )}
        </div>

        {business.photos && business.photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {business.photos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt={`${business.name} photo ${i + 1}`}
                className="aspect-square rounded-lg object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
