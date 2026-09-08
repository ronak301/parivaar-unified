'use client';

import { useEffect, useState } from 'react';
import {
  Briefcase,
  Calendar,
  Globe,
  GraduationCap,
  Heart,
  Home,
  IdCard,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  Tag,
  Trophy,
  Users,
  FileText,
  Droplets,
  ShieldCheck,
  Building2,
  AtSign,
  Link2,
  type LucideIcon,
} from 'lucide-react';
import type { Business } from '@parivaar/shared';
import { Gender, BusinessTypes } from '@parivaar/shared';
import { TONE_CLASS, type Tone } from '@/lib/member/theme';
import { DetailRowsSkeleton } from '@/components/member/skeleton';
import type { UserData } from '@/components/admin/member-detail-types';
import { formatDate } from '@/lib/utils';

interface Row {
  icon: LucideIcon;
  label: string;
  value?: string;
  tone: Tone;
  href?: string;
}

function DetailRow({ icon: Icon, label, value, tone, href }: Row) {
  const content = (
    <div className="flex items-start gap-3 py-3.5">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${TONE_CLASS[tone]}`}>
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs text-m-ink-2">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-m-ink">{value}</p>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-m-surface-2/60">
        {content}
      </a>
    );
  }
  return content;
}

function personalRows(user: UserData): Row[] {
  const address = [
    user.address?.fullAddress,
    user.address?.locality,
    user.address?.city,
    user.address?.district,
    user.address?.state,
    user.address?.pincode,
  ]
    .filter(Boolean)
    .join(', ');
  return [
    { icon: Phone, label: 'Phone', value: user.phone, tone: 'emerald' },
    { icon: Mail, label: 'Email', value: user.email, tone: 'sky' },
    { icon: Users, label: 'Gender', value: Gender.find((g) => g.id === user.gender)?.label ?? user.gender, tone: 'indigo' },
    { icon: Calendar, label: 'Date of birth', value: formatDate(user.dob), tone: 'emerald' },
    { icon: Droplets, label: 'Blood group', value: user.bloodGroup, tone: 'rose' },
    { icon: Calendar, label: 'Wedding date', value: formatDate(user.weddingDate), tone: 'rose' },
    { icon: GraduationCap, label: 'Education', value: user.education, tone: 'amber' },
    { icon: IdCard, label: 'Special education', value: user.specialEducation, tone: 'amber' },
    { icon: Home, label: 'Address', value: address, tone: 'emerald' },
    { icon: MapPin, label: 'Native place', value: user.nativePlace, tone: 'violet' },
    { icon: MapPin, label: 'Native district', value: user.nativeDistrict, tone: 'violet' },
    { icon: Heart, label: 'Nanihaal gotra', value: user.nanihaal, tone: 'rose' },
    { icon: Sparkles, label: 'Hobbies', value: user.hobbies, tone: 'sky' },
    { icon: Trophy, label: 'Achievements', value: user.achievements, tone: 'amber' },
    { icon: ShieldCheck, label: 'Aadhaar', value: user.aadharLast4 ? `•••• •••• ${user.aadharLast4}` : undefined, tone: 'teal' },
    {
      icon: Building2,
      label: 'Communities',
      value: user.communityIds?.map((c) => c.name).join(', '),
      tone: 'indigo',
    },
  ];
}

function businessRows(business: Business): Row[] {
  return [
    { icon: Briefcase, label: 'Business name', value: business.name, tone: 'indigo' },
    {
      icon: Tag,
      label: 'Category',
      value: BusinessTypes.find((bt) => bt.id === business.category)?.label ?? business.category,
      tone: 'violet',
    },
    { icon: Phone, label: 'Phone', value: business.phone, tone: 'emerald', href: business.phone ? `tel:${business.phone}` : undefined },
    { icon: Globe, label: 'Website', value: business.website, tone: 'sky', href: business.website },
    { icon: MapPin, label: 'Address', value: business.address, tone: 'rose' },
    { icon: MapPin, label: 'Google Maps', value: business.googleMapsLink ? 'Open in Maps' : undefined, tone: 'emerald', href: business.googleMapsLink },
    { icon: AtSign, label: 'Instagram', value: business.instagramProfile, tone: 'pink', href: business.instagramProfile },
    { icon: Link2, label: 'LinkedIn', value: business.linkedinProfile, tone: 'sky', href: business.linkedinProfile },
    { icon: FileText, label: 'Description', value: business.description, tone: 'amber' },
  ];
}

function DetailCard({ rows, emptyText, loading }: { rows: Row[]; emptyText: string; loading?: boolean }) {
  const filled = rows.filter((r) => r.value);
  if (loading) {
    return (
      <div className="m-card px-4">
        <DetailRowsSkeleton count={4} />
      </div>
    );
  }
  if (filled.length === 0) {
    return <div className="m-card px-4 py-10 text-center text-sm text-m-ink-2">{emptyText}</div>;
  }
  // Two columns on wide screens, each column its own divided list.
  const mid = Math.ceil(filled.length / 2);
  const cols = [filled.slice(0, mid), filled.slice(mid)];
  return (
    <div className="m-card grid px-4 lg:grid-cols-2 lg:gap-x-8">
      {cols.map((col, i) => (
        <div key={i} className={`divide-y divide-m-line ${i === 1 ? 'border-t border-m-line lg:border-t-0' : ''}`}>
          {col.map((r) => (
            <DetailRow key={r.label} {...r} />
          ))}
        </div>
      ))}
    </div>
  );
}

type DetailTab = 'personal' | 'business';

/** Personal / Business details for the admin member page. */
export function MemberDetailTabs({ user }: { user: UserData }) {
  const [tab, setTab] = useState<DetailTab>('personal');
  const [businessState, setBusinessState] = useState<{ forUser: string; business: Business | null } | null>(null);
  const business = businessState?.forUser === user._id ? businessState.business : undefined;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/businesses/owner/${user._id}`)
      .then((res) => (res.ok ? res.json() : { business: null }))
      .then((data) => {
        if (!cancelled) setBusinessState({ forUser: user._id, business: data.business ?? null });
      })
      .catch(() => {
        if (!cancelled) setBusinessState({ forUser: user._id, business: null });
      });
    return () => {
      cancelled = true;
    };
  }, [user._id]);

  const tabs: Array<{ id: DetailTab; label: string; icon: LucideIcon; hint?: string }> = [
    { id: 'personal', label: 'Personal', icon: Users },
    { id: 'business', label: 'Business', icon: Briefcase, hint: business === null ? 'None' : business?.name },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Member details" className="flex w-fit rounded-m-field bg-m-surface-2 p-1">
        {tabs.map(({ id, label, icon: Icon, hint }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-[calc(var(--m-radius-field)-0.25rem)] px-4 py-2 text-sm font-semibold transition-colors ${
                active ? 'bg-m-surface text-m-brand shadow-m-card' : 'text-m-ink-2 hover:text-m-ink'
              }`}
            >
              <Icon className="size-4" />
              {label}
              {hint && <span className="max-w-[10rem] truncate text-xs font-normal text-m-ink-3">{hint}</span>}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {tab === 'personal' ? (
          <DetailCard rows={personalRows(user)} emptyText="No details added yet" />
        ) : (
          <DetailCard
            rows={business ? businessRows(business) : []}
            emptyText="No business added for this member"
            loading={business === undefined}
          />
        )}
      </div>
    </div>
  );
}
