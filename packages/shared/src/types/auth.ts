import type { UserRole } from './user';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  communityIds: string[];
  iat?: number;
  exp?: number;
}

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  jwt: string;
  userId: string;
  role: UserRole;
}
