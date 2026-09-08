import type { Request, Response } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { sendOtpSchema, verifyOtpSchema, verifyActionOtpSchema, phoneSchema } from '@parivaar/shared';
import { env } from '../config/env';
import { setOTP, getOTP, deleteOTP } from '../config/redis';
import { User, type IUser } from '../models';
import type { AuthRequest } from '../middleware';
import { verifyPassword } from '../services/communityAdmin';

export async function me(req: AuthRequest, res: Response): Promise<void> {
  res.json({ success: true, user: req.user });
}

export async function checkPhone(req: Request, res: Response): Promise<void> {
  const parsed = z.object({ phone: phoneSchema }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid phone number' });
    return;
  }
  const user = await User.findOne({ phone: parsed.data.phone }).select('_id').lean();
  res.json({ exists: !!user });
}

// `phone` is really an identifier: the super-admin phone, or a community
// admin's username. Kept named `phone` for backward compatibility with the
// existing login form payload.
const adminLoginSchema = z.object({
  phone: z.string().min(1).max(64).trim(),
  password: z.string().min(1),
});

export async function adminLogin(req: Request, res: Response): Promise<void> {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { phone: identifier, password } = parsed.data;

  // 1. Super admin — env phone + env password.
  if (env.SUPER_ADMIN_PHONE && identifier === env.SUPER_ADMIN_PHONE) {
    if (password !== env.ADMIN_PASSWORD) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    try {
      await issueSessionAndRespond(identifier, res, 'super_admin');
    } catch {
      res.status(500).json({ error: 'Failed to create session' });
    }
    return;
  }

  // 2. Community admin — username + bcrypt-hashed password.
  const admin = await User.findOne({
    role: 'community_admin',
    adminUsername: identifier.toLowerCase(),
  });
  if (admin?.adminPasswordHash && (await verifyPassword(password, admin.adminPasswordHash))) {
    admin.lastSeen = new Date();
    await admin.save();
    respondWithSession(admin as IUser, res);
    return;
  }

  res.status(401).json({ error: 'Invalid credentials' });
}

const MESSAGE_CENTRAL_BASE = 'https://cpaas.messagecentral.com';
const OTP_TTL_SECONDS = 300;
const ADMIN_OTP_TTL_SECONDS = 180;
const ADMIN_OTP_VERIFICATION_ID = 'admin-otp';
const DEV_BYPASS_OTP = '000000';
const DEV_BYPASS_VERIFICATION_ID = 'dev-bypass';

const isDevOtpBypassActive = env.NODE_ENV !== 'production' && env.DEV_OTP_BYPASS;


type OtpSendResult = { ok: true; verificationId: string } | { ok: false; status: number; error: string };

/** Sends an OTP to `phone` (or arms the dev bypass) and stores the verificationId under `storeKey`. */
async function dispatchOtp(phone: string, storeKey: string): Promise<OtpSendResult> {
  if (isDevOtpBypassActive) {
    await setOTP(storeKey, { sentAt: Date.now(), verificationId: DEV_BYPASS_VERIFICATION_ID }, OTP_TTL_SECONDS);
    return { ok: true, verificationId: DEV_BYPASS_VERIFICATION_ID };
  }

  const tokenRes = await axios.get(`${MESSAGE_CENTRAL_BASE}/auth/v1/authentication/token`, {
    params: {
      customerId: env.MESSAGE_CENTRAL_CUSTOMER_ID,
      key: env.MESSAGE_CENTRAL_AUTH_TOKEN,
      scope: 'NEW',
      country: env.MESSAGE_CENTRAL_COUNTRY_CODE,
    },
  });
  const mcToken = tokenRes.data?.token;
  if (!mcToken) return { ok: false, status: 502, error: 'Failed to get auth token from MessageCentral' };

  const otpRes = await axios.post(`${MESSAGE_CENTRAL_BASE}/verification/v3/send`, null, {
    params: {
      countryCode: env.MESSAGE_CENTRAL_COUNTRY_CODE,
      customerId: env.MESSAGE_CENTRAL_CUSTOMER_ID,
      flowType: 'SMS',
      mobileNumber: phone,
      otpLength: env.MESSAGE_CENTRAL_OTP_LENGTH,
    },
    headers: { authToken: mcToken },
  });
  const verificationId = otpRes.data?.data?.verifyId;
  if (!verificationId) return { ok: false, status: 502, error: 'Failed to send OTP' };

  await setOTP(storeKey, { sentAt: Date.now(), verificationId }, OTP_TTL_SECONDS);
  return { ok: true, verificationId };
}

