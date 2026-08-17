import { z } from 'zod';

export const createMatrimonialSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  communityId: z.string().min(1, 'Community ID is required'),
  biodataFile: z.string().url('Invalid biodata file URL').optional(),
});
