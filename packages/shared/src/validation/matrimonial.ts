import { z } from 'zod';

export const createMatrimonialSchema = z.object({
  communityId: z.string().min(1, 'Community ID is required'),
  name: z.string().trim().min(1, 'Name is required').max(200),
  photo: z.string().url('Invalid photo URL').max(2000).optional(),
  biodataFile: z.string().url('Invalid biodata file URL').max(2000).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be yyyy-mm-dd').optional(),
  gender: z.enum(['Male', 'Female']).optional(),
  qualification: z.string().trim().max(200).optional(),
  /** Optional link to an existing member record. */
  userId: z.string().optional(),
});
