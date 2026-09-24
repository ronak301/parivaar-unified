/** Community id in an admin route like /admin/community/:id/... or /admin/communities/:id. */
export function routeCommunityId(pathname: string): string | undefined {
  return pathname.match(/^\/admin\/communit(?:y|ies)\/([^/]+)/)?.[1];
}

/**
 * The community the admin is working in: the one in the URL if they can access
 * it, else the last one picked in the switcher, else their first community.
 */
export function currentCommunityId(pathname: string, communities: { _id: string }[]): string | null {
  const has = (id: string | null | undefined) => !!id && communities.some((c) => c._id === id);
  const fromRoute = routeCommunityId(pathname);
  if (has(fromRoute)) return fromRoute!;
  const saved = typeof window !== 'undefined' ? localStorage.getItem('selectedCommunityId') : null;
  if (has(saved)) return saved;
  return communities[0]?._id ?? null;
}
