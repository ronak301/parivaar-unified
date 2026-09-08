import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, type IUser } from '../models';
import type { Types } from 'mongoose';

const BCRYPT_ROUNDS = 12;
// Ambiguous characters (0/O, 1/l/I) removed so a handed-over password is easy to read.
const PASSWORD_ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
const PASSWORD_LENGTH = 12;

export interface AdminCredentials {
  username: string;
  password: string;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 16) || 'community'
  );
}

/** A random, human-readable password. */
export function generatePassword(): string {
  let out = '';
  const bytes = crypto.randomBytes(PASSWORD_LENGTH);
  for (let i = 0; i < PASSWORD_LENGTH; i++) {
    out += PASSWORD_ALPHABET[bytes[i] % PASSWORD_ALPHABET.length];
  }
  return out;
}

/** A username unique across `adminUsername`, derived from the community name. */
export async function generateAdminUsername(communityName: string): Promise<string> {
  const base = slugify(communityName);
  for (let attempt = 0; attempt < 12; attempt++) {
    const suffix = crypto.randomInt(1000, 9999);
    const candidate = `${base}${suffix}`;
    const exists = await User.exists({ adminUsername: candidate });
    if (!exists) return candidate;
  }
  throw new Error('Failed to generate a unique admin username');
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** The shadow admin User for a community, if one exists. */
export function findCommunityAdmin(communityId: string | Types.ObjectId): Promise<IUser | null> {
  return User.findOne({ role: 'community_admin', communityIds: communityId });
}

/**
 * Creates the shadow admin User for a community and returns its one-time
 * plaintext credentials. Caller must ensure none exists first.
 */
export async function createCommunityAdminUser(
  communityId: Types.ObjectId,
  communityName: string,
): Promise<AdminCredentials> {
  const username = await generateAdminUsername(communityName);
  const password = generatePassword();
  const adminPasswordHash = await hashPassword(password);

  await User.create({
    firstName: `${communityName} Admin`,
    role: 'community_admin',
    communityIds: [communityId],
    adminUsername: username,
    adminPassword: password,
    adminPasswordHash,
  });

  return { username, password };
}
