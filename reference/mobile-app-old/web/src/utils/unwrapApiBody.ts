/**
 * Flattens common API shapes: `{ data: T }` or `{ data: { data: T } }` into a single object.
 */
export function unwrapApiBody(body: unknown): Record<string, unknown> {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }
  let cur: Record<string, unknown> = { ...(body as Record<string, unknown>) };
  for (let depth = 0; depth < 2; depth++) {
    const inner = cur.data;
    if (
      inner != null &&
      typeof inner === "object" &&
      !Array.isArray(inner)
    ) {
      cur = { ...cur, ...(inner as Record<string, unknown>) };
    } else {
      break;
    }
  }
  return cur;
}
