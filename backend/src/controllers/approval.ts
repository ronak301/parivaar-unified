import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { createApprovalRequestSchema, reviewApprovalSchema, publicSubmitFamilySchema } from '@parivaar/shared';
import type { AuthRequest } from '../middleware';
import { ApprovalRequest, Community } from '../models';
import { applyApprovalEffect } from '../services/approval-effects';
import { createNotification, notifyCommunityAdmins } from '../services/notification';

export async function getApprovalRequests(req: AuthRequest, res: Response): Promise<void> {
  const { communityId } = req.params;
  const status = (req.query.status as string) || 'pending';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { communityId, status };
  if (req.query.entityType) filter.entityType = req.query.entityType;

  const [requests, total] = await Promise.all([
    ApprovalRequest.find(filter)
      .populate('requestedBy', 'firstName lastName fullName phone')
      .populate('reviewedBy', 'firstName lastName fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ApprovalRequest.countDocuments(filter),
  ]);

  res.json({
    success: true,
    requests,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function reviewApproval(req: AuthRequest, res: Response): Promise<void> {
  const parsed = reviewApprovalSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { id } = req.params;
  const { status, remarks } = parsed.data;

  const existing = await ApprovalRequest.findById(id);
  if (!existing) {
    res.status(404).json({ error: 'Approval request not found' });
    return;
  }

  if (existing.status !== 'pending') {
    res.status(400).json({ error: 'Request has already been reviewed' });
    return;
  }

  const isSuperAdmin = req.user?.role === 'super_admin';
  const inScope = req.user?.communityIds?.some(
    (communityId) => communityId.toString() === existing.communityId.toString(),
  ) ?? false;
  if (!isSuperAdmin && !inScope) {
    res.status(403).json({ error: 'Not authorized for this community' });
    return;
  }

  existing.status = status;
  if (req.user?._id) {
    if (typeof req.user._id === 'string') {
      if (mongoose.Types.ObjectId.isValid(req.user._id)) {
        existing.reviewedBy = new mongoose.Types.ObjectId(req.user._id);
      }
    } else {
      existing.reviewedBy = req.user._id;
    }
  }
  if (remarks) existing.remarks = remarks;
  await existing.save();

  await applyApprovalEffect(existing);

  if (existing.requestedBy) {
    const entityLabel = existing.entityType.replace(/_/g, ' ');
    await createNotification({
      userId: existing.requestedBy.toString(),
      communityId: existing.communityId.toString(),
      type: 'approval_result',
      title: `Your ${entityLabel} request was ${status}`,
      body: remarks,
      data: { approvalRequestId: existing._id.toString(), entityType: existing.entityType },
      approvalRequestId: existing._id.toString(),
    });
  }

  res.json({ success: true, request: existing });
}

export async function createApprovalRequest(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createApprovalRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { entityType, entityId, communityId, payload } = parsed.data;

  const request = await ApprovalRequest.create({
    entityType,
    entityId,
    communityId,
    requestedBy: req.user?._id,
    payload,
  });

  const entityLabel = entityType.replace(/_/g, ' ');
  const requesterName = req.user?.fullName ?? req.user?.firstName ?? 'A member';
  await notifyCommunityAdmins(
    communityId,
    'approval_request',
    `New ${entityLabel} request`,
    `${requesterName} submitted a ${entityLabel} request for review`,
    { approvalRequestId: request._id.toString(), entityType },
    request._id.toString(),
  );

  res.status(201).json({ success: true, request });
}

// PUBLIC, unauthenticated endpoint: anyone with a community link can submit a
// new family for admin approval. No requestedBy user exists for this path —
// submitter contact info (if provided) is carried in the payload instead.
export async function submitPublicFamilyRequest(req: Request, res: Response): Promise<void> {
  const parsed = publicSubmitFamilySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { communityId, head, sampradaya, business, members, submitterName, submitterPhone } = parsed.data;

  if (head.phone && members?.some(m => m.phone === head.phone)) {
    res.status(400).json({ error: 'Phone number already exists (family head has this number)' });
    return;
  }

  if (members) {
    const phoneNumbers = members.map(m => m.phone).filter(Boolean);
    const duplicates = phoneNumbers.filter((phone, index) => phoneNumbers.indexOf(phone) !== index);
    if (duplicates.length > 0) {
      res.status(400).json({ error: `Duplicate phone number found in members: ${duplicates[0]}` });
      return;
    }
  }

  const community = await Community.findById(communityId);
  if (!community) {
    res.status(404).json({ error: 'Community not found' });
    return;
  }

  try {
    const request = await ApprovalRequest.create({
      entityType: 'new_family',
      communityId,
      payload: { head, communityIds: [communityId], sampradaya, business, members, submitterName, submitterPhone },
    });

    const requesterName = submitterName || head.firstName || 'Someone';
    await notifyCommunityAdmins(
      communityId,
      'approval_request',
      'New family registration request',
      `${requesterName} submitted a new family for review`,
      { approvalRequestId: request._id.toString(), entityType: 'new_family' },
      request._id.toString(),
    );

    res.status(201).json({ success: true, requestId: request._id.toString() });
  } catch (err: any) {
    if (err.code === 11000 && err.keyPattern?.phone) {
      res.status(400).json({ error: 'This phone number is already registered. Please use a different number.' });
      return;
    }
    throw err;
  }
}
