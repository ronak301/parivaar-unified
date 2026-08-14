import type { Response } from 'express';
import { createCommunitySchema, updateCommunitySchema } from '@parivaar/shared';
import type { AuthRequest } from '../middleware';
import { Community, User } from '../models';

export async function createCommunity(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createCommunitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const community = await Community.create(parsed.data);
  res.status(201).json({ success: true, community });
}

export async function getCommunity(req: AuthRequest, res: Response): Promise<void> {
  const community = await Community.findById(req.params.id);
  if (!community) {
    res.status(404).json({ error: 'Community not found' });
    return;
  }

  res.json({ success: true, community });
}

export async function updateCommunity(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateCommunitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const community = await Community.findByIdAndUpdate(req.params.id, parsed.data, {
    new: true,
    runValidators: true,
  });

  if (!community) {
    res.status(404).json({ error: 'Community not found' });
    return;
  }

  res.json({ success: true, community });
}

export async function deleteCommunity(req: AuthRequest, res: Response): Promise<void> {
  const community = await Community.findByIdAndDelete(req.params.id);
  if (!community) {
    res.status(404).json({ error: 'Community not found' });
    return;
  }

  await User.updateMany(
    { communityIds: community._id },
    { $pull: { communityIds: community._id } },
  );

  res.json({ success: true, message: 'Community deleted' });
}

export async function getAllCommunities(_req: AuthRequest, res: Response): Promise<void> {
  const communities = await Community.find().sort({ name: 1 });
  res.json({ success: true, communities });
}

export async function joinCommunity(req: AuthRequest, res: Response): Promise<void> {
  const { id: communityId } = req.params;
  const userId = req.user?._id;

  const community = await Community.findById(communityId);
  if (!community) {
    res.status(404).json({ error: 'Community not found' });
    return;
  }

  await User.findByIdAndUpdate(userId, {
    $addToSet: { communityIds: communityId },
  });

  res.json({ success: true, message: 'Joined community' });
}

export async function leaveCommunity(req: AuthRequest, res: Response): Promise<void> {
  const { id: communityId } = req.params;
  const userId = req.user?._id;

  await User.findByIdAndUpdate(userId, {
    $pull: { communityIds: communityId },
  });

  res.json({ success: true, message: 'Left community' });
}

export async function getCommunityMembers(req: AuthRequest, res: Response): Promise<void> {
  const { id: communityId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({ communityIds: communityId })
      .select('enrollmentId firstName lastName fullName profilePicture phone gender address.city address.locality isFamilyHead isAlive')
      .sort({ firstName: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments({ communityIds: communityId }),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
