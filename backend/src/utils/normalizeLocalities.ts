/**
 * Converts old `string[]` locality format to `Record<string, string[]>`.
 * If already an object, returns as-is. Falls back to empty object.
 */
export function normalizeLocalities(
  raw: unknown,
  fallbackCity = 'Bangalore',
): Record<string, string[]> {
  if (!raw) return {};
  if (Array.isArray(raw)) {
    return raw.length > 0 ? { [fallbackCity]: raw as string[] } : {};
  }
  if (typeof raw === 'object') return raw as Record<string, string[]>;
  return {};
}
