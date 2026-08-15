import { z } from 'zod';

export const phoneSchema = z
  .string()
  .length(10, 'Phone number must be exactly 10 digits')
  .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits');

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
