import type { Member } from "@/types/types";
import { unwrapApiBody } from "@/utils/unwrapApiBody";

export type MembersListPayload = {
  members?: { rows?: Member[]; count?: number };
  totalMembers?: string;
  totalFamilyHeads?: string;
};

/** Normalizes POST /community/members/:id response bodies (with or without nested `data`). */
export function parseMembersListPayload(body: unknown): MembersListPayload | null {
  if (body == null || typeof body !== "object") return null;
  const flat = unwrapApiBody(body as Record<string, unknown>);
  const members = flat.members as MembersListPayload["members"];
  if (!members) return null;
  return {
    members,
    totalMembers: flat.totalMembers as string | undefined,
    totalFamilyHeads: flat.totalFamilyHeads as string | undefined,
  };
}
