import type { Request, Response } from 'express';
import { createUserSchema, updateUserSchema, searchUsersSchema } from '@parivaar/shared';
import type { AuthRequest } from '../middleware';
import { User, Family, Business } from '../models';
import { fuzzyFilterAndPaginate, CANDIDATE_CAP } from '../utils/fuzzy-search';

const SEARCH_SELECT = 'enrollmentId firstName lastName fullName profilePicture phone gender address.city address.locality communityIds familyId isFamilyHead isAlive';

function buildAgeFilter(ageMin?: number, ageMax?: number): Record<string, Date> | undefined {
  if (ageMin === undefined && ageMax === undefined) return undefined;

  const today = new Date();
  const dobFilter: Record<string, Date> = {};
  if (ageMin !== undefined) {
    dobFilter.$lte = new Date(today.getFullYear() - ageMin, today.getMonth(), today.getDate());
  }
  if (ageMax !== undefined) {
    dobFilter.$gte = new Date(today.getFullYear() - ageMax - 1, today.getMonth(), today.getDate() + 1);
  }
  return dobFilter;
}

export async function checkPhone(req: AuthRequest, res: Response): Promise<void> {
  const phone = req.query.phone as string;
  if (!phone) {
    res.status(400).json({ error: 'phone query parameter is required' });
    return;
  }

  const existing = await User.findOne({ phone })
    .select('_id firstName lastName fullName phone communityIds')
    .populate('communityIds', 'name');
  res.json({ success: true, exists: !!existing, user: existing ?? undefined });
}

// Public, unauthenticated variant for the anonymous family-submission form.
// Returns only a boolean — never the matched user's name/communities — to
// avoid leaking PII about registered members to unauthenticated callers.
export async function checkPhonePublic(req: Request, res: Response): Promise<void> {
  const phone = req.query.phone as string;
  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    res.status(400).json({ error: 'A valid 10-digit phone number is required' });
    return;
  }

  const existing = await User.exists({ phone });
  res.json({ success: true, exists: !!existing });
}