/** Validates `otp` against what was stored under `storeKey`. Consumes the entry on success. */
async function validateOtp(
  storeKey: string,
  otp: string,
  verificationId: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const stored = await getOTP(storeKey);
  if (!stored || stored.verificationId !== verificationId) {
    return { ok: false, status: 400, error: 'OTP expired or not found. Please request a new OTP.' };
  }

  if (isDevOtpBypassActive && verificationId === DEV_BYPASS_VERIFICATION_ID) {
    if (otp !== DEV_BYPASS_OTP) return { ok: false, status: 400, error: 'Invalid OTP' };
    await deleteOTP(storeKey);
    return { ok: true };
  }

  const tokenRes = await axios.get(`${MESSAGE_CENTRAL_BASE}/auth/v1/authentication/token`, {
    params: {
      customerId: env.MESSAGE_CENTRAL_CUSTOMER_ID,
      key: env.MESSAGE_CENTRAL_AUTH_TOKEN,
      scope: 'NEW',
      country: env.MESSAGE_CENTRAL_COUNTRY_CODE,
    },
  });
  const mcToken = tokenRes.data?.token;
  if (!mcToken) return { ok: false, status: 502, error: 'Verification service unavailable' };

  const verifyRes = await axios.get(`${MESSAGE_CENTRAL_BASE}/verification/v3/validateOtp`, {
    params: { customerId: env.MESSAGE_CENTRAL_CUSTOMER_ID, code: otp, verificationId },
    headers: { authToken: mcToken },
  });
  const responseCode = verifyRes.data?.data?.responseCode;
  if (responseCode !== 200 && responseCode !== '200') return { ok: false, status: 400, error: 'Invalid OTP' };

  await deleteOTP(storeKey);
  return { ok: true };
}

/* ---------- Action re-verification (authenticated) ----------
 * A logged-in member must prove phone possession again before a sensitive
 * action. The OTP is keyed separately from login so the two flows cannot be
 * confused, and success yields a short-lived JWT bound to (user, purpose)
 * rather than a session. */

const ACTION_TOKEN_TTL = '10m';
type ActionPurpose = 'profile_edit';

function actionOtpKey(userId: string, purpose: ActionPurpose) {
  return `action-otp:${purpose}:${userId}`;
}

export function signActionToken(userId: string, purpose: ActionPurpose): string {
  return jwt.sign({ sub: userId, purpose, kind: 'action' }, env.JWT_SECRET as jwt.Secret, {
    expiresIn: ACTION_TOKEN_TTL,
  } as jwt.SignOptions);
}

/** Returns true when `token` is a valid, unexpired action token for this user + purpose. */
export function verifyActionToken(token: string, userId: string, purpose: ActionPurpose): boolean {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub?: string; purpose?: string; kind?: string };
    return payload.kind === 'action' && payload.purpose === purpose && payload.sub === userId;
  } catch {
    return false;
  }
}

