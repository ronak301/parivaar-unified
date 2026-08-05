import type { Member } from "@/types/types";

function coerceBoolish(v: unknown): boolean | undefined {
  if (v === true) return true;
  if (v === false) return false;
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return undefined;
}

function pickAccountManagerRaw(m: Member): unknown {
  const raw = m as Record<string, unknown>;
  if (coerceBoolish(m.isAccountManager) !== undefined) return m.isAccountManager;
  const flat = raw.is_account_manager ?? raw.accountManager;
  if (coerceBoolish(flat) !== undefined) return flat;
  const user = raw.user;
  if (user && typeof user === "object" && user !== null && !Array.isArray(user)) {
    const u = user as Record<string, unknown>;
    const nested = u.isAccountManager ?? u.is_account_manager ?? u.accountManager;
    if (coerceBoolish(nested) !== undefined) return nested;
  }
  return undefined;
}

/**
 * Ensures `isAccountManager` is on the member root (camelCase and snake_case, nested `user`).
 * Directory mukhiya filtering and the checkbox both rely on this field.
 */
export function normalizeMemberForDirectory(m: Member): Member {
  const picked = pickAccountManagerRaw(m);
  if (picked !== undefined && coerceBoolish(picked) !== undefined) {
    return { ...m, isAccountManager: picked as Member["isAccountManager"] };
  }
  return m;
}

export function normalizeMembersForDirectory(rows: Member[]): Member[] {
  return rows.map(normalizeMemberForDirectory);
}

/** Mukhya row: `isAccountManager` resolves to true (after {@link normalizeMemberForDirectory}). */
export function memberIsAccountManagerTrue(m: Member): boolean {
  return coerceBoolish(m.isAccountManager) === true;
}
