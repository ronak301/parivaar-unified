import { z } from 'zod';

const addressSchema = z.object({
  fullAddress: z.string().max(500).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  pincode: z
    .string()
    .regex(/^[0-9]{6}$/, 'Pincode must be 6 digits')
    .optional(),
  locality: z.string().max(200).optional(),
});

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional(),
  guardianName: z.string().max(200).optional(),
  dob: z.string().optional(),
  weddingDate: z.string().optional(),
  isMarried: z.boolean().optional(),
  gender: z.string().optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,13}$/, 'Invalid phone number')
    .optional(),
  email: z.string().email('Invalid email').optional(),
  education: z.string().max(200).optional(),
  specialEducation: z.string().max(200).optional(),
  bloodGroup: z.string().optional(),
  hobbies: z.string().max(500).optional(),
  achievements: z.string().max(500).optional(),
  nativePlace: z.string().max(200).optional(),
  nativeDistrict: z.string().max(200).optional(),
  nanihaal: z.string().max(200).optional(),
  aadharLast4: z
    .string()
    .regex(/^[0-9]{4}$/, 'Must be last 4 digits')
    .optional(),
  address: addressSchema.optional(),
  isFamilyHead: z.boolean().optional(),
  familyId: z.string().optional(),
  communityIds: z.array(z.string()).optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const searchUsersSchema = z.object({
  query: z.string().max(200).optional(),
  communityId: z.string(),
  filters: z
    .object({
      bloodGroup: z.string().optional(),
      gender: z.string().optional(),
      locality: z.string().optional(),
      businessCategory: z.string().optional(),
      ageMin: z.number().min(0).max(150).optional(),
      ageMax: z.number().min(0).max(150).optional(),
      nativePlace: z.string().optional(),
      nativeDistrict: z.string().optional(),
      sampradaya: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      isFamilyHead: z.boolean().optional(),
    })
    .optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});