export async function createUser(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  try {
    const user = await User.create(parsed.data);
    res.status(201).json({ success: true, user });
  } catch (err: any) {
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const details: Record<string, string[]> = {};
      Object.keys(err.errors).forEach((field) => {
        details[field] = [err.errors[field].message];
      });
      return res.status(400).json({ error: 'Validation error', details });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue?.[field];
      const existingUser = await User.findOne({ [field]: value }).select('firstName lastName');
      const name = existingUser ? `${existingUser.firstName} ${existingUser.lastName || ''}`.trim() : 'another user';
      const message = `${field === 'phone' ? 'Phone' : field} already exists with ${name}`;
      return res.status(400).json({
        error: 'Validation error',
        details: { [field]: [message] }
      });
    }

    console.error('User create error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function getUser(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.params.id)
    .populate('familyId')
    .populate('communityIds', 'name logo city');

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (req.user && req.user._id.toString() !== user._id.toString()) {
    const publicUser = user.toObject() as unknown as Record<string, unknown>;
    for (const field of user.privateFields) {
      delete publicUser[field];
    }
    res.json({ success: true, user: publicUser });
    return;
  }

  res.json({ success: true, user });
}

export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const userId = req.params.id;
  const isOwnProfile = req.user?._id.toString() === userId;
  const isAdmin = req.user?.role === 'super_admin' || req.user?.role === 'community_admin';

  if (!isOwnProfile && !isAdmin) {
    res.status(403).json({ error: 'Not authorized to update this user' });
    return;
  }

  try {
    const user = await User.findByIdAndUpdate(userId, parsed.data, { new: true, runValidators: true });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (err: any) {
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const details: Record<string, string[]> = {};
      Object.keys(err.errors).forEach((field) => {
        details[field] = [err.errors[field].message];
      });
      return res.status(400).json({ error: 'Validation error', details });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue?.[field];
      const existingUser = await User.findOne({ [field]: value }).select('firstName lastName');
      const name = existingUser ? `${existingUser.firstName} ${existingUser.lastName || ''}`.trim() : 'another user';
      const message = `${field === 'phone' ? 'Phone' : field} already exists with ${name}`;
      return res.status(400).json({
        error: 'Validation error',
        details: { [field]: [message] }
      });
    }

    console.error('User update error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { cascade } = req.query;

  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Check if user has children
  if (user.childrenIds.length > 0 && cascade !== 'true') {
    const allDescendants = await getAllDescendants(user._id.toString());
    return res.status(400).json({
      error: 'User has dependents',
      hasDependents: true,
      dependentsCount: allDescendants.length,
      dependents: allDescendants.map((c) => ({ id: c._id, name: `${c.firstName} ${c.lastName || ''}`.trim() })),
    });
  }

  // Recursively delete user and all descendants
  await deleteUserAndDescendants(id);

  res.json({ success: true, message: 'User deleted' });
}

async function getAllDescendants(userId: string): Promise<any[]> {
  const descendants: any[] = [];
  const queue = [userId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const currentUser = await User.findById(currentId).select('firstName lastName childrenIds');

    if (currentUser && currentUser.childrenIds.length > 0) {
      const children = await User.find({ _id: { $in: currentUser.childrenIds } }).select('firstName lastName childrenIds');
      descendants.push(...children);
      queue.push(...children.map((c) => c._id.toString()));
    }
  }

  return descendants;
}

async function deleteUserAndDescendants(userId: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user) return;

  // Recursively delete all children first
  if (user.childrenIds.length > 0) {
    for (const childId of user.childrenIds) {
      await deleteUserAndDescendants(childId.toString());
    }
  }

  // Delete the user
  await User.findByIdAndDelete(userId);

  // Unlink from family
  if (user.familyId) {
    await Family.updateOne({ _id: user.familyId, headId: userId }, { $unset: { headId: '' } });
  }

  // Unlink from parents/spouse
  await User.updateMany(
    { $or: [{ fatherId: userId }, { motherId: userId }, { spouseId: userId }] },
    { $unset: { fatherId: '', motherId: '', spouseId: '' } },
  );

  // Remove from siblings and parents' children list
  await User.updateMany(
    { childrenIds: userId },
    { $pull: { childrenIds: userId } },
  );
  await User.updateMany(
    { siblingIds: userId },
    { $pull: { siblingIds: userId } },
  );
}

export async function searchUsers(req: AuthRequest, res: Response): Promise<void> {
  const parsed = searchUsersSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
    return;
  }

  const { query: q, communityId, filters, page = 1, limit = 20 } = parsed.data;
  const filter: Record<string, unknown> = { isBlocked: { $ne: true } };

  if (communityId) filter.communityIds = communityId;
  if (filters?.gender) filter.gender = filters.gender;
  if (filters?.bloodGroup) filter.bloodGroup = filters.bloodGroup;
  if (filters?.locality) filter['address.locality'] = filters.locality;
  if (filters?.city) filter['address.city'] = filters.city;
  if (filters?.district) filter['address.district'] = filters.district;
  if (filters?.nativePlace) filter.nativePlace = filters.nativePlace;
  if (filters?.nativeDistrict) filter.nativeDistrict = filters.nativeDistrict;
  if (filters?.isFamilyHead !== undefined) filter.isFamilyHead = filters.isFamilyHead;
  if (filters?.isMarried !== undefined) filter.isMarried = filters.isMarried;

  const ageFilter = buildAgeFilter(filters?.ageMin, filters?.ageMax);
  if (ageFilter) filter.dob = ageFilter;

  if (filters?.sampradaya) {
    const familyIds = await Family.distinct('_id', { sampradaya: filters.sampradaya });
    filter.familyId = { $in: familyIds };
  }

  if (filters?.businessCategory) {
    const ownerIds = await Business.distinct('ownerId', {
      category: filters.businessCategory,
      ...(communityId ? { communityId } : {}),
    });
    filter._id = { $in: ownerIds };
  }

  const skip = (page - 1) * limit;

  if (q) {
    const candidates = await User.find(filter)
      .select(SEARCH_SELECT)
      .limit(CANDIDATE_CAP);

    const { items, total } = fuzzyFilterAndPaginate(candidates, q, page, limit);

    res.json({
      success: true,
      users: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
    return;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(SEARCH_SELECT)
      .sort({ firstName: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

const COMMUNITY_MEMBERS_SELECT = 'enrollmentId firstName lastName fullName profilePicture phone gender address.city address.locality isFamilyHead isAlive familyId guardianName education businessName businessCategory';

export async function getUsersByCommunity(req: AuthRequest, res: Response): Promise<void> {
  const { communityId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;
  const search = (req.query.search as string) || '';

  const filter: Record<string, unknown> = { communityIds: communityId, isBlocked: { $ne: true } };

  if (req.query.gender) filter.gender = req.query.gender;
  if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
  if (req.query.locality) filter['address.locality'] = req.query.locality;
  if (req.query.isAlive !== undefined) filter.isAlive = req.query.isAlive === 'true';
  if (req.query.isMarried !== undefined) filter.isMarried = req.query.isMarried === 'true';
  if (req.query.isFamilyHead !== undefined) filter.isFamilyHead = req.query.isFamilyHead === 'true';

  const ageMin = req.query.ageMin !== undefined ? Number(req.query.ageMin) : undefined;
  const ageMax = req.query.ageMax !== undefined ? Number(req.query.ageMax) : undefined;
  const ageFilter = buildAgeFilter(ageMin, ageMax);
  if (ageFilter) filter.dob = ageFilter;

  if (req.query.businessCategory) {
    const ownerIds = await Business.distinct('ownerId', {
      category: req.query.businessCategory,
      communityId,
    });
    filter._id = { $in: ownerIds };
  }

  if (search.trim()) {
    const candidates = await User.find(filter)
      .select(COMMUNITY_MEMBERS_SELECT)
      .limit(CANDIDATE_CAP);

    const { items, total } = fuzzyFilterAndPaginate(candidates, search, page, limit);

    res.json({
      success: true,
      users: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
    return;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(COMMUNITY_MEMBERS_SELECT)
      .sort({ firstName: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function getUserEvents(req: AuthRequest, res: Response): Promise<void> {
  const { communityId } = req.params;
  const today = new Date();
  const month = today.getMonth();
  const day = today.getDate();

  const users = await User.find({
    communityIds: communityId,
    isAlive: true,
    isBlocked: { $ne: true },
    dob: { $exists: true },
  }).select('firstName lastName fullName profilePicture dob phone');

  const birthdays = users.filter((u) => {
    if (!u.dob) return false;
    return u.dob.getMonth() === month && u.dob.getDate() === day;
  });

  const upcoming = users
    .filter((u) => {
      if (!u.dob) return false;
      const diff = (u.dob.getMonth() * 31 + u.dob.getDate()) - (month * 31 + day);
      return diff > 0 && diff <= 7;
    })
    .sort((a, b) => {
      const da = a.dob!.getMonth() * 31 + a.dob!.getDate();
      const db = b.dob!.getMonth() * 31 + b.dob!.getDate();
      return da - db;
    });

  res.json({ success: true, today: birthdays, upcoming });
}

export async function blockUser(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (user.role === 'super_admin') {
    res.status(403).json({ error: 'Cannot block a super admin' });
    return;
  }

  user.isBlocked = true;
  user.blockedAt = new Date();
  user.blockedBy = req.user?._id;
  await user.save();

  res.json({ success: true, user });
}

export async function unblockUser(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  user.isBlocked = false;
  user.blockedAt = undefined;
  user.blockedBy = undefined;
  await user.save();

  res.json({ success: true, user });
}

export async function markDeath(req: AuthRequest, res: Response): Promise<void> {
  const { demiseDate, newHeadId } = req.body;

  if (!demiseDate) {
    res.status(400).json({ error: 'demiseDate is required' });
    return;
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (!user.isAlive) {
    res.status(400).json({ error: 'User is already marked as deceased' });
    return;
  }

  if (user.isFamilyHead && user.familyId) {
    if (!newHeadId) {
      res.status(400).json({ error: 'newHeadId is required when marking a family head as deceased' });
      return;
    }

    const newHead = await User.findOne({ _id: newHeadId, familyId: user.familyId });
    if (!newHead) {
      res.status(400).json({ error: 'New head must be an existing family member' });
      return;
    }

    user.isFamilyHead = false;
    newHead.isFamilyHead = true;
    await newHead.save();
    await Family.updateOne({ _id: user.familyId }, { headId: newHead._id });
  }

  user.isAlive = false;
  user.demiseDate = new Date(demiseDate);
  await user.save();

  res.json({ success: true, user });
}

export async function getOrphanMembers(req: AuthRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const familyIdsWithHead = await Family.distinct('_id', { headId: { $exists: true, $ne: null } });

  const filter = {
    isBlocked: { $ne: true },
    $or: [
      { communityIds: { $size: 0 } },
      { communityIds: { $exists: false } },
      { familyId: { $exists: false } },
      { familyId: null },
      { isFamilyHead: { $ne: true }, familyId: { $nin: familyIdsWithHead } },
    ],
  };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('enrollmentId firstName lastName fullName profilePicture phone communityIds familyId isFamilyHead')
      .sort({ firstName: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
