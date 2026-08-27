import path from 'path';
import { existsSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { env } from '../config/env';

// Lazily initialized: absent in environments with no service account configured
// (e.g. local dev without the file), in which case storage-dependent features
// (like orphan image cleanup) simply no-op instead of crashing the server.
let initialized = false;

function ensureInitialized(): boolean {
  if (initialized || getApps().length > 0) {
    initialized = true;
    return true;
  }

  if (!env.FIREBASE_SERVICE_ACCOUNT_PATH || !env.FIREBASE_STORAGE_BUCKET) return false;

  const resolvedPath = path.resolve(process.cwd(), env.FIREBASE_SERVICE_ACCOUNT_PATH);
  if (!existsSync(resolvedPath)) {
    console.error(`Firebase service account file not found at ${resolvedPath}; storage cleanup disabled.`);
    return false;
  }

  initializeApp({
    credential: cert(resolvedPath),
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
  });
  initialized = true;
  return true;
}

// Returns null when Firebase Admin isn't configured — callers must treat that
// as "cleanup unavailable", never as "nothing to clean up".
export function getAdminBucket() {
  if (!ensureInitialized()) return null;
  return getStorage().bucket();
}
