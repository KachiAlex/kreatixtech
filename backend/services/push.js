import { prisma } from '../lib/prisma.js';

const FCM_URL = 'https://fcm.googleapis.com/fcm/send';

export async function sendPushNotification(userId, { title, body, data = {} }) {
  try {
    const devices = await prisma.deviceToken.findMany({
      where: { userId },
    });

    if (devices.length === 0) return;

    const serverKey = process.env.FCM_SERVER_KEY;
    if (!serverKey) {
      return;
    }

    const messages = devices.map(device => ({
      to: device.token,
      notification: { title, body },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
      priority: 'high',
    }));

    await Promise.all(messages.map(msg =>
      fetch(FCM_URL, {
        method: 'POST',
        headers: {
          'Authorization': `key=${serverKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(msg),
      }).catch(() => {})
    ));
  } catch (error) {
    console.error('Push notification error:', error.message);
  }
}

export async function sendPushToUsers(userIds, payload) {
  await Promise.all(userIds.map(id => sendPushNotification(id, payload)));
}
