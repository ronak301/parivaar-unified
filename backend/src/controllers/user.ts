import type { Request, Response } from 'express';
import { createUserSchema, updateUserSchema, searchUsersSchema, submitProfileEditSchema } from '@parivaar/shared';
import type { AuthRequest } from '../middleware';
import { User, Family, Business, ApprovalRequest } from '../models';
import { verifyActionToken } from './auth';
import { notifyCommunityAdmins } from '../services/notification';
import { fuzzyFilterAndPaginate, CANDIDATE_CAP } from '../utils/fuzzy-search';

const SEARCH_SELECT = 'enrollmentId firstName lastName fullName profilePicture phone gender address.city address.locality communityIds familyId isFamilyHead isAlive';

/**
 * Marital status is rarely set explicitly. Treat a member as married when any
 * of: isMarried === true, a linked spouse, or a wedding date. Unmarried is the
 * complement, so records with none of those signals count as unmarried.
 */
function buildMarriedClause(isMarried: boolean): Record<string, unknown> {
  const marriedSignals = [
    { isMarried: true },
    { spouseId: { $exists: true, $ne: null } },
    { weddingDate: { $exists: true, $ne: null } },
  ];
  return isMarried ? { $or: marriedSignals } : { $nor: marriedSignals };
}

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
      res.status(400).json({ error: 'Validation error', details });
      return;
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue?.[field];
      const existingUser = await User.findOne({ [field]: value }).select('firstName lastName');
      const name = existingUser ? `${existingUser.firstName} ${existingUser.lastName || ''}`.trim() : 'another user';
      const message = `${field === 'phone' ? 'Phone' : field} already exists with ${name}`;
      res.status(400).json({
        error: 'Validation error',
        details: { [field]: [message] }
      });
      return;
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
      res.status(400).json({ error: 'Validation error', details });
      return;
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue?.[field];
      const existingUser = await User.findOne({ [field]: value }).select('firstName lastName');
      const name = existingUser ? `${existingUser.firstName} ${existingUser.lastName || ''}`.trim() : 'another user';
      const message = `${field === 'phone' ? 'Phone' : field} already exists with ${name}`;
      res.status(400).json({
        error: 'Validation error',
        details: { [field]: [message] }
      });
      return;
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
    res.status(400).json({
      error: 'User has dependents',
      hasDependents: true,
      dependentsCount: allDescendants.length,
      dependents: allDescendants.map((c) => ({ id: c._id, name: `${c.firstName} ${c.lastName || ''}`.trim() })),
    });
    return;
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
  // `role: 'member'` excludes shadow community_admin users (and any super_admin)
  // from the member directory. Real members — including family heads — are 'member'.
  const filter: Record<string, unknown> = { isBlocked: { $ne: true }, role: 'member' };

  if (communityId) filter.communityIds = communityId;
  if (filters?.gender) filter.gender = filters.gender;
  if (filters?.bloodGroup) filter.bloodGroup = filters.bloodGroup;
  if (filters?.locality) {
    const parts = filters.locality.split(',').map((s: string) => s.trim()).filter(Boolean);
    filter['address.locality'] = parts.length > 1 ? { $in: parts } : parts[0];
  }
  if (filters?.city) filter['address.city'] = filters.city;
  if (filters?.district) filter['address.district'] = filters.district;
  if (filters?.nativePlace) filter.nativePlace = filters.nativePlace;
  if (filters?.nativeDistrict) filter.nativeDistrict = filters.nativeDistrict;
  if (filters?.isFamilyHead !== undefined) filter.isFamilyHead = filters.isFamilyHead;
  if (filters?.hasSpecialEducation) filter.specialEducation = { $exists: true, $ne: '' };
  const marriedClauses: Record<string, unknown>[] = [];
  if (filters?.isMarried !== undefined) marriedClauses.push(buildMarriedClause(filters.isMarried));

  const ageFilter = buildAgeFilter(filters?.ageMin, filters?.ageMax);
  if (ageFilter) filter.dob = ageFilter;
  if (marriedClauses.length) filter.$and = marriedClauses;

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
const EXPORT_SELECT = 'firstName lastName fullName phone address.fullAddress address.city address.district address.pincode address.locality';
const EXPORT_MAX_ROWS = 10000;

// Only accept plain string query params — Express' extended query parser
// turns `?gender[$ne]=x` into an object, which must never reach a Mongo filter.
function queryString(value: unknown, maxLen = 200): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLen) return undefined;
  return trimmed;
}

function queryBoolean(value: unknown): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function queryAge(value: unknown): number | undefined {
  const raw = queryString(value, 3);
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > 150) return undefined;
  return n;
}

async function buildCommunityMembersFilter(
  communityId: string,
  query: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  // `role: 'member'` excludes shadow community_admin users from member listings/exports.
  const filter: Record<string, unknown> = { communityIds: communityId, isBlocked: { $ne: true }, role: 'member' };

  const gender = queryString(query.gender);
  const bloodGroup = queryString(query.bloodGroup);
  const locality = queryString(query.locality);
  const isAlive = queryBoolean(query.isAlive);
  const isMarried = queryBoolean(query.isMarried);
  const isFamilyHead = queryBoolean(query.isFamilyHead);
  const hasSpecialEducation = queryBoolean(query.hasSpecialEducation);

  if (gender) filter.gender = gender;
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (locality) {
    const parts = locality.split(',').map((s) => s.trim()).filter(Boolean);
    filter['address.locality'] = parts.length > 1 ? { $in: parts } : parts[0];
  }
  if (isAlive !== undefined) filter.isAlive = isAlive;
  if (isMarried !== undefined) filter.$and = [buildMarriedClause(isMarried)];
  if (isFamilyHead !== undefined) filter.isFamilyHead = isFamilyHead;
  if (hasSpecialEducation) filter.specialEducation = { $exists: true, $ne: '' };

  const ageFilter = buildAgeFilter(queryAge(query.ageMin), queryAge(query.ageMax));
  if (ageFilter) filter.dob = ageFilter;

  const businessCategory = queryString(query.businessCategory);
  if (businessCategory) {
    const ownerIds = await Business.distinct('ownerId', {
      category: businessCategory,
      communityId,
    });
    filter._id = { $in: ownerIds };
  }

  return filter;
}

