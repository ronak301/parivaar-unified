import type { Response } from 'express';
import { Types } from 'mongoose';
import {
  createBusinessSchema,
  updateBusinessSchema,
  createEnquirySchema,
  createPromotionSchema,
  submitBusinessSchema,
  ExcludeBusinessTypes,
} from '@parivaar/shared';
import type { AuthRequest } from '../middleware';
import { User, Business, BusinessEnquiry, BusinessPromotion, ApprovalRequest } from '../models';
import { notifyCommunityAdmins } from '../services/notification';
import { searchBusinesses } from '../services/business-search';
import { requireFeedEnabled } from '../services/community-features';

export async function createBusiness(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createBusinessSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { ownerId, ...data } = parsed.data;
  let resolvedOwnerId = req.user?._id;

  if (ownerId) {
    const isAdmin = req.user?.role === 'super_admin' || req.user?.role === 'community_admin';
    if (!isAdmin) {
      res.status(403).json({ error: 'Not authorized to set business owner' });
      return;
    }
    const owner = await User.findById(ownerId);
    if (!owner) {
      res.status(404).json({ error: 'Owner not found' });
      return;
    }
    resolvedOwnerId = owner._id;
  }

  try {
    const business = await Business.create({
      ...data,
      ownerId: resolvedOwnerId,
    });

    res.status(201).json({ success: true, business });
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
      const message = `${field} already exists`;
      res.status(400).json({
        error: 'Validation error',
        details: { [field]: [message] }
      });
      return;
    }

    console.error('Business create error:', err);
    res.status(500).json({ error: 'Failed to create business' });
  }
}

const OWNER_PUBLIC_FIELDS = 'firstName lastName fullName profilePicture phone showPhoneInCommunity';

/**
 * Members may opt out of sharing their phone with the community. When a
 * business has no phone of its own the UI falls back to the owner's, so the
 * owner's number must be removed here whenever they have hidden it.
 */
function redactOwnerPhone(doc: { toObject(): unknown } | Record<string, unknown>): Record<string, unknown> {
  const obj = (typeof (doc as { toObject?: unknown }).toObject === 'function'
    ? (doc as { toObject(): unknown }).toObject()
    : { ...(doc as Record<string, unknown>) }) as Record<string, unknown>;
  // Copy the populated owner so we never mutate a shared/lean object in place.
  if (obj.ownerId && typeof obj.ownerId === 'object') obj.ownerId = { ...(obj.ownerId as Record<string, unknown>) };
  const owner = obj.ownerId as Record<string, unknown> | null | undefined;
  if (owner && typeof owner === 'object' && owner.showPhoneInCommunity === false) {
    delete owner.phone;
  }
  return obj;
}

export async function getBusiness(req: AuthRequest, res: Response): Promise<void> {
  const business = await Business.findById(req.params.id).populate('ownerId', OWNER_PUBLIC_FIELDS);

  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  res.json({ success: true, business: redactOwnerPhone(business) });
}

export async function updateBusiness(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateBusinessSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const business = await Business.findById(req.params.id);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  const isOwner = business.ownerId.toString() === req.user?._id.toString();
  const isAdmin = req.user?.role === 'super_admin' || req.user?.role === 'community_admin';
  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }

  try {
    Object.assign(business, parsed.data);
    await business.save();

    res.json({ success: true, business });
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
      const message = `${field} already exists`;
      res.status(400).json({
        error: 'Validation error',
        details: { [field]: [message] }
      });
      return;
    }

    console.error('Business update error:', err);
    res.status(500).json({ error: 'Failed to update business' });
  }
}

export async function deleteBusiness(req: AuthRequest, res: Response): Promise<void> {
  const business = await Business.findByIdAndDelete(req.params.id);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  res.json({ success: true, message: 'Business deleted' });
}

export async function getBusinessByOwner(req: AuthRequest, res: Response): Promise<void> {
  const business = await Business.findOne({ ownerId: req.params.userId });
  res.json({ success: true, business: business || null });
}

// Migrated records include placeholder rows (no name, no category, or a
// non-business type like HomeMaker) that would render as empty cards.
function listedBusinessFilter(communityId: string): Record<string, unknown> {
  return {
    communityId,
    category: { $nin: [...ExcludeBusinessTypes, null, ''] },
    $or: [
      { name: { $nin: [null, ''] } },
      { description: { $nin: [null, ''] } },
      { address: { $nin: [null, ''] } },
      { phone: { $nin: [null, ''] } },
    ],
  };
}

