import Link from 'next/link';
import { Phone, MessageCircle } from 'lucide-react';
import { BloodGroups, type UserListItem } from '@parivaar/shared';
import { telLink, whatsappLink } from '@/lib/member/contact-links';
import { getAvatarColor } from '@/lib/member/avatar-color';

function getInitials(user: UserListItem) {
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
}

export function MemberCard({ member }: { member: UserListItem }) {
  const bloodGroupLabel = BloodGroups.find((bg) => bg.id === member.bloodGroup)?.label;
  const tel = telLink(member.phone);
  const wa = whatsappLink(member.phone);
  const fullName = `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim();
  const avatarColor = getAvatarColor(fullName);
  const subtitle = [member.education, member.address?.locality || member.address?.city]
    .filter(Boolean)
    .join(' · ');

  return (
    // Stretched-link pattern: the whole card navigates, while the call /
    // WhatsApp buttons sit above the overlay and keep their own actions.
    <div className="m-card relative flex items-center gap-3 p-3.5 transition-shadow active:shadow-none">
      <Link
        href={`/m/member/${member._id}`}
        aria-label={`View ${fullName}'s profile`}
        className="absolute inset-0 rounded-m-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m-brand/40"
      />

      {member.profilePicture ? (
        <img
          src={member.profilePicture}
          alt={member.firstName}
          className="size-11 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
        >
          {getInitials(member)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-m-ink">{fullName}</p>
        {member.phone && <p className="text-xs text-m-ink-2">{member.phone}</p>}
        {subtitle && <p className="truncate text-xs text-m-ink-2">{subtitle}</p>}
      </div>

      <div className="relative z-10 flex shrink-0 items-center gap-2">
        {tel && (
          <a
            href={tel}
            className="flex size-9 items-center justify-center rounded-full bg-m-brand/10 text-m-brand"
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
            className="flex size-9 items-center justify-center rounded-full bg-m-wa/12 text-m-wa-ink"
            aria-label="WhatsApp"
          >
            <MessageCircle className="size-4" />
          </a>
        )}
        {bloodGroupLabel && (
          <span className="rounded-full bg-m-tone-rose-bg px-2 py-0.5 text-[10px] font-semibold text-m-tone-rose-fg">
            {bloodGroupLabel}
          </span>
        )}
      </div>
    </div>
  );
}
