import type { Member } from "@/types/types";
import { getAge } from "@/utils/utils";
import { memberIsAccountManagerTrue } from "@/modules/directory/utils/normalizeMemberRow";

export type LocalSearchOptions = {
  query: string;
  /** When true, only members with `isAccountManager` true (same as “Only Family Heads” checkbox). */
  showOnlyAccountManagers?: boolean;
  bloodGroup?: string;
  locality?: string;
  businessType?: string;
  showUnmarried?: boolean;
  age?: { min: number; max: number };
  gender?: string | null;
};

/** Lowercase, no spaces — for name substring match. */
function normalizeNamePart(s: string) {
  return s.replace(/\s/g, "").toLowerCase();
}

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

/** True if `query` matches first name, last name, or mobile (digit substring). */
function queryMatchesMember(queryRaw: string, m: Member): boolean {
  const query = (queryRaw ?? "").trim();
  if (!query) return true;

  const qName = normalizeNamePart(query);
  const qDigits = digitsOnly(query);

  const fn = normalizeNamePart(m.firstName ?? "");
  const ln = normalizeNamePart(m.lastName ?? "");
  const combined = fn + ln;
  const full = normalizeNamePart(m.fullName ?? "");
  if (
    qName.length > 0 &&
    (fn.includes(qName) ||
      ln.includes(qName) ||
      combined.includes(qName) ||
      full.includes(qName))
  ) {
    return true;
  }

  if (qDigits.length > 0) {
    const ph = digitsOnly(m.phone ?? "");
    if (ph.includes(qDigits)) {
      return true;
    }
  }

  return false;
}

/**
 * Client-side search / filters over the full members list (same dimensions as server filters).
 */
export function filterMembersLocalSearch(
  members: Member[],
  options: LocalSearchOptions
): Member[] {
  let list = members;

  if (options.showOnlyAccountManagers) {
    list = list.filter((m) => memberIsAccountManagerTrue(m));
  }

  if (options.bloodGroup) {
    list = list.filter((m) => m.bloodGroup === options.bloodGroup);
  }

  if (options.locality) {
    list = list.filter((m) => m.address?.locality === options.locality);
  }

  if (options.businessType) {
    list = list.filter((m) => m.business?.type === options.businessType);
  }

  if (options.showUnmarried) {
    list = list.filter((m) => !m.weddingDate);
  }

  if (options.age) {
    const { min, max } = options.age;
    list = list.filter((m) => {
      if (!m.dob) return false;
      const age = getAge(m.dob);
      return age >= min && age <= max;
    });
  }

  if (options.gender) {
    list = list.filter((m) => m.gender === options.gender);
  }

  const raw = (options.query ?? "").trim();
  if (raw) {
    list = list.filter((m) => queryMatchesMember(raw, m));
  }

  return list;
}
