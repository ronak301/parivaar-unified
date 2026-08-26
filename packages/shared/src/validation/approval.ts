import { z } from 'zod';

const ENTITY_TYPES = [
  'profile_edit',
  'matrimonial',
  'business_enquiry',
  'business_promotion',
  'new_member',
  'death_marking',
  'family_head_change',
  'new_family',
] as const;

export const createApprovalRequestSchema = z.object({
  entityType: z.enum(ENTITY_TYPES),
  entityId: z.string().optional(),
  communityId: z.string().min(1),
  payload: z.record(z.unknown()).optional(),
});

export const reviewApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  remarks: z.string().max(500).optional(),
});
