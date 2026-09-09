'use client';

import Link from 'next/link';
import { Heart, MapPin, MessageCircle, Phone, Search, Store } from 'lucide-react';
import type { FeedItem, FeedPerson } from '@parivaar/shared';
import { telLink, whatsappLink } from '@/lib/member/contact-links';
import { getAvatarColor } from '@/lib/member/avatar-color';
import { ClickableImage } from '@/components/ui/clickable-image';
import { BusinessCard } from './business-card';

function nameOf(p?: FeedPerson) {
  if (!p) return '';
  return p.fullName ?? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
}

function initials(p?: FeedPerson) {
  return `${p?.firstName?.[0] ?? ''}${p?.lastName?.[0] ?? ''}`.toUpperCase();
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function ageOf(dob?: string) {
  if (!dob) return undefined;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return undefined;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 86_400_000));
}

function Avatar({ person, size = 'size-10' }: { person?: FeedPerson; size?: string }) {
  const name = nameOf(person);
  const color = getAvatarColor(name || '?');
  if (person?.profilePicture) {
    return <img src={person.profilePicture} alt="" className={`${size} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-full text-sm font-bold`}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {initials(person) || '?'}
    </span>
  );
}

function Header({
  icon: Icon,
  tone,
  label,
  by,
  when,
}: {
  icon: typeof Heart;
  tone: string;
  label: string;
  by?: string;
  when: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 pt-3">
      <span className={`flex size-6 items-center justify-center rounded-md ${tone}`}>
        <Icon className="size-3.5" />
      </span>
      <span className="text-xs font-bold uppercase tracking-wide text-m-ink-2">{label}</span>
      <span className="flex-1" />
      <span className="truncate text-[11px] text-m-ink-3">
        {by ? `${by} · ` : ''}
        {timeAgo(when)}
      </span>
    </div>
  );
}

function ContactButtons({ phone }: { phone?: string }) {
  const tel = telLink(phone);
  const wa = whatsappLink(phone);
  if (!tel && !wa) return null;
  return (
    <div className="flex items-center gap-1.5">
      {tel && (
        <a href={tel} aria-label="Call" className="flex size-9 items-center justify-center rounded-full bg-m-brand/10 text-m-brand">
          <Phone className="size-4" />
        </a>
      )}
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="flex size-9 items-center justify-center rounded-full bg-m-wa/12 text-m-wa-ink"
        >
          <MessageCircle className="size-4" />
        </a>
      )}
    </div>
  );
}

function MatrimonialCard({ item }: { item: FeedItem }) {
  const m = item.matrimonial!;
  const u = m.user;
  const name = nameOf(u);
  const age = ageOf(u.dob);
  const place = u.address?.city || u.nativePlace;
  const meta = [age ? `${age} yrs` : undefined, u.gender, u.education, place].filter(Boolean).join(' · ');
  const postedBy = nameOf(item.postedBy);
  const postedBySelf = item.postedBy?._id === u._id;

  return (
    <article className="m-card overflow-hidden">
      <Header icon={Heart} tone="bg-m-tone-pink-bg text-m-tone-pink-fg" label="Matrimonial" when={item.createdAt} />
      <div className="flex items-start gap-3 p-4">
        <Link href={`/m/member/${u._id}`} className="shrink-0">
          <Avatar person={u} size="size-14" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/m/member/${u._id}`} className="block truncate text-[15px] font-bold text-m-ink">
            {name}
          </Link>
          {meta && <p className="mt-0.5 text-xs text-m-ink-2">{meta}</p>}
          {postedBy && !postedBySelf && (
            <p className="mt-1 text-[11px] text-m-ink-3">Posted by {postedBy} · contact via family</p>
          )}
          {postedBySelf && <p className="mt-1 text-[11px] text-m-ink-3">Contact via family</p>}
        </div>
        {m.biodataFile && (
          <ClickableImage
            src={m.biodataFile}
            alt={`${name} biodata`}
            className="size-16 shrink-0 rounded-xl object-cover ring-1 ring-m-line"
          />
        )}
      </div>
      <div className="flex items-center justify-between border-t border-m-line px-4 py-2.5">
        <Link href={`/m/member/${u._id}`} className="text-xs font-semibold text-m-brand">
          View profile & family
        </Link>
        {m.biodataFile && (
          <a href={m.biodataFile} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-m-ink-2">
            Open biodata
          </a>
        )}
      </div>
    </article>
  );
}

function EnquiryCard({ item }: { item: FeedItem }) {
  const e = item.enquiry!;
  const name = nameOf(e.user);
  return (
    <article className="m-card overflow-hidden">
      <Header icon={Search} tone="bg-m-tone-amber-bg text-m-tone-amber-fg" label="Looking for" when={item.createdAt} />
      <div className="px-4 pb-3 pt-3">
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-m-ink">{e.requirement}</p>
        {e.place && (
          <p className="mt-2 flex items-center gap-1 text-xs text-m-ink-2">
            <MapPin className="size-3.5" /> {e.place}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 border-t border-m-line px-4 py-2.5">
        <Link href={`/m/member/${e.user._id}`} className="flex min-w-0 flex-1 items-center gap-2">
          <Avatar person={e.user} size="size-8" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-m-ink">{name}</span>
            {e.user.phone && <span className="block text-[11px] text-m-ink-2">{e.user.phone}</span>}
          </span>
        </Link>
        <ContactButtons phone={e.user.phone} />
      </div>
    </article>
  );
}

function BusinessFeedCard({ item }: { item: FeedItem }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <span className="flex size-6 items-center justify-center rounded-md bg-m-tone-teal-bg text-m-tone-teal-fg">
          <Store className="size-3.5" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-m-ink-2">New business</span>
        <span className="flex-1" />
        <span className="text-[11px] text-m-ink-3">{timeAgo(item.createdAt)}</span>
      </div>
      <BusinessCard business={item.business!} />
    </div>
  );
}

export function FeedCard({ item }: { item: FeedItem }) {
  if (item.type === 'matrimonial' && item.matrimonial) return <MatrimonialCard item={item} />;
  if (item.type === 'business_enquiry' && item.enquiry) return <EnquiryCard item={item} />;
  if (item.type === 'business' && item.business) return <BusinessFeedCard item={item} />;
  return null;
}
