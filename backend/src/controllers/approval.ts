import type { Response } from 'express';
import type { AuthRequest } from '../middleware';
import { ApprovalRequest } from '../models';

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
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400).json({ error: 'Status must be approved or rejected' });
    return;
  }

  const existing = await ApprovalRequest.findById(id);
  if (!existing) {
    res.status(404).json({ error: 'Approval request not found' });
    return;
  }

  const isSuperAdmin = req.user?.role === 'super_admin';
  const inScope = req.user?.communityIds.some(
    (communityId) => communityId.toString() === existing.communityId.toString(),
  );
  if (!isSuperAdmin && !inScope) {
    res.status(403).json({ error: 'Not authorized for this community' });
    return;
  }

  existing.status = status;
  existing.reviewedBy = req.user?._id;
  await existing.save();

  res.json({ success: true, request: existing });
}

export async function createApprovalRequest(req: AuthRequest, res: Response): Promise<void> {
  const { entityType, entityId, communityId, payload } = req.body;

  const request = await ApprovalRequest.create({
    entityType,
    entityId,
    communityId,
    requestedBy: req.user?._id,
    payload,
  });

  res.status(201).json({ success: true, request });
}
