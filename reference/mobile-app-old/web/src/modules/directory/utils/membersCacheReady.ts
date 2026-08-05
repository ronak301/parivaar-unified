import type { Member } from "@/types/types";

/** True when the members list cache has a complete bulk snapshot for UI use. */
export function membersCacheReady(
  cache: { rows?: Member[]; totalCount?: number; bulkLoaded?: boolean } | undefined
): boolean {
  if (!cache || !Array.isArray(cache.rows) || typeof cache.totalCount !== "number") return false;
  return true;
}
