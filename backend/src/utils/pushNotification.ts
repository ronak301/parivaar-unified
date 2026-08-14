import { Expo, type ExpoPushMessage } from 'expo-server-sdk';
import { env } from '../config/env';

const expo = new Expo(env.EXPO_ACCESS_TOKEN ? { accessToken: env.EXPO_ACCESS_TOKEN } : undefined);

export interface PushMessageInput {
  pushToken: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

export function buildPushMessages(inputs: PushMessageInput[]): ExpoPushMessage[] {
  const messages: ExpoPushMessage[] = [];

  for (const { pushToken, body = '', data = {}, title = 'Parivaar' } of inputs) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }
    messages.push({ to: pushToken, sound: 'default', title, body, data });
  }

  return messages;
}

export async function sendPushNotifications(messages: ExpoPushMessage[]): Promise<void> {
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Failed to send push notification chunk:', error);
    }
  }

  const receiptIds = tickets
    .filter((ticket): ticket is typeof ticket & { id: string } => ticket.status === 'ok')
    .map((ticket) => ticket.id);

  const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  for (const chunk of receiptIdChunks) {
    try {
      const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      for (const receiptId in receipts) {
        const receipt = receipts[receiptId];
        if (receipt.status === 'error') {
          console.error(`Push notification error: ${receipt.message}`, receipt.details);
        }
      }
    } catch (error) {
      console.error('Failed to fetch push notification receipts:', error);
    }
  }
}
