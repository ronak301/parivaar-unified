import { z } from 'zod';

export const createCommunitySchema = z.object({
  name: z.string().min(1, 'Community name is required').max(200),
  description: z.string().max(1000).optional(),
  contactPersonName: z.string().max(200).optional(),
  contactPersonNumber: z.string().max(15).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  type: z.string().optional(),
  subType: z.string().optional(),
});

export const updateCommunitySchema = createCommunitySchema.partial();

export const designationSchema = z.object({
  name: z.string().min(1).max(200),
  sansthan: z.string().max(200).optional(),
  designation: z.string().min(1).max(200),
  year: z.string().min(4).max(10),
});
