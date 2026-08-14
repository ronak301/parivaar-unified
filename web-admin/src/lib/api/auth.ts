import client from './client';

export async function sendOtp(phone: string) {
  return client.post('/auth/send-otp', { phone });
}

export async function verifyOtp(
  phone: string,
  otp: string,
  verificationId: string,
) {
  return client.post('/auth/verify-otp', { phone, otp, verificationId });
}
