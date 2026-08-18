import { z } from 'zod';
import { createUserSchema } from './user';

export const createFamilySchema = z.object({
  headId: z.string().min(1, 'Head member ID is required'),
  sampradaya: z.enum(['Sthanak', 'Mandrimargi', 'Terapanthi']).optional(),
  communityIds: z.array(z.string()).min(1, 'At least one community is required'),
});

export const addFamilyMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  relation: z.enum(['father', 'mother', 'spouse', 'child', 'son', 'daughter']).optional(),
  relativeId: z.string().optional(),
});

export const changeFamilyHeadSchema = z.object({
  newHeadId: z.string().min(1, 'New head member ID is required'),
});

const batchAddMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().max(100).optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  relation: z.enum(['son', 'daughter', 'spouse']),
  relativeId: z.string().optional(),
  relativeIndex: z.number().int().min(0).optional(),
}).refine((m) => Boolean(m.relativeId) !== (m.relativeIndex !== undefined), {
  message: 'Provide exactly one of relativeId or relativeIndex',
});

export const addFamilyMembersSchema = z.object({
  members: z.array(batchAddMemberSchema).min(1).max(20),
});

const batchMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().max(100).optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  gender: z.string().optional(),
  relation: z.enum(['father', 'mother', 'spouse', 'child', 'son', 'daughter']).optional(),
  relativeIndex: z.number().int().min(-1).optional(),
});

export const batchCreateFamilySchema = z.object({
  head: createUserSchema,
  communityIds: z.array(z.string()).min(1, 'At least one community is required'),
  sampradaya: z.enum(['Sthanak', 'Mandrimargi', 'Terapanthi']).optional(),
  business: z.object({
    name: z.string().min(1),
    category: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    instagramProfile: z.string().optional(),
    linkedinProfile: z.string().optional(),
    googleMapsLink: z.string().optional(),
    logo: z.string().optional(),
    photos: z.array(z.string()).optional(),
  }).optional(),
  members: z.array(batchMemberSchema).max(20).optional(),
});
