'use client';

import { useState } from 'react';
import type { Community, Designation } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus, Trash2 } from 'lucide-react';

const EMPTY_FORM: Designation = { name: '', sansthan: '', designation: '', year: '' };

export function CommunityExecutivesTab({
  community,
  onUpdated,
}: {
  community: Community;
  onUpdated: (community: Community) => void;
}) {
  const designations = community.designations ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Designation>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    const ok = await persist([...designations, form]);
    if (ok) {
      setForm(EMPTY_FORM);
      setDialogOpen(false);
    }
  }

  async function handleRemove(index: number) {
    await persist(designations.filter((_, i) => i !== index));
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Executive designations for this community.
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus />
              Add Executive
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Executive</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ex-name">Name</Label>
                  <Input
                    id="ex-name"
                    value={form.name}
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
              <TableRow key={`${d.name}-${d.designation}-${index}`}>
                <TableCell>{d.name}</TableCell>
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
      </CardContent>
    </Card>
  );
}
