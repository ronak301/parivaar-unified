import type { Response } from 'express';
import { createBusinessSchema, updateBusinessSchema, createEnquirySchema, createPromotionSchema } from '@parivaar/shared';
import type { AuthRequest } from '../middleware';
import { Business, BusinessEnquiry, BusinessPromotion } from '../models';

export async function createBusiness(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createBusinessSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const business = await Business.create({
    ...parsed.data,
    ownerId: req.user?._id,
  });

  res.status(201).json({ success: true, business });
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

  Object.assign(business, parsed.data);
  await business.save();

  res.json({ success: true, business });
}

export async function deleteBusiness(req: AuthRequest, res: Response): Promise<void> {
  const business = await Business.findByIdAndDelete(req.params.id);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  res.json({ success: true, message: 'Business deleted' });
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

  res.status(201).json({ success: true, promotion });
}
