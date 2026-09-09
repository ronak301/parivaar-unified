import type { Response } from 'express';
import { Community } from '../models';
import type { AuthRequest } from '../middleware';

export async function isFeedEnabled(communityId: string): Promise<boolean> {
  const community = await Community.findById(communityId).select('features').lean();
  return community?.features?.feed === true;
}

/**
 * Gate for member-facing feed endpoints. Admins pass regardless so they can
 * review and moderate content while the feature is off for members.
 */
export async function requireFeedEnabled(req: AuthRequest, res: Response, communityId: string): Promise<boolean> {
  const isAdmin = req.user?.role === 'super_admin' || req.user?.role === 'community_admin';
  if (isAdmin) return true;
  if (await isFeedEnabled(communityId)) return true;
  res.status(403).json({ error: 'Feed is not enabled for your community' });
  return false;
}
