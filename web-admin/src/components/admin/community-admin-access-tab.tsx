'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Copy, Check, RefreshCw, Trash2, ShieldCheck, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface AdminInfo {
  exists: boolean;
  username?: string;
  password?: string;
  createdAt?: string;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked; value is still visible to copy manually
    }
  }
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-sm font-semibold text-foreground">{value}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={copy}>
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}

export function CommunityAdminAccessTab({
  communityId,
  communityName,
}: {
  communityId: string;
  communityName: string;
}) {
  const [info, setInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/communities/${communityId}/admin`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load');
      setInfo(data.admin);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); // eslint-disable-line react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  async function regenerate() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/communities/${communityId}/admin/regenerate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to regenerate');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to regenerate');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/communities/${communityId}/admin`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to remove login');
      setConfirmDelete(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove login');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-m-tone-indigo-bg text-m-tone-indigo-fg">
          <KeyRound className="size-5" />
        </div>
        <div className="text-sm text-muted-foreground">
          Admin login for <span className="font-semibold text-foreground">{communityName}</span>.
          Share these credentials with the community admin.
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      ) : info?.exists ? (
        <div className="rounded-xl border border-border p-4">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <ShieldCheck className="size-4 text-m-tone-emerald-fg" />
            Login active
            {info.createdAt && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                Created {formatDate(info.createdAt)}
              </span>
            )}
          </p>

          <div className="flex flex-col gap-2">
            <CopyRow label="Username" value={info.username!} />
            <CopyRow label="Password" value={info.password!} />
            <CopyRow label="Login URL" value={`${typeof window !== 'undefined' ? window.location.origin : ''}/`} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={regenerate} disabled={busy}>
              <RefreshCw className="size-4" />
              New password
            </Button>
            <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)} disabled={busy}>
              <Trash2 className="size-4" />
              Delete login
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      )}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete admin login?</DialogTitle>
            <DialogDescription>
              The community admin will no longer be able to log in. You can create a new login later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline">Cancel</Button>} />
            <Button type="button" variant="destructive" onClick={remove} disabled={busy}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
