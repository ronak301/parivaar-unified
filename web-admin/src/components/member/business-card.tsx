import Link from 'next/link';
import { ChevronRight, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { Business } from '@parivaar/shared';
import { BusinessTypes } from '@parivaar/shared';
import { getBusinessCategoryStyle } from '@/lib/member/business-category-style';
import { getBusinessContactPhone, telLink, whatsappLink } from '@/lib/member/contact-links';

type PopulatedOwner = { firstName?: string; lastName?: string; fullName?: string };

export function getOwnerName(business: Business): string | undefined {
  const owner = business.ownerId as unknown as PopulatedOwner | string | undefined;
  if (!owner || typeof owner !== 'object') return undefined;
  const name = owner.fullName ?? `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim();
  return name || undefined;
}

export function getCategoryLabel(categoryId?: string): string | undefined {
  if (!categoryId) return undefined;
  return BusinessTypes.find((bt) => bt.id === categoryId)?.label ?? categoryId;
}

/** First comma-separated chunk of the address, e.g. the area or city. */
function shortAddress(address?: string) {
  if (!address) return undefined;
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts.slice(-2).join(', ') : parts[0];
}

interface BusinessCardProps {
  business: Business;
  /** Small caption explaining why this result matched (search only). */
  matchHint?: string;
}

export function BusinessCard({ business, matchHint }: BusinessCardProps) {
  const { icon: Icon, color, bg } = getBusinessCategoryStyle(business.category);
  const categoryLabel = getCategoryLabel(business.category);
  const ownerName = getOwnerName(business);
  const area = shortAddress(business.address);
  const contactPhone = getBusinessContactPhone(business);
  const tel = telLink(contactPhone);
  const wa = whatsappLink(contactPhone);

  return (
    // Stretched-link card: whole surface navigates, action buttons stay clickable.
    <div className="m-card relative overflow-hidden transition-shadow active:shadow-none">
      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: color }} aria-hidden />
      <Link
        href={`/m/business/${business._id}`}
        aria-label={`Open ${business.name ?? 'business'}`}
        className="absolute inset-0 rounded-m-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m-brand/40"
      />

      <div className="flex items-start gap-3 p-4 pl-5">
        {business.logo ? (
          <img src={business.logo} alt="" className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-m-line" />
        ) : (
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: bg, color }}
          >
            <Icon className="size-6" strokeWidth={1.75} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-[15px] font-bold leading-tight text-m-ink">{business.name}</p>
            <ChevronRight className="mt-0.5 size-4 shrink-0 text-m-ink-3" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {categoryLabel && (
              <span
                className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: bg, color }}
              >
                {categoryLabel}
              </span>
            )}
            {ownerName && <span className="text-xs text-m-ink-2">by {ownerName}</span>}
          </div>
          {business.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-m-ink-2">{business.description}</p>
          )}
          {matchHint && <p className="mt-1 text-[11px] italic text-m-brand/80">{matchHint}</p>}

          <div className="mt-2.5 flex items-center gap-2">
            {area && (
              <span className="flex min-w-0 items-center gap-1 text-xs text-m-ink-2">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{area}</span>
              </span>
            )}
            <div className="flex-1" />
            <div className="relative z-10 flex items-center gap-1.5">
              {tel && (
                <a
                  href={tel}
                  aria-label="Call"
                  className="flex size-8 items-center justify-center rounded-full bg-m-brand/10 text-m-brand"
                >
                  <Phone className="size-3.5" />
                </a>
              )}
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex size-8 items-center justify-center rounded-full bg-m-wa/12 text-m-wa-ink"
                >
                  <MessageCircle className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
