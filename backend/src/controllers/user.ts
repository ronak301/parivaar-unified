import type { Response } from 'express';
import { createUserSchema, updateUserSchema, searchUsersSchema } from '@parivaar/shared';
import type { AuthRequest } from '../middleware';
import { User, Family } from '../models';

export async function createUser(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const user = await User.create(parsed.data);
  res.status(201).json({ success: true, user });
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

  const user = await User.findByIdAndUpdate(userId, parsed.data, { new: true, runValidators: true });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ success: true, user });
}

export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (user.familyId) {
    await Family.updateOne({ _id: user.familyId, headId: user._id }, { $unset: { headId: '' } });
  }
  await User.updateMany(
    { $or: [{ fatherId: user._id }, { motherId: user._id }, { spouseId: user._id }] },
    { $unset: { fatherId: '', motherId: '', spouseId: '' } },
  );
  await User.updateMany(
    { childrenIds: user._id },
    { $pull: { childrenIds: user._id } },
  );

  res.json({ success: true, message: 'User deleted' });
}

export async function searchUsers(req: AuthRequest, res: Response): Promise<void> {
  const parsed = searchUsersSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
    return;
  }

  const { query: q, communityId, filters, page = 1, limit = 20 } = parsed.data;
  const filter: Record<string, unknown> = {};

  if (communityId) filter.communityIds = communityId;
  if (filters?.gender) filter.gender = filters.gender;
  if (filters?.bloodGroup) filter.bloodGroup = filters.bloodGroup;
  if (filters?.locality) filter['address.locality'] = filters.locality;
  if (filters?.city) filter['address.city'] = filters.city;
  if (filters?.nativePlace) filter.nativePlace = filters.nativePlace;
  if (filters?.sampradaya) filter.sampradaya = filters.sampradaya;
  if (filters?.isFamilyHead !== undefined) filter.isFamilyHead = filters.isFamilyHead;

  if (q) {
    filter.$text = { $search: q };
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('enrollmentId firstName lastName fullName profilePicture phone gender address.city address.locality communityIds familyId isFamilyHead isAlive')
      .sort(q ? { score: { $meta: 'textScore' } } : { firstName: 1 })
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

export async function getUsersByCommunity(req: AuthRequest, res: Response): Promise<void> {
  const { communityId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { communityIds: communityId };

  if (req.query.gender) filter.gender = req.query.gender;
  if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
  if (req.query.locality) filter['address.locality'] = req.query.locality;
  if (req.query.isAlive !== undefined) filter.isAlive = req.query.isAlive === 'true';

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('enrollmentId firstName lastName fullName profilePicture phone gender address.city address.locality isFamilyHead isAlive familyId')
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
