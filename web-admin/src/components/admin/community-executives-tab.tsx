'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import type { Community, Designation, UserListItem } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@chakra-ui/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClickableAvatar } from '@/components/ui/clickable-image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Plus, Trash2, User, X } from 'lucide-react';

type DesignationForm = Omit<Designation, 'id'>;

const EMPTY_FORM: DesignationForm = {
  memberId: undefined,
  name: '',
  photo: undefined,
  sansthan: '',
  designation: '',
  year: '',
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function CommunityExecutivesTab({
  community,
  onUpdated,
}: {
  community: Community;
  onUpdated: (community: Community) => void;
}) {
  const designations = community.designations ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<DesignationForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [memberQuery, setMemberQuery] = useState('');
  const [memberResults, setMemberResults] = useState<UserListItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showResults) return;
    function handleClickOutside(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showResults]);

  useEffect(() => {
    let cancelled = false;
    const query = memberQuery.trim();
    if (!query) {
      startTransition(() => setMemberResults([]));
      return;
    }
    startTransition(() => setSearching(true));
    const timer = setTimeout(() => {
      fetch(
        `/api/admin/communities/${community._id}/member-search?query=${encodeURIComponent(query)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setMemberResults(data.users ?? []);
        })
        .catch(() => {
          if (!cancelled) setMemberResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [memberQuery, community._id]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setMemberQuery('');
    setMemberResults([]);
    setShowResults(false);
    setError('');
  }

  function selectMember(user: UserListItem) {
    setForm((f) => ({
      ...f,
      memberId: user._id,
      name: `${user.firstName} ${user.lastName ?? ''}`.trim(),
      photo: user.profilePicture,
    }));
    setMemberQuery('');
    setMemberResults([]);
    setShowResults(false);
  }

  function clearMember() {
    setForm((f) => ({ ...f, memberId: undefined, name: '', photo: undefined }));
  }

  async function persist(next: Designation[]) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/communities/${community._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designations: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to save changes');
        return false;
      }
      onUpdated(data.community);
      return true;
    } catch {
      setError('Network error. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd() {
    if (!form.name.trim() || !form.designation.trim() || !form.year.trim()) return;
    const ok = await persist([...designations, { ...form, id: generateId() }]);
    if (ok) {
      resetForm();
      setDialogOpen(false);
    }
  }

  async function handleRemove(index: number) {
    await persist(designations.filter((_, i) => i !== index));
  }

  return (
    <div className="chakra-scope">
    <Card.Root>
      <Card.Body className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Executive designations for this community.
          </p>
          <Dialog
            open={dialogOpen}
            onOpenChange={(next) => {
              setDialogOpen(next);
              if (!next) resetForm();
            }}
          >
            <DialogTrigger render={<Button size="sm" />}>
              <Plus />
              Add Executive
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Executive</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2" ref={searchBoxRef}>
                  <Label htmlFor="ex-member-search">Find existing member (optional)</Label>
                  {form.memberId ? (
                    <div className="flex items-center gap-2 rounded-md border p-2">
                      <Avatar>
                        <AvatarImage src={form.photo} alt="" />
                        <AvatarFallback>
                          <User className="size-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm font-medium">{form.name}</span>
                      <Button variant="ghost" size="icon-sm" onClick={clearMember} type="button">
                        <X />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id="ex-member-search"
                        placeholder="Search member by name..."
                        value={memberQuery}
                        onChange={(e) => {
                          setMemberQuery(e.target.value);
                          setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                        autoComplete="off"
                      />
                      {showResults && memberQuery.trim() && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                          {searching && (
                            <p className="p-2 text-sm text-muted-foreground">Searching...</p>
                          )}
                          {!searching && memberResults.length === 0 && (
                            <p className="p-2 text-sm text-muted-foreground">No members found.</p>
                          )}
                          {!searching &&
                            memberResults.map((user) => (
                              <button
                                key={user._id}
                                type="button"
                                onClick={() => selectMember(user)}
                                className="flex w-full items-center gap-2 p-2 text-left hover:bg-accent"
                              >
                                <Avatar size="sm">
                                  <AvatarImage src={user.profilePicture} alt="" />
                                  <AvatarFallback>
                                    <User className="size-3" />
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {user.firstName} {user.lastName ?? ''}
                                </span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Selecting a member auto-fills their name and photo. Otherwise, fill the
                    details manually below.
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="ex-name">Name</Label>
                  <Input
                    id="ex-name"
                    value={form.name}
                    disabled={!!form.memberId}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ex-designation">Designation</Label>
                  <Input
                    id="ex-designation"
                    value={form.designation}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, designation: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ex-sansthan">Sansthan</Label>
                  <Input
                    id="ex-sansthan"
                    value={form.sansthan}
                    onChange={(e) => setForm((f) => ({ ...f, sansthan: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ex-year">Year</Label>
                  <Input
                    id="ex-year"
                    placeholder="e.g. 2026-28"
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAdd}
                  disabled={
                    saving || !form.name.trim() || !form.designation.trim() || !form.year.trim()
                  }
                >
                  {saving ? 'Saving...' : 'Add'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && !dialogOpen && <p className="text-sm text-destructive">{error}</p>}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Sansthan</TableHead>
              <TableHead>Year</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {designations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No executives added yet.
                </TableCell>
              </TableRow>
            )}
            {designations.map((d, index) => (
              <TableRow key={d.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ClickableAvatar
                      src={d.photo}
                      alt={d.name}
                      fallback={<User className="size-3" />}
                      size="sm"
                    />
                    {d.name}
                  </div>
                </TableCell>
                <TableCell>{d.designation}</TableCell>
                <TableCell>{d.sansthan ?? '-'}</TableCell>
                <TableCell>{d.year}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <Trash2 className="text-destructive" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove executive?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove {d.name} ({d.designation}) from the executives list.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemove(index)}>
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card.Body>
    </Card.Root>
    </div>
  );
}
