import { themeColors } from "@/theme";

const BTN = 36;
const ROW_ICON = 20;
/** Slightly smaller handset glyph so it doesn’t dominate WhatsApp in the row. */
const ROW_ICON_CALL = 16;

/** Handset / call glyph — same SVG for member list + profile (no extra npm weight). */
function PhoneCallIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      style={{ display: "block", flexShrink: 0 }}
    >
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19c-.54 0-.99.45-.99.99 0 9.36 7.59 16.95 16.95 16.95.54 0 .99-.45.99-.99v-3.48c0-.54-.45-.99-.99-.99z" />
    </svg>
  );
}

function WhatsAppIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      style={{ display: "block", flexShrink: 0 }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/** Compact phone + WhatsApp actions for member rows. */
export function MemberRowContactIcons({ phone }: { phone: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <a
        href={`tel:+91${phone}`}
        aria-label="Call"
        title="Call"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: BTN,
          height: BTN,
          borderRadius: 999,
          backgroundColor: "rgba(7, 119, 255, 0.12)",
          color: themeColors.primary,
          textDecoration: "none",
        }}
      >
        <PhoneCallIcon size={ROW_ICON_CALL} />
      </a>
      <a
        href={`https://wa.me/${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        title="WhatsApp"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: BTN,
          height: BTN,
          borderRadius: 999,
          backgroundColor: "rgba(37, 211, 102, 0.15)",
          color: "#128C7E",
          textDecoration: "none",
        }}
      >
        <WhatsAppIcon size={ROW_ICON} />
      </a>
    </div>
  );
}

/** Profile header: larger tap targets. */
export function ProfileHeaderContactIcons({ phone }: { phone: string }) {
  const iconSize = 24;
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
      <a
        href={`tel:+91${phone}`}
        aria-label="Call"
        title="Call"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          borderRadius: 999,
          backgroundColor: "rgba(7, 119, 255, 0.12)",
          color: themeColors.primary,
          textDecoration: "none",
        }}
      >
        <PhoneCallIcon size={iconSize} />
      </a>
      <a
        href={`https://wa.me/${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        title="WhatsApp"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          borderRadius: 999,
          backgroundColor: "rgba(37, 211, 102, 0.15)",
          color: "#075E54",
          textDecoration: "none",
        }}
      >
        <WhatsAppIcon size={iconSize} />
      </a>
    </div>
  );
}
