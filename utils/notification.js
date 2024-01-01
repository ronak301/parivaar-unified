const { Expo } = require("expo-server-sdk");

let expo = new Expo({
  accessToken: "oVbS1aFd-DcMjgABLvXAI2CBMQjipHOHgoTx09TU",
});

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
    });
  });

  return messages;
};

exports.sendPushNotification = async (messages) => {
  console.log("sending push to", JSON.stringify(messages));
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
    // NOTE: Not all tickets have IDs; for example, tickets for notifications
    // that could not be enqueued will have error information and no receipt ID.
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  for (let chunk of receiptIdChunks) {
    try {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log(receipts);

      // The receipts specify whether Apple or Google successfully received the
      // notification and information about an error, if one occurred.
      for (let receiptId in receipts) {
        let { status, message, details } = receipts[receiptId];
        if (status === "ok") {
          continue;
        } else if (status === "error") {
          console.error(
            `There was an error sending a notification: ${message}`
          );
          if (details && details.error) {
            // The error codes are listed in the Expo documentation:
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
