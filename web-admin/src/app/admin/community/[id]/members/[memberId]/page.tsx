'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BloodGroups } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import { ClickableAvatar } from '@/components/ui/clickable-image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Pencil,
  ShieldOff,
  ShieldCheck,
  Trash2,
  UserPlus,
  Phone,
  MessageCircle,
  Users2,
  Crown,
} from 'lucide-react';
import { EditMemberSheet } from '@/components/admin/edit-member-sheet';
import { AddFamilyMemberDialog } from '@/components/admin/add-family-member-dialog';
import { MemberDetailTabs } from '@/components/admin/member-detail-tabs';
import { FamilyMembersList } from '@/components/member/family-section';
import type { UserData, FamilyTreeMember } from '@/components/admin/member-detail-types';
import { readCache, writeCache, clearCache } from '@/lib/cache/local-cache';
import { getAvatarColor } from '@/lib/member/avatar-color';
import { telLink, whatsappLink } from '@/lib/member/contact-links';
import { formatDate } from '@/lib/utils';

function getAge(dob?: string) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  return Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;
  const memberId = params.memberId as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [familyMembers, setFamilyMembers] = useState<FamilyTreeMember[]>([]);
  const [familyLoading, setFamilyLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [blockActionLoading, setBlockActionLoading] = useState(false);
  const [blockError, setBlockError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteWarning, setDeleteWarning] = useState<{ dependentsCount: number; dependents: Array<{ id: string; name: string }> } | null>(null);
  const [confirmCascadeDelete, setConfirmCascadeDelete] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [localities, setLocalities] = useState<string[]>(
    () => readCache<{ localities?: string[] }>(`community_detail_${communityId}`)?.localities ?? [],
  );

  useEffect(() => {
    fetch(`/api/admin/communities/${communityId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.community) setLocalities(data.community.localities ?? []);
      })
      .catch(() => {});
  }, [communityId]);

  const fetchUser = useCallback(async () => {
    const cacheKey = `member_${memberId}`;
    const cached = readCache<UserData>(cacheKey);
    setError('');
    if (cached) {
      setUser(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(`/api/admin/users/${memberId}`);
      if (!res.ok) {
        if (!cached) setError('Failed to load member');
        return;
      }
      const data = await res.json();
      setUser(data.user as UserData);
      writeCache(cacheKey, data.user as UserData);
    } catch {
      if (!cached) setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const fetchFamilyMembers = useCallback(async (familyId: string) => {
    const cacheKey = `family_tree_${familyId}`;
    const cached = readCache<FamilyTreeMember[]>(cacheKey);
    if (cached) {
      setFamilyMembers(cached);
      setFamilyLoading(false);
    } else {
      setFamilyLoading(true);
    }

    try {
      const res = await fetch(`/api/admin/families/${familyId}/tree`);
      if (!res.ok) return;
      const data = await res.json();
      const members = (data.members ?? []) as FamilyTreeMember[];
      setFamilyMembers(members);
      writeCache(cacheKey, members);
    } finally {
      setFamilyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.familyId?._id) {
      fetchFamilyMembers(user.familyId._id);
    } else {
      setFamilyMembers([]);
    }
  }, [user?.familyId?._id, fetchFamilyMembers]);

  async function handleBlockToggle() {
    if (!user) return;
    setBlockActionLoading(true);
    setBlockError('');
    try {
      const action = user.isBlocked ? 'unblock' : 'block';
      const res = await fetch(`/api/admin/users/${memberId}/${action}`, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok) {
        setBlockError(data.error || `Failed to ${action} member`);
        return;
      }
      await fetchUser();
    } catch {
      setBlockError('Network error');
    } finally {
      setBlockActionLoading(false);
    }
  }

  async function handleDeleteClick() {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/users/${memberId}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        if (data.hasDependents) {
          setDeleteWarning({
            dependentsCount: data.dependentsCount,
            dependents: data.dependents || [],
          });
          setShowDeleteDialog(false);
          setDeleteLoading(false);
          return;
        }
        setDeleteError(data.error || 'Failed to delete member');
        setDeleteLoading(false);
        return;
      }

      clearCache(`member_${memberId}`);
      if (user?.familyId?._id) clearCache(`family_tree_${user.familyId._id}`);
      clearCache(`members_list_${communityId}`);
      clearCache(`community_members_${communityId}`);
      setShowDeleteDialog(false);
      router.push(`/admin/community/${communityId}/members`);
    } catch {
      setDeleteError('Network error');
      setDeleteLoading(false);
    }
  }

  async function handleCascadeDelete() {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/users/${memberId}?cascade=true`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete member');
        setDeleteLoading(false);
        return;
      }
      clearCache(`member_${memberId}`);
      if (user?.familyId?._id) clearCache(`family_tree_${user.familyId._id}`);
      clearCache(`members_list_${communityId}`);
      clearCache(`community_members_${communityId}`);
      setDeleteWarning(null);
      router.push(`/admin/community/${communityId}/members`);
    } catch {
      setDeleteError('Network error');
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col pb-8" role="status" aria-label="Loading member">
        <div className="m-banner -mx-6 -mt-6 h-40 animate-pulse opacity-80" />
        <div className="relative z-10 -mt-14 md:px-4">
          <div className="m-card-float flex items-center gap-4 p-5">
            <div className="size-20 animate-pulse rounded-full bg-m-surface-2" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded-md bg-m-surface-2" />
              <div className="h-3 w-1/4 animate-pulse rounded-md bg-m-surface-2" />
              <div className="h-3 w-1/5 animate-pulse rounded-md bg-m-surface-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="m-card max-w-sm p-6 text-center">
          <p className="font-semibold text-m-ink">{error || 'Member not found'}</p>
          <button
            type="button"
            onClick={() => router.push(`/admin/community/${communityId}/members`)}
            className="mt-3 text-sm font-medium text-m-brand hover:underline"
          >
            Back to members
          </button>
        </div>
      </div>
    );
  }

  const fullName = user.fullName || `${user.firstName} ${user.lastName ?? ''}`.trim();
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
  const avatar = getAvatarColor(fullName);
  const tel = telLink(user.phone);
  const wa = whatsappLink(user.phone);
  const age = getAge(user.dob);
  const dob = formatDate(user.dob);
  const bloodGroup = BloodGroups.find((bg) => bg.id === user.bloodGroup)?.label ?? user.bloodGroup;
  const place = user.address?.locality || user.address?.city;
  const bannerBtn =
    'inline-flex h-10 items-center gap-2 rounded-m-field border border-white/25 bg-white/10 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-50';

  return (
    <div className="flex w-full flex-col pb-8">
      {/* Banner */}
      <div className="m-banner relative -mx-6 -mt-6 overflow-hidden px-6 pb-20 pt-6 md:px-10">
        <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-40 size-44 rounded-full bg-white/10" />

        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push(`/admin/community/${communityId}/members`)}
            className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-sm font-medium text-white/85 transition-colors hover:bg-white/15 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Members
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {user.isFamilyHead && (
              <button type="button" onClick={() => setAddMemberOpen(true)} className={bannerBtn}>
                <UserPlus className="size-4" />
                Add family member
              </button>
            )}

            {user.isBlocked ? (
              <button type="button" onClick={handleBlockToggle} disabled={blockActionLoading} className={bannerBtn}>
                <ShieldCheck className="size-4" />
                {blockActionLoading ? 'Unblocking…' : 'Unblock'}
              </button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger className={bannerBtn}>
                  <ShieldOff className="size-4" />
                  Block
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Block this member?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {fullName} will no longer be able to access their account or appear in active member listings.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBlockToggle} disabled={blockActionLoading}>
                      {blockActionLoading ? 'Blocking…' : 'Block'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <AlertDialog open={showDeleteDialog && !deleteWarning} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger className={bannerBtn}>
                <Trash2 className="size-4" />
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this member?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {fullName} will be permanently removed and unlinked from the family tree. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {deleteError && (
                  <div className="my-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                    <p className="text-sm font-medium text-destructive">{deleteError}</p>
                  </div>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteClick} disabled={deleteLoading} className="bg-destructive hover:bg-destructive/90">
                    {deleteLoading ? 'Checking…' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {deleteWarning && (
              <AlertDialog open={true} onOpenChange={() => !deleteLoading && setDeleteWarning(null)}>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive">This member has dependents</AlertDialogTitle>
                    <AlertDialogDescription>
                      Deleting {fullName} also removes the {deleteWarning.dependentsCount} family member
                      {deleteWarning.dependentsCount !== 1 ? 's' : ''} linked to them. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-xl bg-m-surface-2 p-3">
                    <p className="text-sm font-semibold text-m-ink">{fullName}</p>
                    {deleteWarning.dependents.map((dep) => (
                      <p key={dep.id} className="pl-3 text-sm text-m-ink-2">
                        └ {dep.name}
                      </p>
                    ))}
                  </div>
                  {deleteError && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                      <p className="text-sm font-medium text-destructive">{deleteError}</p>
                    </div>
                  )}
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteLoading} onClick={() => setDeleteWarning(null)}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCascadeDelete}
                      disabled={deleteLoading}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {deleteLoading ? 'Deleting…' : `Delete all ${deleteWarning.dependentsCount + 1}`}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-m-field bg-white px-4 text-sm font-semibold text-m-brand shadow-m-card transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <Pencil className="size-4" />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Floating profile card */}
      <div className="relative z-10 -mt-14 md:px-4">
        <div className="m-card-float p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {user.profilePicture ? (
              <ClickableAvatar
                src={user.profilePicture}
                alt={fullName}
                fallback={<span className="text-2xl font-bold">{initials}</span>}
                className="size-20 shrink-0 border-2 border-m-surface shadow-sm"
              />
            ) : (
              <div
                className="flex size-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold"
                style={{ backgroundColor: avatar.bg, color: avatar.text }}
              >
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-m-ink">{fullName}</h1>
                {age != null && <span className="text-sm text-m-ink-2">· {age} yr</span>}
                {user.isFamilyHead && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-m-tone-amber-bg px-2 py-0.5 text-[11px] font-semibold text-m-tone-amber-fg">
                    <Crown className="size-3" />
                    Family head
                  </span>
                )}
                {user.isAlive === false && (
                  <span className="rounded-full bg-m-surface-2 px-2 py-0.5 text-[11px] font-semibold text-m-ink-2">Late</span>
                )}
                {user.isBlocked && (
                  <span className="rounded-full bg-m-tone-rose-bg px-2 py-0.5 text-[11px] font-semibold text-m-tone-rose-fg">Blocked</span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-m-ink-2">
                {[user.guardianName, user.enrollmentId ? `ID ${user.enrollmentId}` : null, place].filter(Boolean).join(' · ')}
              </p>
              {user.phone && <p className="mt-0.5 text-sm text-m-ink-2">{user.phone}</p>}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {tel && (
                <a
                  href={tel}
                  className="flex size-10 items-center justify-center rounded-full bg-m-brand/10 text-m-brand transition-colors hover:bg-m-brand/20"
                  aria-label="Call"
                >
                  <Phone className="size-4" />
                </a>
              )}
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-full bg-m-wa/12 text-m-wa-ink transition-colors hover:bg-m-wa/20"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="size-4" />
                </a>
              )}
            </div>
          </div>

          {(dob || bloodGroup) && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-sm">
              {dob && (
                <div className="rounded-xl bg-m-tone-emerald-bg px-3 py-2.5 text-center">
                  <p className="text-[11px] text-m-tone-emerald-fg">Date of birth</p>
                  <p className="mt-0.5 text-sm font-bold text-m-ink">{dob}</p>
                </div>
              )}
              {bloodGroup && (
                <div className="rounded-xl bg-m-tone-rose-bg px-3 py-2.5 text-center">
                  <p className="text-[11px] text-m-tone-rose-fg">Blood group</p>
                  <p className="mt-0.5 text-sm font-bold text-m-ink">{bloodGroup}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {(error || blockError) && (
        <p role="alert" className="mt-3 text-sm text-m-danger md:px-4">
          {error || blockError}
        </p>
      )}

      {/* Family first — only members belonging to this community */}
      {user.familyId?._id && (() => {
        const communityFamily = familyMembers.filter(
          (m) => !m.communityIds || m.communityIds.includes(communityId),
        );
        return (
          <div className="mt-6 md:px-4">
            <div className="mb-2 flex items-center gap-2">
              <Users2 className="size-4 text-m-brand" />
              <h2 className="text-sm font-bold text-m-ink">Family</h2>
              {communityFamily.length > 0 && (
                <span className="text-xs text-m-ink-2">{communityFamily.length} members</span>
              )}
            </div>
            <div className="m-card px-4">
              <FamilyMembersList
                members={communityFamily}
                viewed={communityFamily.find((m) => m._id === user._id) ?? { _id: user._id, gender: user.gender }}
                headId={user.familyId.headId}
                loading={familyLoading}
                emptyText="No other family members yet"
                hrefFor={(id) => `/admin/community/${communityId}/members/${id}`}
              />
            </div>
          </div>
        );
      })()}

      {/* Then personal / business */}
      <div className="mt-6 md:px-4">
        <MemberDetailTabs user={user} />
      </div>

      <EditMemberSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        memberId={memberId}
        user={user}
        onSaved={fetchUser}
        localities={localities}
      />

      <AddFamilyMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        communityId={communityId}
        member={user}
        familyMembers={familyMembers}
        onAdded={() => {
          fetchUser();
          if (user.familyId?._id) fetchFamilyMembers(user.familyId._id);
        }}
      />
    </div>
  );
}
