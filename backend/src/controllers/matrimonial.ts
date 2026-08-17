import type { Response } from 'express';
import { createMatrimonialSchema } from '@parivaar/shared';
import type { AuthRequest } from '../middleware';
import { MatrimonialProfile, ApprovalRequest } from '../models';
import { notifyCommunityAdmins } from '../services/notification';

export async function createMatrimonialProfile(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createMatrimonialSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { userId, communityId, biodataFile } = parsed.data;

  const existing = await MatrimonialProfile.findOne({ userId, communityId });
  if (existing) {
    res.status(400).json({ error: 'Matrimonial profile already exists for this user in this community' });
    return;
  }

  const profile = await MatrimonialProfile.create({ userId, communityId, biodataFile });

  const approval = await ApprovalRequest.create({
    entityType: 'matrimonial',
    entityId: profile._id.toString(),
    communityId,
    requestedBy: req.user?._id,
    payload: { userId, biodataFile },
  });

  const requesterName = req.user?.fullName ?? req.user?.firstName ?? 'A member';
  await notifyCommunityAdmins(
    communityId,
    'approval_request',
    'New matrimonial profile request',
    `${requesterName} submitted a matrimonial profile for review`,
    { approvalRequestId: approval._id.toString(), entityType: 'matrimonial' },
    approval._id.toString(),
  );

  res.status(201).json({ success: true, profile });
}

export async function getMatrimonialProfiles(req: AuthRequest, res: Response): Promise<void> {
  const { communityId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { communityId };
  if (req.query.status) filter.status = req.query.status;

  const [profiles, total] = await Promise.all([
    MatrimonialProfile.find(filter)
      .populate('userId', 'firstName lastName fullName profilePicture phone gender dob')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    MatrimonialProfile.countDocuments(filter),
  ]);

  res.json({
    success: true,
    profiles,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function getMatrimonialProfile(req: AuthRequest, res: Response): Promise<void> {
  const profile = await MatrimonialProfile.findById(req.params.id)
    .populate('userId', 'firstName lastName fullName profilePicture phone gender dob education address');

  if (!profile) {
    res.status(404).json({ error: 'Matrimonial profile not found' });
    return;
  }

  res.json({ success: true, profile });
}

export async function deleteMatrimonialProfile(req: AuthRequest, res: Response): Promise<void> {
  const profile = await MatrimonialProfile.findById(req.params.id);
  if (!profile) {
    res.status(404).json({ error: 'Matrimonial profile not found' });
    return;
  }

  const isOwner = profile.userId.toString() === req.user?._id.toString();
  const isAdmin = req.user?.role === 'super_admin' || req.user?.role === 'community_admin';
  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }

  await profile.deleteOne();
  res.json({ success: true, message: 'Matrimonial profile deleted' });
}
