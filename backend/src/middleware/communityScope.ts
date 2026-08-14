import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './authenticate';

/**
 * Restricts non-super-admins to communities they belong to.
 * `paramName` is the route param holding the community id — defaults to
 * `communityId`, pass `'id'` for routes where the community itself is `:id`.
 */
export function communityScope(paramName = 'communityId') {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (req.user.role === 'super_admin') {
      next();
      return;
    }

    const communityId = req.params[paramName] ?? (req.body as { communityId?: string })?.communityId;
    if (!communityId) {
      res.status(400).json({ error: 'communityId is required' });
      return;
    }

    const hasAccess = req.user.communityIds.some((id) => id.toString() === communityId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Not authorized for this community' });
      return;
    }

    next();
  };
}
