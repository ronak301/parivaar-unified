import type { Response } from 'express';
import { createBusinessSchema, updateBusinessSchema, createEnquirySchema, createPromotionSchema } from '@parivaar/shared';
import type { AuthRequest } from '../middleware';
import { User, Business, BusinessEnquiry, BusinessPromotion, ApprovalRequest } from '../models';
import { notifyCommunityAdmins } from '../services/notification';

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

export async function getBusiness(req: AuthRequest, res: Response): Promise<void> {
  const business = await Business.findById(req.params.id)
    .populate('ownerId', 'firstName lastName fullName profilePicture phone');

  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  res.json({ success: true, business });
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

export async function getBusinessesByCommunity(req: AuthRequest, res: Response): Promise<void> {
  const { communityId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { communityId };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.q) filter.$text = { $search: req.query.q as string };

  const [businesses, total] = await Promise.all([
    Business.find(filter)
      .populate('ownerId', 'firstName lastName fullName')
      .sort(req.query.q ? { score: { $meta: 'textScore' } } : { name: 1 })
      .skip(skip)
      .limit(limit),
    Business.countDocuments(filter),
  ]);

  res.json({
    success: true,
    businesses,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function createEnquiry(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createEnquirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

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
