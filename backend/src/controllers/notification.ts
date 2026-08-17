import type { Response } from 'express';
import { registerPushTokenSchema } from '@parivaar/shared';
import type { AuthRequest } from '../middleware';
import { Notification, User } from '../models';

export async function getMyNotifications(req: AuthRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { userId: req.user?._id };
  if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === 'true';

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user?._id, isRead: false }),
  ]);

  res.json({
    success: true,
    notifications,
    unreadCount,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?._id },
    { isRead: true },
    { new: true },
  );

  if (!notification) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }

  res.json({ success: true, notification });
}

export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  await Notification.updateMany({ userId: req.user?._id, isRead: false }, { isRead: true });
  res.json({ success: true });
}

export async function registerPushToken(req: AuthRequest, res: Response): Promise<void> {
  const parsed = registerPushTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  await User.updateOne(
    { _id: req.user?._id },
    { $addToSet: { pushTokens: parsed.data.token } },
  );

  res.json({ success: true });
}

export async function unregisterPushToken(req: AuthRequest, res: Response): Promise<void> {
  const { token } = req.body;
  if (!token) {
    res.status(400).json({ error: 'token is required' });
    return;
  }

  await User.updateOne(
    { _id: req.user?._id },
    { $pull: { pushTokens: token } },
  );

  res.json({ success: true });
}
