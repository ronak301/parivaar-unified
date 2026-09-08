'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, ChevronRight, LogOut, Pencil, Settings, ShieldCheck, X } from 'lucide-react';
import type { User } from '@parivaar/shared';
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SettingsSheetProps {
  user: User;
  onLogout: () => Promise<void> | void;
}

/**
 * Bottom sheet behind the gear icon on the profile screen.
 * Logout is an explicit, confirmed action rather than the icon's click handler.
 */
export function SettingsSheet({ user, onLogout }: SettingsSheetProps) {
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
      setConfirmLogout(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Settings"
        className="rounded-full p-1.5 transition-colors hover:bg-white/15"
      >
        <Settings className="size-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="member-app mx-auto max-w-md max-h-[85dvh] rounded-t-2xl bg-m-surface px-0 pb-0"
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <SheetTitle className="text-m-ink">Settings</SheetTitle>
            <SheetClose
              className="rounded-full p-1.5 text-m-ink-2 hover:bg-m-surface-2"
            >
              <X className="size-4" />
            </SheetClose>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-m-surface-2 p-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-m-brand/10 text-sm font-bold text-m-brand">
                {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-m-ink">
                  {`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()}
                </p>
                {user.phone && <p className="text-xs text-m-ink-2">{user.phone}</p>}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-m-surface ring-1 ring-m-line">
              <Link
                href="/m/profile/edit"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-sm text-m-ink active:bg-m-surface-2"
              >
                <Pencil className="size-4 text-m-ink-2" />
                <span className="flex-1">Edit profile</span>
                <ChevronRight className="size-4 text-m-ink-3" />
              </Link>
              <Link
                href="/m/community"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border-t border-m-line px-3 py-3 text-sm text-m-ink active:bg-m-surface-2"
              >
                <Building2 className="size-4 text-m-ink-2" />
                <span className="flex-1">About community</span>
                <ChevronRight className="size-4 text-m-ink-3" />
              </Link>
              <div className="flex items-center gap-3 border-t border-m-line px-3 py-3 text-sm text-m-ink">
                <ShieldCheck className="size-4 text-m-ink-2" />
                <div className="flex-1">
                  <p>Profile changes need admin approval</p>
                  <p className="text-xs text-m-ink-2">You will be asked for an OTP before editing.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setConfirmLogout(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-m-tone-rose-bg py-3 text-sm font-semibold text-m-tone-rose-fg"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need an OTP on your phone to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Logging out…' : 'Log out'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
