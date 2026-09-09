import { z } from 'zod';

/** Query-string boolean: "true"/"false" (or real booleans). Unlike z.coerce.boolean(),
 *  the string "false" becomes false instead of true. */
const queryBoolean = z.preprocess((v) => {
  if (v === 'true' || v === true) return true;
  if (v === 'false' || v === false) return false;
  return undefined;
}, z.boolean().optional());

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
  profilePicture: z.string().url().optional(),
  guardianName: z.string().max(200).optional(),
  dob: z.string().optional(),
  weddingDate: z.string().optional(),
  isMarried: z.boolean().optional(),
  gender: z.string().optional(),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
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
  showPhoneInCommunity: z.boolean().optional(),
  showBusinessInCommunity: z.boolean().optional(),
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
      ageMin: z.coerce.number().min(0).max(150).optional(),
      ageMax: z.coerce.number().min(0).max(150).optional(),
      nativePlace: z.string().optional(),
      nativeDistrict: z.string().optional(),
      sampradaya: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      isFamilyHead: queryBoolean,
      isMarried: queryBoolean,
      hasSpecialEducation: queryBoolean,
    })
    .optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/** Member-initiated profile edit. Goes through admin approval, never applied directly. */
export const submitProfileEditSchema = z.object({
  changes: updateUserSchema
    .omit({ isFamilyHead: true, familyId: true, communityIds: true, showPhoneInCommunity: true, showBusinessInCommunity: true })
    .refine((v) => Object.keys(v).length > 0, { message: 'No changes submitted' }),
  actionToken: z.string().min(1, 'Verification required'),
});
