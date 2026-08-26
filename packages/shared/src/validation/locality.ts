import { z } from 'zod';

export const localitySuggestQuerySchema = z.object({
  city: z
    .string()
    .trim()
    .min(2, 'City name must be at least 2 characters')
    .max(100, 'City name must be at most 100 characters')
    .regex(/^[A-Za-z][A-Za-z\s.'-]*$/, 'City name contains invalid characters'),
  excludeCommunityId: z.string().max(100).optional(),
});
