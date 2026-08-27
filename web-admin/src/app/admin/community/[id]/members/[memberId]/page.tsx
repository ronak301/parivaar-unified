'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Gender } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { ArrowLeft, Pencil, ShieldOff, ShieldCheck, Trash2, UserPlus, UserRound } from 'lucide-react';
import { EditMemberSheet } from '@/components/admin/edit-member-sheet';
import { AddFamilyMemberDialog } from '@/components/admin/add-family-member-dialog';
import type { UserData, FamilyTreeMember } from '@/components/admin/member-detail-types';
import { readCache, writeCache, clearCache } from '@/lib/cache/local-cache';

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[#464555]">{label}</span>
      <span className="text-sm text-[#0b1c30]">{value || '—'}</span>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function genderLabel(value?: string) {
  if (!value) return undefined;
  return Gender.find((g) => g.id === value)?.label ?? value;
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
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-64 text-destructive">{error || 'Member not found'}</div>;
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-6 px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/community/${communityId}/members`)}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <ClickableAvatar
              src={user.profilePicture}
              alt={user.fullName}
              size="lg"
              fallback={<UserRound className="size-6 text-[#3230c4]" />}
              className="bg-[#dce9ff]"
            />
            <div>
              <h1 className="text-xl font-bold text-[#0b1c30]">{user.fullName || user.firstName}</h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>ID: {user.enrollmentId}</span>
                {user.isFamilyHead && <Badge variant="secondary">Head</Badge>}
                {user.isAlive === false && <Badge variant="outline">Deceased</Badge>}
                {user.isBlocked && <Badge variant="destructive">Blocked</Badge>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user.isFamilyHead && (
            <Button variant="outline" size="sm" onClick={() => setAddMemberOpen(true)}>
              <UserPlus className="size-4" />
              Add Family Member
            </Button>
          )}

          {user.isBlocked ? (
            <Button variant="outline" size="sm" onClick={handleBlockToggle} disabled={blockActionLoading}>
              <ShieldCheck className="size-4" />
              {blockActionLoading ? 'Unblocking...' : 'Unblock'}
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
                <ShieldOff className="size-4" />
                Block
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Block this member?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {user.fullName || user.firstName} will no longer be able to access their account or appear in active member listings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBlockToggle} disabled={blockActionLoading}>
                    {blockActionLoading ? 'Blocking...' : 'Block'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog open={showDeleteDialog && !deleteWarning} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger render={<Button variant="outline" size="sm" className="text-destructive hover:text-destructive" />}>
              <Trash2 className="size-4" />
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this member?</AlertDialogTitle>
                <AlertDialogDescription>
                  {user.fullName || user.firstName} will be permanently removed and unlinked from the family tree. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteError && (
                <div className="bg-destructive/10 border border-destructive/30 rounded p-3 my-2">
                  <p className="text-sm text-destructive font-medium">{deleteError}</p>
                </div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteClick} disabled={deleteLoading} className="bg-destructive hover:bg-destructive/90">
                  {deleteLoading ? 'Checking...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {deleteWarning && (
            <AlertDialog open={true} onOpenChange={() => !deleteLoading && setDeleteWarning(null)}>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive text-lg">⚠️ User has dependents</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  <div className="bg-destructive/10 border-l-4 border-destructive rounded p-3">
                    <p className="text-sm font-semibold text-destructive mb-2">
                      Cannot delete directly. This member has {deleteWarning.dependentsCount} dependent{deleteWarning.dependentsCount !== 1 ? 's' : ''}.
                    </p>
                    <p className="text-xs text-destructive/80">
                      Deleting <strong>{user.fullName || user.firstName}</strong> will permanently remove all family members and relations listed below.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Members that will be deleted:</p>
                    <div className="bg-slate-50 border rounded p-3 max-h-64 overflow-y-auto space-y-1.5">
                      <div className="flex items-start gap-2 text-sm font-semibold text-destructive">
                        <span className="text-destructive">●</span>
                        <span>{user.fullName || user.firstName}</span>
                      </div>
                      {deleteWarning.dependents.map((dep) => (
                        <div key={dep.id} className="flex items-start gap-2 text-sm text-destructive/80 ml-3">
                          <span className="text-destructive/60">└─</span>
                          <span>{dep.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {deleteError && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
                      <p className="text-sm text-destructive font-medium">{deleteError}</p>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2.5">
                    <p className="text-xs text-yellow-900">
                      <strong>⚠️ Warning:</strong> This action cannot be undone. All data will be permanently deleted.
                    </p>
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteLoading} onClick={() => setDeleteWarning(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCascadeDelete}
                    disabled={deleteLoading}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete All'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button size="sm" onClick={() => setEditOpen(true)} className="bg-[#0b1c30] hover:bg-[#1c2f47]">
            <Pencil className="size-4" />
            Edit
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}
      {blockError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          <p className="text-sm text-destructive font-medium">{blockError}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border p-6 flex flex-col gap-6">
        <h2 className="text-sm font-semibold text-[#464555] uppercase tracking-wider">Personal Information</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label="First Name" value={user.firstName} />
          <InfoField label="Last Name" value={user.lastName} />
          <InfoField label="Phone" value={user.phone} />
          <InfoField label="Email" value={user.email} />
          <InfoField label="Gender" value={genderLabel(user.gender)} />
          <InfoField label="Date of Birth" value={formatDate(user.dob)} />
          <InfoField label="Father's Name / Guardian Name" value={user.guardianName} />
          <InfoField label="Blood Group" value={user.bloodGroup} />
          <InfoField label="Wedding Date" value={formatDate(user.weddingDate)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 flex flex-col gap-6">
        <h2 className="text-sm font-semibold text-[#464555] uppercase tracking-wider">Education & Background</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label="Education" value={user.education} />
          <InfoField label="Special Education" value={user.specialEducation} />
          <InfoField label="Native Place" value={user.nativePlace} />
          <InfoField label="Native District" value={user.nativeDistrict} />
          <InfoField label="Nanihaal Gotra" value={user.nanihaal} />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 flex flex-col gap-6">
        <h2 className="text-sm font-semibold text-[#464555] uppercase tracking-wider">Address</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <InfoField label="Full Address" value={user.address?.fullAddress} />
          </div>
          <InfoField label="State" value={user.address?.state} />
          <InfoField label="City" value={user.address?.city} />
          <InfoField label="District" value={user.address?.district} />
          <InfoField label="Locality" value={user.address?.locality} />
          <InfoField label="Pincode" value={user.address?.pincode} />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 flex flex-col gap-6">
        <h2 className="text-sm font-semibold text-[#464555] uppercase tracking-wider">Identity & Privacy</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label="Aadhaar" value={user.aadharLast4 ? `•••• •••• ${user.aadharLast4}` : undefined} />
          <InfoField label="Life Status" value={user.isAlive === false ? `Deceased${user.demiseDate ? ` (${formatDate(user.demiseDate)})` : ''}` : 'Alive'} />
        </div>
        {user.communityIds && user.communityIds.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-[#464555]">Communities</span>
            <div className="flex flex-wrap gap-2">
              {user.communityIds.map((c) => (
                <Badge key={c._id} variant="secondary" className="bg-[#dce9ff] text-[#3230c4]">{c.name}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6 flex flex-col gap-6">
        <h2 className="text-sm font-semibold text-[#464555] uppercase tracking-wider">Other</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoField label="Hobbies" value={user.hobbies} />
          <InfoField label="Achievements" value={user.achievements} />
        </div>
      </div>

      {user.familyId?._id && (
        <div className="bg-white rounded-xl border p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[#464555] uppercase tracking-wider">Family Members</h2>
          {familyLoading ? (
            <p className="text-sm text-muted-foreground">Loading family members...</p>
          ) : familyMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No other family members yet.</p>
          ) : (
            <div className="flex flex-col divide-y">
              {familyMembers.map((m) => (
                <button
                  key={m._id}
                  type="button"
                  onClick={() => router.push(`/admin/community/${communityId}/members/${m._id}`)}
                  className="flex items-center gap-3 py-3 text-left hover:bg-[#e5eeff]/30 transition-colors -mx-2 px-2 rounded-lg"
                >
                  <ClickableAvatar
                    src={m.profilePicture}
                    alt={m.fullName}
                    fallback={<span className="text-xs">{`${m.firstName?.[0] ?? ''}${m.lastName?.[0] ?? ''}`.toUpperCase()}</span>}
                    className="bg-[#dce9ff] text-[#3230c4]"
                  />
                  <div className="flex-1 flex flex-col">
                    <span className="text-sm font-semibold text-[#0b1c30]">{m.fullName || m.firstName}</span>
                    <span className="text-xs text-[#464555]">
                      {m._id === user._id ? 'Self' : m.isFamilyHead ? 'Head' : genderLabel(m.gender) || 'Member'}
                      {m.dob ? ` • ${formatDate(m.dob)}` : ''}
                    </span>
                  </div>
                  {m.isFamilyHead && <Badge variant="secondary">Head</Badge>}
                  {m.isAlive === false && <Badge variant="outline">Deceased</Badge>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