export async function sendActionOtp(req: AuthRequest, res: Response): Promise<void> {
  const parsed = z.object({ purpose: z.enum(['profile_edit']) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }
  const user = req.user;
  if (!user?.phone) {
    res.status(400).json({ error: 'No phone number on your account' });
    return;
  }

  try {
    const result = await dispatchOtp(user.phone, actionOtpKey(user._id.toString(), parsed.data.purpose));
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    // Mask the number so the client can show "sent to ******0304" without echoing PII.
    res.json({ success: true, verificationId: result.verificationId, phoneHint: user.phone.slice(-4) });
  } catch {
    res.status(502).json({ error: 'OTP service unavailable' });
  }
}

export async function verifyActionOtp(req: AuthRequest, res: Response): Promise<void> {
  const parsed = verifyActionOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { otp, verificationId, purpose } = parsed.data;

  try {
    const result = await validateOtp(actionOtpKey(user._id.toString(), purpose), otp, verificationId);
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.json({ success: true, actionToken: signActionToken(user._id.toString(), purpose) });
  } catch {
    res.status(502).json({ error: 'OTP verification failed' });
  }
}

export async function sendOtp(req: Request, res: Response): Promise<void> {
  const parsed = sendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { phone } = parsed.data;

  const existing = await getOTP(phone);
  if (existing?.verificationId === ADMIN_OTP_VERIFICATION_ID) {
    res.json({ success: true, verificationId: ADMIN_OTP_VERIFICATION_ID });
    return;
  }

  if (isDevOtpBypassActive) {
    try {
      await setOTP(
        phone,
        { sentAt: Date.now(), verificationId: DEV_BYPASS_VERIFICATION_ID },
        OTP_TTL_SECONDS,
      );
      res.json({ success: true, verificationId: DEV_BYPASS_VERIFICATION_ID });
    } catch {
      res.status(500).json({ error: 'Failed to initiate OTP' });
    }
    return;
  }

  try {
    const tokenRes = await axios.get(
      `${MESSAGE_CENTRAL_BASE}/auth/v1/authentication/token`,
      {
        params: {
          customerId: env.MESSAGE_CENTRAL_CUSTOMER_ID,
          key: env.MESSAGE_CENTRAL_AUTH_TOKEN,
          scope: 'NEW',
          country: env.MESSAGE_CENTRAL_COUNTRY_CODE,
        },
      },
    );

    const mcToken = tokenRes.data?.token;
    if (!mcToken) {
      res.status(502).json({ error: 'Failed to get auth token from MessageCentral' });
      return;
    }

    const otpRes = await axios.post(
      `${MESSAGE_CENTRAL_BASE}/verification/v3/send`,
      null,
      {
        params: {
          countryCode: env.MESSAGE_CENTRAL_COUNTRY_CODE,
          customerId: env.MESSAGE_CENTRAL_CUSTOMER_ID,
          flowType: 'SMS',
          mobileNumber: phone,
          otpLength: env.MESSAGE_CENTRAL_OTP_LENGTH,
        },
        headers: { authToken: mcToken },
      },
    );

    const verificationId = otpRes.data?.data?.verifyId;
    if (!verificationId) {
      res.status(502).json({ error: 'Failed to send OTP' });
      return;
    }

    await setOTP(phone, { sentAt: Date.now(), verificationId }, OTP_TTL_SECONDS);

    res.json({ success: true, verificationId });
  } catch {
    res.status(502).json({ error: 'OTP service unavailable' });
  }
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { phone, otp, verificationId } = parsed.data;

  const stored = await getOTP(phone);
  if (!stored) {
    res.status(400).json({ error: 'OTP expired or not found. Please request a new OTP.' });
    return;
  }

  if (stored.verificationId === ADMIN_OTP_VERIFICATION_ID && stored.value) {
    if (otp !== stored.value) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }
    try {
      await deleteOTP(phone);
      await issueSessionAndRespond(phone, res);
    } catch {
      res.status(500).json({ error: 'Failed to create session' });
    }
    return;
  }

  if (stored.verificationId !== verificationId) {
    res.status(400).json({ error: 'OTP expired or not found. Please request a new OTP.' });
    return;
  }

  if (isDevOtpBypassActive && verificationId === DEV_BYPASS_VERIFICATION_ID) {
    if (otp !== DEV_BYPASS_OTP) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    try {
      await deleteOTP(phone);
      await issueSessionAndRespond(phone, res);
    } catch {
      res.status(500).json({ error: 'Failed to create session' });
    }
    return;
  }

  try {
    const tokenRes = await axios.get(
      `${MESSAGE_CENTRAL_BASE}/auth/v1/authentication/token`,
      {
        params: {
          customerId: env.MESSAGE_CENTRAL_CUSTOMER_ID,
          key: env.MESSAGE_CENTRAL_AUTH_TOKEN,
          scope: 'NEW',
          country: env.MESSAGE_CENTRAL_COUNTRY_CODE,
        },
      },
    );

    const mcToken = tokenRes.data?.token;
    if (!mcToken) {
      res.status(502).json({ error: 'Verification service unavailable' });
      return;
    }

    const verifyRes = await axios.get(
      `${MESSAGE_CENTRAL_BASE}/verification/v3/validateOtp`,
      {
        params: {
          customerId: env.MESSAGE_CENTRAL_CUSTOMER_ID,
          code: otp,
          verificationId,
        },
        headers: { authToken: mcToken },
      },
    );

    const responseCode = verifyRes.data?.data?.responseCode;
    if (responseCode !== 200 && responseCode !== '200') {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    await deleteOTP(phone);
    await issueSessionAndRespond(phone, res);
  } catch {
    res.status(502).json({ error: 'OTP verification failed' });
  }
}

/** Signs a 30-day session JWT and writes the standard login response for `user`. */
function respondWithSession(user: IUser, res: Response, isNewUser = false): void {
  const token = jwt.sign(
    { userId: user._id },
    env.JWT_SECRET as jwt.Secret,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
  );

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      enrollmentId: user.enrollmentId,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      communityIds: user.communityIds,
      profilePicture: user.profilePicture,
    },
    isNewUser,
  });
}

export async function generateAdminOtp(req: AuthRequest, res: Response): Promise<void> {
  const parsed = z.object({ phone: phoneSchema }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid phone number' });
    return;
  }
  const { phone } = parsed.data;
  const otp = String(crypto.randomInt(100000, 999999));

  await setOTP(phone, { value: otp, sentAt: Date.now(), verificationId: ADMIN_OTP_VERIFICATION_ID }, ADMIN_OTP_TTL_SECONDS);
  res.json({ success: true, otp, expiresInSeconds: ADMIN_OTP_TTL_SECONDS });
}

async function issueSessionAndRespond(
  phone: string,
  res: Response,
  roleOverride?: 'super_admin' | 'community_admin' | 'member',
): Promise<void> {
  let user = await User.findOne({ phone });
  const isNewUser = !user;

  if (!user) {
    user = await User.create({ phone, firstName: 'Admin' });
  }

  if (roleOverride && user.role !== roleOverride) {
    user.role = roleOverride;
  }

  user.lastSeen = new Date();
  await user.save();

  respondWithSession(user, res, isNewUser);
}
