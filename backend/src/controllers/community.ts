import type { Response } from 'express';
import { createCommunitySchema, updateCommunitySchema } from '@parivaar/shared';
import type { AuthRequest } from '../middleware';
import { Community, User } from '../models';
import {
  createCommunityAdminUser,
  findCommunityAdmin,
  generatePassword,
  hashPassword,
} from '../services/communityAdmin';
import { normalizeLocalities } from '../utils/normalizeLocalities';

export async function createCommunity(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createCommunitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const community = await Community.create(parsed.data);

  // Auto-provision the community's admin login; credentials are shown once.
  let adminCredentials = null;
  try {
    adminCredentials = await createCommunityAdminUser(community._id, community.name);
  } catch (err) {
    // Don't fail community creation if credential provisioning hiccups; it can
    // be created later from the Admin Access tab.
    console.error('Failed to provision community admin for', community._id, err);
  }

  res.status(201).json({ success: true, community, adminCredentials });
}

export async function getCommunity(req: AuthRequest, res: Response): Promise<void> {
  const community = await Community.findById(req.params.id);
  if (!community) {
    res.status(404).json({ error: 'Community not found' });
    return;
  }

  // Auto-migrate old string[] localities to city-keyed format.
  if (Array.isArray(community.localities)) {
    community.localities = normalizeLocalities(community.localities, community.city || 'Bangalore');
    await community.save();
  }

  // Populate designation photos from linked member profilePictures.
  if (community.designations?.length) {
    const memberIds = community.designations
      .filter((d) => d.memberId && !d.photo)
      .map((d) => d.memberId);
    if (memberIds.length > 0) {
      const members = await User.find({ _id: { $in: memberIds } }).select('_id profilePicture');
      const photoMap = new Map(members.map((m) => [m._id.toString(), m.profilePicture]));
      for (const d of community.designations) {
        if (d.memberId && !d.photo) {
          const pic = photoMap.get(d.memberId.toString());
          if (pic) d.photo = pic;
        }
      }
    }
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

  // Remove the shadow admin user for this community, then detach the community
  // from all remaining members.
  await User.deleteMany({ role: 'community_admin', communityIds: community._id });
  await User.updateMany(
    { communityIds: community._id },
    { $pull: { communityIds: community._id } },
  );

  res.json({ success: true, message: 'Community deleted' });
}

/** Super-admin: read (or auto-create) the community's admin login info. */
export async function getCommunityAdminInfo(req: AuthRequest, res: Response): Promise<void> {
  const community = await Community.findById(req.params.id).select('_id name');
  if (!community) {
    res.status(404).json({ error: 'Community not found' });
    return;
  }

  let admin = await findCommunityAdmin(community._id);

  // Auto-provision if no admin login exists yet.
  if (!admin) {
    const creds = await createCommunityAdminUser(community._id, community.name);
    admin = await findCommunityAdmin(community._id);
    if (!admin) {
      res.status(500).json({ error: 'Failed to create admin login' });
      return;
    }
    // Ensure the just-created password is on the document.
    admin.adminPassword = creds.password;
  }

  res.json({
    success: true,
    admin: {
      exists: true,
      username: admin.adminUsername,
      password: admin.adminPassword,
      createdAt: (admin as { createdAt?: Date }).createdAt,
    },
  });
}

/** Super-admin: create the community's admin login if it doesn't exist yet. */
export async function createCommunityAdmin(req: AuthRequest, res: Response): Promise<void> {
  const community = await Community.findById(req.params.id);
  if (!community) {
    res.status(404).json({ error: 'Community not found' });
    return;
  }

  const existing = await findCommunityAdmin(community._id);
  if (existing) {
    res.status(409).json({ error: 'Admin login already exists for this community' });
    return;
  }

  const adminCredentials = await createCommunityAdminUser(community._id, community.name);
  res.status(201).json({ success: true, adminCredentials });
}

/** Super-admin: set a new random password for the community's admin login. */
export async function regenerateCommunityAdminPassword(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const admin = await findCommunityAdmin(req.params.id);
  if (!admin) {
    res.status(404).json({ error: 'No admin login exists for this community' });
    return;
  }

  const password = generatePassword();
  admin.adminPassword = password;
  admin.adminPasswordHash = await hashPassword(password);
  await admin.save();

  res.json({ success: true, adminCredentials: { username: admin.adminUsername, password } });
}

/** Super-admin: remove the community's admin login. */
export async function deleteCommunityAdmin(req: AuthRequest, res: Response): Promise<void> {
  const result = await User.deleteMany({ role: 'community_admin', communityIds: req.params.id });
  if (result.deletedCount === 0) {
    res.status(404).json({ error: 'No admin login exists for this community' });
    return;
  }

  res.json({ success: true, message: 'Admin login removed' });
}

export async function getAllCommunities(_req: AuthRequest, res: Response): Promise<void> {
  const communities = await Community.find().sort({ name: 1 });

  // Auto-migrate any old string[] localities.
  for (const c of communities) {
    if (Array.isArray(c.localities)) {
      c.localities = normalizeLocalities(c.localities, c.city || 'Bangalore');
      await c.save();
    }
  }

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
    User.find({ communityIds: communityId, role: 'member' })
      .select('enrollmentId firstName lastName fullName profilePicture phone gender address.city address.locality isFamilyHead isAlive')
      .sort({ firstName: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments({ communityIds: communityId, role: 'member' }),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
