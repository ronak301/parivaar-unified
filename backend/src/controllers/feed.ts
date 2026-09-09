import type { Response } from 'express';
import mongoose from 'mongoose';
import type { AuthRequest } from '../middleware';
import { ApprovalRequest, Business, BusinessEnquiry, FeedItem, MatrimonialProfile } from '../models';
import type { FeedItemType } from '../models';
import { requireFeedEnabled } from '../services/community-features';

const FEED_TYPES: FeedItemType[] = ['matrimonial', 'business_enquiry', 'business'];
const PERSON_FIELDS = 'firstName lastName fullName profilePicture phone showPhoneInCommunity';

type Person = Record<string, unknown> & { showPhoneInCommunity?: boolean; phone?: string };

/** Members can hide their number from the community; never leak it past this point. */
function publicPerson(doc: unknown, opts: { hidePhone?: boolean } = {}): Person | undefined {
  if (!doc || typeof doc !== 'object') return undefined;
  const person: Person = typeof (doc as { toObject?: unknown }).toObject === 'function'
    ? (doc as { toObject(): Person }).toObject()
    : { ...(doc as Person) };
  if (opts.hidePhone || person.showPhoneInCommunity === false) delete person.phone;
  delete person.showPhoneInCommunity;
  return person;
}

export async function getFeed(req: AuthRequest, res: Response): Promise<void> {
  const { communityId } = req.params;
  if (!(await requireFeedEnabled(req, res, communityId))) return;

  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 50);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { communityId };
  const type = req.query.type as string | undefined;
  if (type && FEED_TYPES.includes(type as FeedItemType)) filter.type = type;

  const [items, total] = await Promise.all([
    FeedItem.find(filter)
      .populate('postedBy', PERSON_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FeedItem.countDocuments(filter),
  ]);

  const idsOf = (t: FeedItemType) => items.filter((i) => i.type === t).map((i) => i.refId);

  const [profiles, enquiries, businesses] = await Promise.all([
    MatrimonialProfile.find({ _id: { $in: idsOf('matrimonial') }, status: 'approved' })
      .select('name photo biodataFile dob gender qualification userId')
      .lean(),
    BusinessEnquiry.find({ _id: { $in: idsOf('business_enquiry') }, status: 'approved' })
      .populate('userId', PERSON_FIELDS)
      .lean(),
    Business.find({ _id: { $in: idsOf('business') } })
      .populate('ownerId', PERSON_FIELDS)
      .lean(),
  ]);

  const byId = <T extends { _id: unknown }>(arr: T[]) => new Map(arr.map((d) => [String(d._id), d]));
  const profileMap = byId(profiles);
  const enquiryMap = byId(enquiries);
  const businessMap = byId(businesses);

  const feed = items.flatMap((item): Record<string, unknown>[] => {
    const base = {
      _id: item._id,
      type: item.type,
      communityId: item.communityId,
      refId: item.refId,
      postedBy: publicPerson(item.postedBy),
      createdAt: item.createdAt,
    };
    const key = String(item.refId);

    if (item.type === 'matrimonial') {
      const p = profileMap.get(key);
      if (!p) return [];
      // Candidates carry no phone by design — contact goes through the poster's family.
      return [{ ...base, matrimonial: p }];
    }
    if (item.type === 'business_enquiry') {
      const e = enquiryMap.get(key);
      if (!e) return [];
      return [{ ...base, enquiry: { _id: e._id, requirement: e.requirement, place: e.place, user: publicPerson(e.userId) } }];
    }
    const b = businessMap.get(key);
    if (!b) return [];
    return [{ ...base, business: { ...b, ownerId: publicPerson(b.ownerId) } }];
  });

  res.json({
    success: true,
    items: feed,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

/** The caller's own feed submissions (any status), newest first. */
export async function getMySubmissions(req: AuthRequest, res: Response): Promise<void> {
  const requests = await ApprovalRequest.find({
    requestedBy: req.user?._id,
    entityType: { $in: FEED_TYPES },
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .select('entityType entityId status payload remarks createdAt updatedAt');

  res.json({ success: true, requests });
}

export async function removeFeedItem(req: AuthRequest, res: Response): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: 'Feed item not found' });
    return;
  }
  const item = await FeedItem.findById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Feed item not found' });
    return;
  }

  const isSuperAdmin = req.user?.role === 'super_admin';
  const inScope = req.user?.communityIds?.some((id) => id.toString() === item.communityId.toString()) ?? false;
  if (!isSuperAdmin && !inScope) {
    res.status(403).json({ error: 'Not authorized for this community' });
    return;
  }

  await item.deleteOne();
  res.json({ success: true });
}