export async function getUsersByCommunity(req: AuthRequest, res: Response): Promise<void> {
  const { communityId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;
  const search = queryString(req.query.search) ?? '';

  const filter = await buildCommunityMembersFilter(communityId, req.query);

  if (search) {
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

// Full (non-paginated) member list for exports. Same filters + fuzzy search as
// the paginated listing, so the export matches exactly what the admin filtered.
export async function exportUsersByCommunity(req: AuthRequest, res: Response): Promise<void> {
  const { communityId } = req.params;
  const search = queryString(req.query.search) ?? '';

  const filter = await buildCommunityMembersFilter(communityId, req.query);

  let users;
  if (search) {
    const candidates = await User.find(filter)
      .select(EXPORT_SELECT)
      .limit(CANDIDATE_CAP);
    users = fuzzyFilterAndPaginate(candidates, search, 1, EXPORT_MAX_ROWS).items;
  } else {
    users = await User.find(filter)
      .select(EXPORT_SELECT)
      .sort({ firstName: 1 })
      .limit(EXPORT_MAX_ROWS)
      .lean();
  }

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    users,
    total: users.length,
    truncated: !search && total > EXPORT_MAX_ROWS,
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


/* ---------- Member self-service profile edit (approval-gated) ---------- */

/** Fields a member is allowed to propose changes to. Anything else is dropped. */
const PROFILE_EDIT_FIELDS = [
  'firstName', 'lastName', 'profilePicture', 'guardianName', 'dob', 'weddingDate', 'gender',
  'email', 'education', 'specialEducation', 'bloodGroup', 'hobbies', 'achievements',
  'nativePlace', 'nativeDistrict', 'nanihaal', 'aadharLast4', 'address',
] as const;

function toComparable(v: unknown): unknown {
  if (v instanceof Date) return v.toISOString();
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (val !== undefined && val !== null && val !== '') out[k] = toComparable(val);
    }
    return out;
  }
  return v;
}

/**
 * POST /users/me/profile-edit
 * Member submits changes to their own profile. Requires a fresh action token
 * (OTP re-verified). Nothing is written to the User; an ApprovalRequest is
 * created for the community admin. Only one pending edit at a time.
 */
export async function submitProfileEdit(req: AuthRequest, res: Response): Promise<void> {
  const parsed = submitProfileEditSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const userId = user._id.toString();

  if (!verifyActionToken(parsed.data.actionToken, userId, 'profile_edit')) {
    res.status(403).json({ error: 'Verification expired. Please verify OTP again.' });
    return;
  }

  const communityId = user.communityIds?.[0];
  if (!communityId) {
    res.status(400).json({ error: 'Your account is not linked to a community' });
    return;
  }

  // Diff against current values so admins only review what actually changed.
  const current = user.toObject() as Record<string, unknown>;
  const changes: Record<string, unknown> = {};
  const previous: Record<string, unknown> = {};
  for (const field of PROFILE_EDIT_FIELDS) {
    if (!(field in parsed.data.changes)) continue;
    const next = (parsed.data.changes as Record<string, unknown>)[field];
    const before = toComparable(current[field]);
    const after = toComparable(next);
    // Dates arrive as yyyy-mm-dd strings; compare on the date part only.
    const norm = (x: unknown) =>
      typeof x === 'string' && /^\d{4}-\d{2}-\d{2}/.test(x) ? x.slice(0, 10) : JSON.stringify(x ?? null);
    if (norm(before) !== norm(after)) {
      changes[field] = next;
      previous[field] = current[field] ?? null;
    }
  }

  if (Object.keys(changes).length === 0) {
    res.status(400).json({ error: 'No changes detected' });
    return;
  }

  const existing = await ApprovalRequest.findOne({
    entityType: 'profile_edit',
    entityId: userId,
    status: 'pending',
  });
  if (existing) {
    res.status(409).json({
      error: 'You already have changes waiting for approval. Please wait for the admin to review them.',
      requestId: existing._id.toString(),
    });
    return;
  }

  const request = await ApprovalRequest.create({
    entityType: 'profile_edit',
    entityId: userId,
    communityId,
    requestedBy: user._id,
    payload: { changes, previous },
  });

  const requesterName = user.fullName ?? user.firstName ?? 'A member';
  await notifyCommunityAdmins(
    communityId.toString(),
    'approval_request',
    'Profile edit request',
    `${requesterName} requested changes to their profile`,
    { approvalRequestId: request._id.toString(), entityType: 'profile_edit' },
    request._id.toString(),
  );

  res.status(201).json({ success: true, request });
}

/**
 * GET /users/me/profile-edit
 * Latest profile-edit request for the caller, so the app can show
 * "pending approval" / "rejected" state.
 */
export async function getMyProfileEditStatus(req: AuthRequest, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const request = await ApprovalRequest.findOne({
    entityType: 'profile_edit',
    entityId: user._id.toString(),
  })
    .sort({ createdAt: -1 })
    .populate('reviewedBy', 'firstName lastName fullName');

  res.json({ success: true, request: request ?? null });
}
