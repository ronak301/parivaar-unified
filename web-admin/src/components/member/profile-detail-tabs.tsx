'use client';

import { useEffect, useState } from 'react';
import {
  Briefcase,
  Calendar,
  ClipboardList,
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
  type LucideIcon,
} from 'lucide-react';
import type { User, Business } from '@parivaar/shared';
import { Gender, BusinessTypes } from '@parivaar/shared';
import { DetailRowsSkeleton } from './skeleton';
import { TONE_CLASS, type Tone } from '@/lib/member/theme';
import { formatDate } from '@/lib/utils';

interface Row {
  icon: LucideIcon;
  label: string;
  value?: string;
  tone: Tone;
  href?: string;
}

function DetailRow({ icon: Icon, label, value, tone, href }: Row) {
  if (!value) return null;
  const content = (
    <div className="flex items-start gap-3 py-3.5">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${TONE_CLASS[tone]}`}>
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-m-ink-2">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-m-ink">{value}</p>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block active:bg-m-surface-2">
        {content}
      </a>
    );
  }
  return content;
}

function DetailCard({
  rows,
  emptyText,
  loading = false,
}: {
  rows: Row[];
  emptyText: string;
  loading?: boolean;
}) {
  const filled = rows.filter((r) => r.value);
  return (
    <div className="m-card px-4">
      {loading ? (
        <DetailRowsSkeleton count={4} />
      ) : filled.length === 0 ? (
        <p className="py-6 text-center text-sm text-m-ink-2">{emptyText}</p>
      ) : (
        <div className="divide-y divide-m-line">
          {filled.map((r) => (
            <DetailRow key={r.label} {...r} />
          ))}
        </div>
      )}
    </div>
  );
}

function usePersonalRows(user: User): Row[] {
  const address = [user.address?.fullAddress, user.address?.city].filter(Boolean).join(', ');
  return [
    { icon: GraduationCap, label: 'Education', value: user.education, tone: 'amber' },
    { icon: IdCard, label: 'Special Education', value: user.specialEducation, tone: 'amber' },
    { icon: Users, label: 'Gender', value: Gender.find((g) => g.id === user.gender)?.label, tone: 'indigo' },
    { icon: Mail, label: 'Email', value: user.email, tone: 'sky' },
    { icon: Calendar, label: 'Wedding Date', value: formatDate(user.weddingDate), tone: 'rose' },
    { icon: Home, label: 'Address', value: address, tone: 'emerald' },
    { icon: MapPin, label: 'Locality', value: user.address?.locality, tone: 'rose' },
    { icon: MapPin, label: 'Native Place', value: user.nativePlace, tone: 'violet' },
    { icon: MapPin, label: 'Native District', value: user.nativeDistrict, tone: 'violet' },
    { icon: Heart, label: 'Nanihaal', value: user.nanihaal, tone: 'rose' },
    { icon: Sparkles, label: 'Hobbies', value: user.hobbies, tone: 'sky' },
    { icon: Trophy, label: 'Achievements', value: user.achievements, tone: 'amber' },
  ];
}

function businessRows(business: Business): Row[] {
  return [
    { icon: Briefcase, label: 'Business Name', value: business.name, tone: 'indigo' },
    {
      icon: Tag,
      label: 'Category',
      value: BusinessTypes.find((bt) => bt.id === business.category)?.label ?? business.category,
      tone: 'violet',
    },
    { icon: Phone, label: 'Phone', value: business.phone, tone: 'emerald', href: business.phone ? `tel:${business.phone}` : undefined },
    { icon: Globe, label: 'Website', value: business.website, tone: 'sky', href: business.website },
    { icon: MapPin, label: 'Address', value: business.address, tone: 'rose' },
    { icon: FileText, label: 'Description', value: business.description, tone: 'amber' },
  ];
}

type DetailTab = 'personal' | 'business';

/** Personal / Business details as a segmented switcher, one card at a time. */
export function ProfileDetailTabs({ user }: { user: User }) {
  const [tab, setTab] = useState<DetailTab>('personal');
  const [business, setBusiness] = useState<Business | null | undefined>(undefined);
  const personalRows = usePersonalRows(user);

  useEffect(() => {
    fetch(`/api/member/business/owner/${user._id}`)
      .then((res) => res.json())
      .then((data) => setBusiness(data.business ?? null))
      .catch(() => setBusiness(null));
  }, [user._id]);

  const tabs: Array<{ id: DetailTab; label: string; icon: LucideIcon }> = [
    { id: 'personal', label: 'Personal', icon: Users },
    { id: 'business', label: 'Business', icon: Briefcase },
  ];

  return (
    <section className="px-4 pt-6">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="flex size-7 items-center justify-center rounded-lg bg-m-brand/10 text-m-brand">
          <ClipboardList className="size-4" />
        </span>
        <h2 className="text-[15px] font-bold text-m-ink">Details</h2>
      </div>

      <div role="tablist" aria-label="Profile details" className="mb-3 flex rounded-m-field bg-m-surface-2 p-1 ring-1 ring-m-line">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-[calc(var(--m-radius-field)-0.25rem)] py-2 text-sm font-semibold transition-colors ${
                active ? 'bg-m-surface text-m-brand shadow-m-card' : 'text-m-ink-2'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {tab === 'personal' ? (
          <DetailCard rows={personalRows} emptyText="No details added yet" />
        ) : (
          <DetailCard
            rows={business ? businessRows(business) : []}
            emptyText="No business added yet"
            loading={business === undefined}
          />
        )}
      </div>
    </section>
  );
}
