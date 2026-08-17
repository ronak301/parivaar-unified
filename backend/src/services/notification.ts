import Expo from 'expo-server-sdk';
import { Notification, User } from '../models';

const expo = new Expo();

interface CreateNotificationParams {
  userId: string;
  communityId?: string;
  type: 'approval_request' | 'approval_result' | 'birthday_wish' | 'general';
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  approvalRequestId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  const notification = await Notification.create({
    userId: params.userId,
    communityId: params.communityId,
    type: params.type,
    title: params.title,
    body: params.body,
    data: params.data,
    approvalRequestId: params.approvalRequestId,
  });

  const user = await User.findById(params.userId).select('pushTokens');
  if (user?.pushTokens?.length) {
    const messages = user.pushTokens
      .filter((token) => Expo.isExpoPushToken(token))
      .map((token) => ({
        to: token,
        title: params.title,
        body: params.body ?? params.title,
        data: params.data,
      }));

    if (messages.length) {
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch {
          // push failures are non-critical
        }
      }
    }
  }

  return notification;
}

export async function notifyCommunityAdmins(
  communityId: string,
  type: CreateNotificationParams['type'],
  title: string,
  body?: string,
  data?: Record<string, unknown>,
  approvalRequestId?: string,
) {
  const admins = await User.find({
    communityIds: communityId,
    role: { $in: ['super_admin', 'community_admin'] },
    isBlocked: { $ne: true },
  }).select('_id');

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin._id.toString(),
        communityId,
        type,
        title,
        body,
        data,
        approvalRequestId,
      }),
    ),
  );
}
