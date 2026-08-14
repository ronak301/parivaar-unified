import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(13, 'Phone number is too long')
  .regex(/^\+?[0-9]{10,13}$/, 'Invalid phone number format');

export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^[0-9]{6}$/, 'OTP must contain only digits');

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
  verificationId: z.string().min(1, 'Verification ID is required'),
});
