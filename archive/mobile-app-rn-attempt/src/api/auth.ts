import apiClient from './client';

interface SendOtpResponse {
  success: boolean;
  verificationId: string;
}

interface VerifyOtpResponse {
  success: boolean;
  token: string;
  user: {
    _id: string;
    enrollmentId: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    communityIds: string[];
    profilePicture?: string;
  };
  isNewUser: boolean;
}

export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  const { data } = await apiClient.post<SendOtpResponse>('/auth/send-otp', { phone });
  return data;
}

export async function verifyOtp(
  phone: string,
  otp: string,
  verificationId: string,
): Promise<VerifyOtpResponse> {
  const { data } = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', {
    phone,
    otp,
    verificationId,
  });
  return data;
}
