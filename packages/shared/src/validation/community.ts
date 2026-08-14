import { z } from 'zod';

export const designationSchema = z.object({
  name: z.string().min(1).max(200),
  sansthan: z.string().max(200).optional(),
  designation: z.string().min(1).max(200),
  year: z.string().min(4).max(10),
});

export const communityFeaturesSchema = z.object({
  welcomeScreen: z.boolean().optional(),
  aboutScreenExtraInfo: z.boolean().optional(),
  showOnlyHeadsInAllMembers: z.boolean().optional(),
});

export const createCommunitySchema = z.object({
  name: z.string().min(1, 'Community name is required').max(200),
  description: z.string().max(1000).optional(),
  contactPersonName: z.string().max(200).optional(),
  contactPersonNumber: z.string().max(15).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  subType: z.string().optional(),
  showFamilyMembers: z.enum(['ALL', 'SINGLE', 'SPOUSE', 'SPOUSE_AND_KIDS']).optional(),
  designations: z.array(designationSchema).max(100).optional(),
  features: communityFeaturesSchema.optional(),
  localities: z.array(z.string().min(1).max(200)).max(500).optional(),
});

export const updateCommunitySchema = createCommunitySchema.partial();
