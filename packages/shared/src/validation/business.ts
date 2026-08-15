import { z } from 'zod';

export const createBusinessSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(200),
  category: z.string().optional(),
  phone: z.string().max(15).optional(),
  website: z.string().url('Invalid URL').max(500).optional(),
  description: z.string().max(1000).optional(),
  address: z.string().max(500).optional(),
  instagramProfile: z.string().max(500).optional(),
  linkedinProfile: z.string().max(500).optional(),
  photos: z.array(z.string().url()).max(2).optional(),
  logo: z.string().url().optional(),
  googleMapsLink: z.string().url().max(500).optional(),
  communityId: z.string(),
  ownerId: z.string().optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial().omit({
  communityId: true,
});

export const createEnquirySchema = z.object({
  requirement: z.string().min(1, 'Requirement is required').max(1000),
  place: z.string().max(200).optional(),
  communityId: z.string(),
});

export const createPromotionSchema = z.object({
  businessId: z.string(),
  communityId: z.string(),
  name: z.string().min(1).max(200),
  place: z.string().max(200).optional(),
  photo: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  validity: z.string().optional(),
  amount: z.number().min(0).optional(),
});
