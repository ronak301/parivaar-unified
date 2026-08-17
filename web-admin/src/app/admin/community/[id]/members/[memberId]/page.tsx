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
import { ArrowLeft, Pencil, ShieldOff, ShieldCheck, UserPlus, UserRound } from 'lucide-react';
import { EditMemberSheet } from '@/components/admin/edit-member-sheet';
import { AddFamilyMemberDialog } from '@/components/admin/add-family-member-dialog';
import type { UserData, FamilyTreeMember } from '@/components/admin/member-detail-types';

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

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${memberId}`);
      if (!res.ok) {
        setError('Failed to load member');
        return;
      }
      const data = await res.json();
      setUser(data.user as UserData);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const fetchFamilyMembers = useCallback(async (familyId: string) => {
    setFamilyLoading(true);
    try {
      const res = await fetch(`/api/admin/families/${familyId}/tree`);
      if (!res.ok) return;
      const data = await res.json();
      setFamilyMembers((data.members ?? []) as FamilyTreeMember[]);
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
          <Button variant="outline" size="sm" onClick={() => setAddMemberOpen(true)}>
            <UserPlus className="size-4" />
            Add Family Member
          </Button>

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

          <Button size="sm" onClick={() => setEditOpen(true)} className="bg-[#3230c4] hover:bg-[#494ad9]">
            <Pencil className="size-4" />
            Edit
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {blockError && <p className="text-sm text-destructive">{blockError}</p>}

      <div className="bg-white rounded-xl border p-6 flex flex-col gap-6">
        <h2 className="text-sm font-semibold text-[#464555] uppercase tracking-wider">Personal Information</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label="First Name" value={user.firstName} />
          <InfoField label="Last Name" value={user.lastName} />
          <InfoField label="Phone" value={user.phone} />
          <InfoField label="Email" value={user.email} />
          <InfoField label="Gender" value={genderLabel(user.gender)} />
          <InfoField label="Date of Birth" value={formatDate(user.dob)} />
          <InfoField label="Guardian Name" value={user.guardianName} />
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
          <InfoField label="Nanihaal" value={user.nanihaal} />
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
      />

      <AddFamilyMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        communityId={communityId}
        member={user}
        onAdded={() => {
          fetchUser();
          if (user.familyId?._id) fetchFamilyMembers(user.familyId._id);
        }}
      />
    </div>
  );
}
