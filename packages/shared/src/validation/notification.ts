import { z } from 'zod';

export const registerPushTokenSchema = z.object({
  token: z.string().min(1, 'Push token is required'),
  platform: z.enum(['ios', 'android', 'web']),
});
