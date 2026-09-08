import Link from 'next/link';
import { Clock, Phone, MessageCircle } from 'lucide-react';
import type { User } from '@parivaar/shared';
import { BloodGroups } from '@parivaar/shared';
import { telLink, whatsappLink } from '@/lib/member/contact-links';
import { formatDate } from '@/lib/utils';
import { PageBanner } from './page-banner';
import { SettingsSheet } from './settings-sheet';

function getInitials(user: User) {
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
}

function getAge(dob?: string) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

interface ProfileHeaderCardProps {
  user: User;
  /** `self` shows settings + Edit Profile; `other` shows a back button and no edit. */
  variant?: 'self' | 'other';
  onLogout?: () => Promise<void> | void;
  /** When true, the Edit button shows a "pending review" state (self view only). */
  pendingEdit?: boolean;
}

export function ProfileHeaderCard({ user, variant = 'self', onLogout, pendingEdit }: ProfileHeaderCardProps) {
  const isSelf = variant === 'self';
  const tel = telLink(user.phone);
  const wa = whatsappLink(user.phone);
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  const age = getAge(user.dob);
  const dob = formatDate(user.dob);
  const bloodGroup = BloodGroups.find((bg) => bg.id === user.bloodGroup)?.label;

  return (
    <div>
      <PageBanner
        title={isSelf ? 'Profile' : 'Member Profile'}
        subtitle={isSelf ? 'View and manage your details' : undefined}
        showBack={!isSelf}
        action={isSelf && onLogout ? <SettingsSheet user={user} onLogout={onLogout} /> : undefined}
      />

      {/* Floating card: relative + z-10 so it paints above the banner */}
      <div className="relative z-10 -mt-12 px-4">
        <div className="m-card-float p-4">
          <div className="flex items-center gap-4">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.firstName}
                className="size-[72px] shrink-0 rounded-full border-2 border-m-surface object-cover shadow-sm"
              />
            ) : (
              <div className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-m-brand/10 text-2xl font-bold text-m-brand">
                {getInitials(user)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <p className="truncate text-base font-bold text-m-ink">{fullName}</p>
                {age != null && (
                  <span className="shrink-0 text-xs text-m-ink-2">· {age} yr</span>
                )}
              </div>
              {user.guardianName && (
                <p className="mt-0.5 truncate text-sm text-m-ink-2">{user.guardianName}</p>
              )}
              {user.phone && <p className="mt-0.5 text-sm text-m-ink-2">{user.phone}</p>}

              <div className="mt-2.5 flex items-center gap-2">
                {tel && (
                  <a
                    href={tel}
                    className="flex size-9 items-center justify-center rounded-full bg-m-brand/10 text-m-brand transition-colors hover:bg-m-brand/15"
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
                    className="flex size-9 items-center justify-center rounded-full bg-m-wa/12 text-m-wa-ink transition-colors hover:bg-m-wa/20"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="size-4" />
                  </a>
                )}
                <div className="flex-1" />
                {isSelf && (
                  <Link
                    href="/m/profile/edit"
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-colors ${
                      pendingEdit
                        ? 'bg-m-tone-amber-bg text-m-tone-amber-fg'
                        : 'bg-m-brand text-m-on-brand hover:bg-m-brand/90'
                    }`}
                  >
                    {pendingEdit && <Clock className="size-3.5" />}
                    {pendingEdit ? 'Pending review' : 'Edit Profile'}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {(dob || bloodGroup) && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {dob && (
                <div className="rounded-xl bg-m-tone-emerald-bg px-3 py-3 text-center">
                  <p className="text-[11px] text-m-tone-emerald-fg">Date of Birth</p>
                  <p className="mt-0.5 text-sm font-bold text-m-ink">{dob}</p>
                </div>
              )}
              {bloodGroup && (
                <div className="rounded-xl bg-m-tone-rose-bg px-3 py-3 text-center">
                  <p className="text-[11px] text-m-tone-rose-fg">Blood Group</p>
                  <p className="mt-0.5 text-sm font-bold text-m-ink">{bloodGroup}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
