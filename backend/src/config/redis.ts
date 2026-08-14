import { createClient, type RedisClientType } from 'redis';
import { env } from './env';

export interface OtpData {
  value?: string;
  sentAt: number;
  verificationId?: string;
}

let client: RedisClientType | null = null;
const otps = new Map<string, OtpData>();
const otpExpiry = new Map<string, number>();

if (env.REDIS_ENABLED) {
  client = createClient({ url: env.REDIS_URL });
  client.on('error', (err) => console.error('Redis Client Error', err));
  client.connect().catch((err) => {
    console.error('Redis connection failed:', err);
    process.exit(1);
  });
}

export async function setOTP(
  phone: string,
  data: OtpData,
  ttlSeconds: number,
): Promise<void> {
  if (client) {
    await client.set(phone, JSON.stringify(data), { EX: ttlSeconds });
  } else {
    otps.set(phone, data);
    otpExpiry.set(phone, Date.now() + ttlSeconds * 1000);
  }
}

export async function getOTP(phone: string): Promise<OtpData | null> {
  if (client) {
    const raw = await client.get(phone);
    return raw ? (JSON.parse(raw) as OtpData) : null;
  }
  const expiry = otpExpiry.get(phone);
  if (expiry && Date.now() < expiry) {
    return otps.get(phone) ?? null;
  }
  otps.delete(phone);
  otpExpiry.delete(phone);
  return null;
}

export async function deleteOTP(phone: string): Promise<void> {
  if (client) {
    await client.del(phone);
  } else {
    otps.delete(phone);
    otpExpiry.delete(phone);
  }
}
