'use client';

import Link from 'next/link';
import { ChevronRight, Crown, Phone, Users2 } from 'lucide-react';
import type { User } from '@parivaar/shared';
import { useCachedFetch } from '@/lib/member/use-cached-fetch';
import { getAvatarColor } from '@/lib/member/avatar-color';
import { telLink } from '@/lib/member/contact-links';
import { Skeleton } from './skeleton';

export interface FamilyMember {
  _id: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  profilePicture?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  isFamilyHead?: boolean;
  isAlive?: boolean;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  childrenIds?: string[];
  siblingIds?: string[];
  communityIds?: string[];
}

/** The person whose family is being shown. Relation labels are computed relative to them. */
export type FamilyAnchor = Pick<
  FamilyMember,
  '_id' | 'gender' | 'fatherId' | 'motherId' | 'spouseId' | 'childrenIds' | 'siblingIds'
>;

interface FamilyTreeResponse {
  success: boolean;
  family: { _id: string; headId: string };
  members: FamilyMember[];
}

function initials(m: FamilyMember) {
  return `${m.firstName?.[0] ?? ''}${m.lastName?.[0] ?? ''}`.toUpperCase();
}

function displayName(m: FamilyMember) {
  return m.fullName ?? `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim();
}

function isFemale(gender?: string) {
  return (gender ?? '').toLowerCase() === 'female';
}

/** How `other` is related to `anchor`, using whichever side of the link is recorded. */
export function relationLabel(anchor: FamilyAnchor, other: FamilyMember): string | undefined {
  const id = other._id;
  if (anchor.fatherId === id) return 'Father';
  if (anchor.motherId === id) return 'Mother';
  if (anchor.spouseId === id || other.spouseId === anchor._id) return isFemale(other.gender) ? 'Wife' : 'Husband';
  if (anchor.childrenIds?.includes(id) || other.fatherId === anchor._id || other.motherId === anchor._id) {
    return isFemale(other.gender) ? 'Daughter' : 'Son';
  }
  if (other.childrenIds?.includes(anchor._id)) return isFemale(other.gender) ? 'Mother' : 'Father';
  if (anchor.siblingIds?.includes(id) || other.siblingIds?.includes(anchor._id)) {
    return isFemale(other.gender) ? 'Sister' : 'Brother';
  }
  return undefined;
}

function FamilyRow({
  member,
  isHead,
  isViewed,
  isSelf,
  relation,
  href,
}: {
  member: FamilyMember;
  isHead: boolean;
  isViewed: boolean;
  isSelf: boolean;
  relation?: string;
  href: string | null;
}) {
  const name = displayName(member);
  const color = getAvatarColor(name);
  const tel = telLink(member.phone);

  const role = isViewed
    ? isSelf
      ? 'You'
      : 'This profile'
    : [relation ?? (isHead ? 'Family head' : 'Member'), isSelf ? 'you' : null].filter(Boolean).join(' · ');

  return (
    <div
      className={`relative flex items-center gap-3 py-3 ${
        isViewed ? '-mx-2 rounded-xl bg-m-brand/5 px-2 ring-1 ring-m-brand/20' : ''
      }`}
    >
      {href && (
        <Link
          href={href}
          aria-label={`View ${name}'s profile`}
          className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m-brand/40"
        />
      )}

      {member.profilePicture ? (
        <img src={member.profilePicture} alt="" className="size-10 shrink-0 rounded-full object-cover" />
      ) : (
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {initials(member)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-m-ink">{name}</p>
          {isHead && <Crown className="size-3.5 shrink-0 text-m-tone-amber-fg" aria-label="Family head" />}
        </div>
        <p className="text-xs text-m-ink-2">
          {role}
          {isHead && relation ? ' · Family head' : ''}
          {member.isAlive === false ? ' · Deceased' : ''}
        </p>
      </div>

      {tel && !isSelf && (
        <a
          href={tel}
          className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-m-brand/10 text-m-brand"
          aria-label={`Call ${name}`}
        >
          <Phone className="size-3.5" />
        </a>
      )}
      {href && <ChevronRight className="size-4 shrink-0 text-m-ink-3" />}
    </div>
  );
}

interface FamilyMembersListProps {
  members: FamilyMember[];
  /** Whose profile is on screen. Shown first, highlighted, and used for relation labels. */
  viewed: FamilyAnchor;
  headId?: string;
  /** The logged-in person, if they may appear in this family. */
  selfId?: string;
  /** Link for a row. Return null for no link. */
  hrefFor: (memberId: string) => string | null;
  loading?: boolean;
  emptyText?: string;
}

/** Presentational family list. Viewed person first, then the head, then everyone else A–Z. */
export function FamilyMembersList({
  members,
  viewed,
  headId,
  selfId,
  hrefFor,
  loading,
  emptyText = 'No family members added yet',
}: FamilyMembersListProps) {
  if (loading) {
    return (
      <div role="status" aria-label="Loading family">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return <p className="py-6 text-center text-sm text-m-ink-2">{emptyText}</p>;
  }

  const headOf = (m: FamilyMember) => !!m.isFamilyHead || m._id === headId;
  // Oldest first (undated members sink to the bottom); the viewed person always leads.
  const dobTime = (m: FamilyMember) => (m.dob ? new Date(m.dob).getTime() : Infinity);
  const ordered = [...members].sort((a, b) => {
    if (a._id === viewed._id) return -1;
    if (b._id === viewed._id) return 1;
    const at = dobTime(a);
    const bt = dobTime(b);
    if (at !== bt) return at - bt;
    return (a.firstName ?? '').localeCompare(b.firstName ?? '');
  });

  return (
    <div className="divide-y divide-m-line">
      {ordered.map((m) => {
        const isViewed = m._id === viewed._id;
        return (
          <FamilyRow
            key={m._id}
            member={m}
            isHead={headOf(m)}
            isViewed={isViewed}
            isSelf={m._id === selfId}
            relation={isViewed ? undefined : relationLabel(viewed, m)}
            href={isViewed ? null : hrefFor(m._id)}
          />
        );
      })}
    </div>
  );
}

/** `familyId` arrives as a plain id from /auth/me but as a populated
 * `{ _id, ... }` object from GET /users/:id — normalise to the id string. */
function resolveFamilyId(familyId: User['familyId']): string | undefined {
  if (!familyId) return undefined;
  if (typeof familyId === 'string') return familyId;
  return (familyId as { _id?: string })._id;
}

/**
 * Family card for the member app. Fetches the tree of `user`'s family and lists
 * everyone in it, including `user`, with links to each member's profile.
 *
 * @param user   Whose family to show (own profile, or a member being viewed).
 * @param selfId The logged-in user's id — their row is labelled "you" and links to /m/profile.
 */
export function FamilySection({ user, selfId, communityId }: { user: User; selfId?: string; communityId?: string }) {
  const familyId = resolveFamilyId(user.familyId);

  const { data, loading } = useCachedFetch<FamilyTreeResponse>(
    familyId ? `family-tree:${familyId}` : null,
    () => fetch(`/api/member/families/${familyId}/tree`).then((r) => r.json()),
  );

  if (!familyId) return null;

  const allMembers = data?.members ?? [];
  const members = communityId
    ? allMembers.filter((m) => !m.communityIds || m.communityIds.includes(communityId))
    : allMembers;

  return (
    <section className="px-4 pt-6">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="flex size-7 items-center justify-center rounded-lg bg-m-brand/10 text-m-brand">
          <Users2 className="size-4" />
        </span>
        <h2 className="text-[15px] font-bold text-m-ink">Family</h2>
        {members.length > 0 && <span className="text-xs font-medium text-m-ink-2">{members.length} members</span>}
      </div>

      <div className="m-card px-4 py-3">
        <FamilyMembersList
          members={members}
          viewed={user}
          headId={data?.family?.headId}
          selfId={selfId}
          loading={loading}
          hrefFor={(id) => (id === selfId ? '/m/profile' : `/m/member/${id}`)}
        />
      </div>
    </section>
  );
}
