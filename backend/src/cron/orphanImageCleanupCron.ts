import cron from 'node-cron';
import { ApprovalRequest } from '../models';
import { getAdminBucket } from '../lib/firebaseAdmin';

// Only these prefixes are ever eligible for deletion. This is the safety net:
// even if a payload somehow carried an unexpected URL, anything outside these
// exact public-submit folders (community logos, admin-side "temp/" uploads,
// approved families' live photos, etc.) is never touched.
const DELETABLE_PREFIXES = ['user-photos/public-submit/', 'business-logos/public-submit/', 'business-photos/public-submit/'];

// Only clean up requests rejected at least this long ago — pure extra safety
// margin against acting on a review that just happened.
const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

function extractStoragePath(url: string): string | null {
  const match = /\/o\/([^?]+)/.exec(url);
  if (!match) return null;
  const decoded = decodeURIComponent(match[1]);
  const isDeletable = DELETABLE_PREFIXES.some((prefix) => decoded.startsWith(prefix));
  return isDeletable ? decoded : null;
}

function collectImageUrls(payload: Record<string, unknown> | undefined): string[] {
  if (!payload) return [];
  const urls: string[] = [];

  const head = payload.head as Record<string, unknown> | undefined;
  if (head?.profilePicture && typeof head.profilePicture === 'string') {
    urls.push(head.profilePicture);
  }

  const business = payload.business as Record<string, unknown> | undefined;
  if (business?.logo && typeof business.logo === 'string') {
    urls.push(business.logo);
  }
  if (Array.isArray(business?.photos)) {
    for (const photo of business.photos) {
      if (typeof photo === 'string') urls.push(photo);
    }
  }

  return urls;
}

async function runOrphanImageCleanupJob(): Promise<void> {
  const bucket = getAdminBucket();
  if (!bucket) {
    console.log('Orphan image cleanup: Firebase Admin not configured, skipping.');
    return;
  }

  const cutoff = new Date(Date.now() - GRACE_PERIOD_MS);
  const rejectedRequests = await ApprovalRequest.find({
    entityType: 'new_family',
    status: 'rejected',
    updatedAt: { $lte: cutoff },
    'payload.imagesCleanedAt': { $exists: false },
  });

  if (!rejectedRequests.length) return;

  let deletedCount = 0;

  for (const request of rejectedRequests) {
    const urls = collectImageUrls(request.payload);
    const paths = urls.map(extractStoragePath).filter((p): p is string => Boolean(p));

    for (const filePath of paths) {
      try {
        await bucket.file(filePath).delete({ ignoreNotFound: true });
        deletedCount += 1;
      } catch (err) {
        console.error(`Orphan image cleanup: failed to delete ${filePath}:`, err);
      }
    }

    request.payload = { ...request.payload, imagesCleanedAt: new Date().toISOString() };
    request.markModified('payload');
    await request.save();
  }

  console.log(
    `Orphan image cleanup: processed ${rejectedRequests.length} rejected request(s), deleted ${deletedCount} image(s).`,
  );
}

export function startOrphanImageCleanupCron(): void {
  cron.schedule(
    '0 4 * * *',
    () => {
      runOrphanImageCleanupJob().catch((err) => console.error('Orphan image cleanup cron failed:', err));
    },
    { timezone: 'Asia/Kolkata' },
  );
}
