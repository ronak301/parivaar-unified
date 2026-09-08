/** Flatten city→localities map into a deduped string list (for dropdowns). */
export function flattenLocalities(map?: Record<string, string[]>): string[] {
  if (!map || typeof map !== 'object' || Array.isArray(map)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const areas of Object.values(map)) {
    for (const a of areas) {
      if (!seen.has(a)) {
        seen.add(a);
        result.push(a);
      }
    }
  }
  return result.sort((a, b) => a.localeCompare(b));
}

/** Get localities for a specific city from the map. */
export function localitiesForCity(
  map?: Record<string, string[]>,
  city?: string,
): string[] {
  if (!map || !city) return flattenLocalities(map);
  return map[city] ?? [];
}
