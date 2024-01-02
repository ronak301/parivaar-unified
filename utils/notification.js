const { Expo } = require("expo-server-sdk");

let expo = new Expo({
  accessToken: "oVbS1aFd-DcMjgABLvXAI2CBMQjipHOHgoTx09TU",
});

/**
 * Keep this in sync with frontend
 */
export const NotificationTypes = {
  BIRTHDAY_WISH: "BIRTHDAY_WISH",
};

/**
 *
 * @param {title, pushToken, body, data} pushMessages
 * @returns
 */
exports.getMessages = (pushMessages) => {
  let messages = [];

  pushMessages?.forEach((msg) => {
    const { pushToken, body = "", data = {}, title = "Parivaar" } = msg;
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    messages.push({
      to: pushToken,
      sound: "default",
      body,
      data,
      title,
      data,
    });
  });

  return messages;
};

exports.sendPushNotification = async (messages) => {
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }

  let receiptIds = [];
  for (let ticket of tickets) {
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  for (let chunk of receiptIdChunks) {
    try {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log(receipts);

      for (let receiptId in receipts) {
        let { status, message, details } = receipts[receiptId];
        if (status === "ok") {
          continue;
        } else if (status === "error") {
          console.error(
            `There was an error sending a notification: ${message}`
          );
          if (details && details.error) {
            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            // You must handle the errors appropriately.
            console.error(`The error code is ${details.error}`);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  return tickets;
};
