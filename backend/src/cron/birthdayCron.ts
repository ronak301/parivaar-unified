import cron from 'node-cron';
import { User, Notification } from '../models';
import type { IUser } from '../models';
import { buildPushMessages, sendPushNotifications } from '../utils/pushNotification';

async function findTodaysBirthdays(): Promise<IUser[]> {
  const now = new Date();
  return User.aggregate([
    {
      $match: {
        isAlive: true,
        dob: { $exists: true },
      },
    },
    {
      $match: {
        $expr: {
          $and: [
            { $eq: [{ $month: '$dob' }, now.getMonth() + 1] },
            { $eq: [{ $dayOfMonth: '$dob' }, now.getDate()] },
          ],
        },
      },
    },
  ]);
}

async function runBirthdayJob(): Promise<void> {
  const birthdayUsers = await findTodaysBirthdays();
  if (!birthdayUsers.length) return;

  const notificationDocs = birthdayUsers.map((user) => ({
    userId: user._id,
    communityId: user.communityIds?.[0],
    type: 'birthday_wish' as const,
    title: 'Happy Birthday! 🎉',
    body: `Wishing ${user.firstName} a wonderful birthday!`,
  }));
  await Notification.insertMany(notificationDocs);

  const pushInputs = birthdayUsers
    .flatMap((user) => (user.pushTokens ?? []).map((pushToken) => ({ pushToken, userId: user._id, firstName: user.firstName })))
    .map(({ pushToken, firstName }) => ({
      pushToken,
      title: 'Happy Birthday! 🎉',
      body: `Wishing ${firstName} a wonderful birthday!`,
      data: { type: 'birthday_wish' },
    }));

  if (pushInputs.length) {
    await sendPushNotifications(buildPushMessages(pushInputs));
  }

  console.log(`Birthday cron: notified ${birthdayUsers.length} member(s)`);
}

export function startBirthdayCron(): void {
  cron.schedule(
    '0 8 * * *',
    () => {
      runBirthdayJob().catch((err) => console.error('Birthday cron failed:', err));
    },
    { timezone: 'Asia/Kolkata' },
  );
}
