import { API_BASE_URL } from "@/api/baseApiClient";

function apiOrigin(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const raw = (fromEnv && fromEnv.length > 0 ? fromEnv : API_BASE_URL).replace(/\/$/, "");
  return raw;
}

/**
 * API responses often use paths relative to the API origin. Vite `public/` files are served from the app origin (`/assets/...`, `/login.png`).
 */
export function resolveMediaUrl(url: string | undefined | null): string | undefined {
  if (url == null || typeof url !== "string") return undefined;
  let u = url.trim();
  if (!u) return undefined;

  if (/^https?:\/\//i.test(u)) {
    if (/^http:\/\/([^/]+\.)?parivaarapp\.in/i.test(u)) {
      return u.replace(/^http:\/\//i, "https://");
    }
    return u;
  }
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("blob:") || u.startsWith("data:")) return u;
  if (u.startsWith("/assets/") || u.startsWith("/login")) return u;

  const base = apiOrigin();
  const path = u.startsWith("/") ? u : `/${u}`;
  return `${base}${path}`;
}

/** Member payloads may use `profilePicture`, `imagePath`, or legacy keys. */
export function pickMemberAvatarUrl(member: {
  profilePicture?: string;
  imagePath?: string;
  photoUrl?: string;
}): string | undefined {
  return resolveMediaUrl(member.profilePicture || member.imagePath || member.photoUrl);
}