export async function getBusinessCategoryCounts(req: AuthRequest, res: Response): Promise<void> {
  const { communityId } = req.params;
  const rows = await Business.aggregate<{ _id: string; count: number }>([
    { $match: { ...listedBusinessFilter(communityId), communityId: new Types.ObjectId(communityId) } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]);
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  res.json({ success: true, total, categories: rows.map((r) => ({ id: r._id, count: r.count })) });
}

export async function getBusinessesByCommunity(req: AuthRequest, res: Response): Promise<void> {
  const { communityId } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;

  const filter = listedBusinessFilter(communityId);
  const category = typeof req.query.category === 'string' ? req.query.category.trim().slice(0, 100) : '';
  if (category && !ExcludeBusinessTypes.includes(category)) filter.category = category;

  const rawQuery = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 200) : '';

  if (rawQuery) {
    // Ranked in-process search over the community's businesses: matches name,
    // category (label + synonyms, Hinglish), description, owner and address,
    // with typo tolerance. Community lists are small enough to score fully.
    const MAX_SCAN = 2000;
    const candidates = await Business.find(filter)
      .populate('ownerId', OWNER_PUBLIC_FIELDS)
      .limit(MAX_SCAN)
      .lean();

    const { results, inferredCategories } = searchBusinesses(
      candidates as unknown as Array<Record<string, unknown> & { _id: unknown }>,
      rawQuery,
    );
    const total = results.length;
    const pageItems = results.slice(skip, skip + limit).map((r) => ({
      ...redactOwnerPhone(r.business as Record<string, unknown>),
      _match: { score: Math.round(r.score * 10) / 10, on: r.matchedOn },
    }));

    res.json({
      success: true,
      businesses: pageItems,
      inferredCategories,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
    return;
  }

  // Named businesses first (A–Z), then the ones that only have a description/address.
  const [rows, total] = await Promise.all([
    Business.aggregate<Record<string, unknown>>([
      { $match: { ...filter, communityId: new Types.ObjectId(communityId) } },
      { $addFields: { _unnamed: { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ['$name', ''] } }, 0] }, 0, 1] } } },
      { $sort: { _unnamed: 1, name: 1, _id: 1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { _unnamed: 0 } },
    ]),
    Business.countDocuments(filter),
  ]);
  // `lean` so the populated owner is a plain object; a hydrated document would
  // serialise its internal wrapper instead of the selected fields.
  const businesses = await Business.populate(rows, {
    path: 'ownerId',
    select: OWNER_PUBLIC_FIELDS,
    options: { lean: true },
  });

  res.json({
    success: true,
    businesses: businesses.map((b) => redactOwnerPhone(b as unknown as Record<string, unknown>)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function createEnquiry(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createEnquirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }
  if (!(await requireFeedEnabled(req, res, parsed.data.communityId))) return;

  const enquiry = await BusinessEnquiry.create({
    ...parsed.data,
    userId: req.user?._id,
  });

  const approval = await ApprovalRequest.create({
    entityType: 'business_enquiry',
    entityId: enquiry._id.toString(),
    communityId: parsed.data.communityId,
    requestedBy: req.user?._id,
    payload: parsed.data,
  });

  const requesterName = req.user?.fullName ?? req.user?.firstName ?? 'A member';
  await notifyCommunityAdmins(
    parsed.data.communityId,
    'approval_request',
    'New business enquiry',
    `${requesterName} submitted a business enquiry for review`,
    { approvalRequestId: approval._id.toString(), entityType: 'business_enquiry' },
    approval._id.toString(),
  );

  res.status(201).json({ success: true, enquiry });
}

/** Member-submitted business: nothing is created until an admin approves. */
export async function submitBusiness(req: AuthRequest, res: Response): Promise<void> {
  const parsed = submitBusinessSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const communityId = user.communityIds?.[0];
  if (!communityId) {
    res.status(400).json({ error: 'Your account is not linked to a community' });
    return;
  }
  if (!(await requireFeedEnabled(req, res, communityId.toString()))) return;

  const existing = await Business.findOne({ ownerId: user._id }).select('_id');
  if (existing) {
    res.status(409).json({ error: 'You already have a business listed. Edit it from your profile instead.' });
    return;
  }

  const pending = await ApprovalRequest.findOne({
    entityType: 'business',
    requestedBy: user._id,
    status: 'pending',
  }).select('_id');
  if (pending) {
    res.status(409).json({ error: 'Your business is already waiting for admin approval.' });
    return;
  }

  const request = await ApprovalRequest.create({
    entityType: 'business',
    communityId,
    requestedBy: user._id,
    payload: parsed.data,
  });

  const requesterName = user.fullName ?? user.firstName ?? 'A member';
  await notifyCommunityAdmins(
    communityId.toString(),
    'approval_request',
    'New business listing',
    `${requesterName} submitted "${parsed.data.name}" for review`,
    { approvalRequestId: request._id.toString(), entityType: 'business' },
    request._id.toString(),
  );

  res.status(201).json({ success: true, request });
}

export async function createPromotion(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createPromotionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const promotion = await BusinessPromotion.create({
    ...parsed.data,
    userId: req.user?._id,
  });

  const approval = await ApprovalRequest.create({
    entityType: 'business_promotion',
    entityId: promotion._id.toString(),
    communityId: parsed.data.communityId,
    requestedBy: req.user?._id,
    payload: parsed.data,
  });

  const requesterName = req.user?.fullName ?? req.user?.firstName ?? 'A member';
  await notifyCommunityAdmins(
    parsed.data.communityId,
    'approval_request',
    'New business promotion',
    `${requesterName} submitted a business promotion for review`,
    { approvalRequestId: approval._id.toString(), entityType: 'business_promotion' },
    approval._id.toString(),
  );

  res.status(201).json({ success: true, promotion });
}

export async function getEnquiries(req: AuthRequest, res: Response): Promise<void> {
  const { communityId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { communityId };
  if (req.query.status) filter.status = req.query.status;

  const [enquiries, total] = await Promise.all([
    BusinessEnquiry.find(filter)
      .populate('userId', 'firstName lastName fullName profilePicture phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    BusinessEnquiry.countDocuments(filter),
  ]);

  res.json({
    success: true,
    enquiries,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function getPromotions(req: AuthRequest, res: Response): Promise<void> {
  const { communityId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { communityId };
  if (req.query.status) filter.status = req.query.status;

  const [promotions, total] = await Promise.all([
    BusinessPromotion.find(filter)
      .populate('userId', 'firstName lastName fullName')
      .populate('businessId', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    BusinessPromotion.countDocuments(filter),
  ]);

  res.json({
    success: true,
    promotions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
