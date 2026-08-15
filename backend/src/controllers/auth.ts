import type { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { sendOtpSchema, verifyOtpSchema } from '@parivaar/shared';
import { env } from '../config/env';
import { setOTP, getOTP, deleteOTP } from '../config/redis';
import { User } from '../models';

const MESSAGE_CENTRAL_BASE = 'https://cpaas.messagecentral.com';
const OTP_TTL_SECONDS = 300;
const DEV_BYPASS_OTP = '000000';
const DEV_BYPASS_VERIFICATION_ID = 'dev-bypass';

const isDevOtpBypassActive = env.NODE_ENV !== 'production' && env.DEV_OTP_BYPASS;

export async function sendOtp(req: Request, res: Response): Promise<void> {
  const parsed = sendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { phone } = parsed.data;

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
  if (!stored || stored.verificationId !== verificationId) {
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

async function issueSessionAndRespond(phone: string, res: Response): Promise<void> {
  let user = await User.findOne({ phone });
  const isNewUser = !user;

  if (!user) {
    user = await User.create({ phone, firstName: 'New User' });
  }

  user.lastSeen = new Date();
  await user.save();

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
