import type { Response, NextFunction } from 'express';
import type { Model } from 'mongoose';
import type { AuthRequest } from './authenticate';

type Scoped = { communityIds?: unknown[]; communityId?: unknown };

function toIds(value: unknown): string[] {
  if (value == null) return [];
  return (Array.isArray(value) ? value : [value]).map((v) => String(v));
}

function myCommunityIds(req: AuthRequest): Set<string> {
  return new Set((req.user?.communityIds ?? []).map((id) => id.toString()));
}

/**
 * Restricts community admins to records (by `:paramName`) that belong to one
 * of their communities. Super admins and members pass through — members are
 * limited by the controllers' own ownership checks.
 */
export function recordScope(model: Model<any>, paramName = 'id') {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (req.user?.role !== 'community_admin') {
      next();
      return;
    }

    const doc = (await model
      .findById(req.params[paramName])
      .select('communityIds communityId')
      .lean()
      .catch(() => null)) as Scoped | null;
    if (!doc) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const mine = myCommunityIds(req);
    const recordIds = [...toIds(doc.communityIds), ...toIds(doc.communityId)];
    if (!recordIds.some((id) => mine.has(id))) {
      res.status(403).json({ error: 'Not authorized for this community' });
      return;
    }

    next();
  };
}

/**
 * Stops community admins from creating or moving records into communities
 * they don't manage via `communityIds` / `communityId` in the request body.
 */
export function bodyCommunityScope() {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== 'community_admin') {
      next();
      return;
    }

    const body = (req.body ?? {}) as Scoped;
    const requested = [...toIds(body.communityIds), ...toIds(body.communityId)];
    const mine = myCommunityIds(req);
    if (requested.some((id) => !mine.has(id))) {
      res.status(403).json({ error: 'Not authorized for this community' });
      return;
    }

    next();
  };
}
