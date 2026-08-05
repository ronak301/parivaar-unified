import type { Member } from "@/types/types";
import { unwrapApiBody } from "@/utils/unwrapApiBody";

/** Normalizes POST business/:communityId response into a member row list. */
export function parseBusinessListRows(body: unknown): Member[] {
  if (body == null) return [];
  if (Array.isArray(body)) return body as Member[];

  if (typeof body !== "object") return [];
  const o = body as Record<string, unknown>;
  const inner = o.data;
  if (Array.isArray(inner)) return inner as Member[];
  if (inner && typeof inner === "object" && !Array.isArray(inner) && "rows" in inner) {
    const rows = (inner as { rows?: unknown }).rows;
    return Array.isArray(rows) ? (rows as Member[]) : [];
  }
  const flat = unwrapApiBody(o);
  const d = flat.data;
  if (Array.isArray(d)) return d as Member[];
  if (d && typeof d === "object" && "rows" in (d as object)) {
    const rows = (d as { rows?: unknown }).rows;
    return Array.isArray(rows) ? (rows as Member[]) : [];
  }
  const topRows = flat.rows;
  return Array.isArray(topRows) ? (topRows as Member[]) : [];
}
