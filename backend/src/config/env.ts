import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  REDIS_ENABLED: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('30d'),
  MESSAGE_CENTRAL_AUTH_TOKEN: z.string().min(1),
  MESSAGE_CENTRAL_CUSTOMER_ID: z.string().min(1),
  MESSAGE_CENTRAL_COUNTRY_CODE: z.string().default('91'),
  MESSAGE_CENTRAL_OTP_LENGTH: z.string().default('6'),
  EXPO_ACCESS_TOKEN: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional(),
  PORT: z
    .string()
    .transform(Number)
    .default('3001'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:8081'),
  SUPER_ADMIN_PHONE: z.string().optional(),
  NODE_ENV: z.string().default('development'),
  DEV_OTP_BYPASS: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
