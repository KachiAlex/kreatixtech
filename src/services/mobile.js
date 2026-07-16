import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

const API_URL = import.meta.env.VITE_API_URL || '';

export async function isNativePlatform() {
  return Capacitor.isNativePlatform();
}

export async function initPushNotifications(token) {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  let permGranted = false;

  try {
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    permGranted = permStatus.receive === 'granted';
  } catch (e) {
    return;
  }

  if (!permGranted) return;

  try {
    await PushNotifications.register();
  } catch (e) {
    return;
  }

  PushNotifications.addListener('registration', async (tokenData) => {
    if (token) {
      await registerPushToken(token, tokenData.value);
    }
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('Push registration error:', err);
  });

  PushNotifications.addListener(
    'pushNotificationReceived',
    async (notification) => {
      showLocalNotification(notification);
    }
  );

  PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (action) => {
      const data = action.notification.data;
      if (data?.requestId) {
        window.location.href = `/portal/request/${data.requestId}`;
      } else if (data?.assessmentId) {
        window.location.href = `/portal/assessment/${data.assessmentId}`;
      }
    }
  );
}

async function showLocalNotification(notification) {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: notification.title || 'Kreatix Technologies',
          body: notification.body || '',
          id: Date.now(),
          schedule: { at: new Date() },
          sound: 'default',
          smallIcon: 'ic_stat_icon',
          iconColor: '#F2782E',
        },
      ],
    });
  } catch (e) {
    console.error('Local notification error:', e);
  }
}

export async function registerPushToken(authToken, pushToken) {
  try {
    await fetch(`${API_URL}/api/notifications/device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        token: pushToken,
        platform: Capacitor.getPlatform(),
      }),
    });
  } catch (e) {
    console.error('Failed to register push token:', e);
  }
}

export async function unregisterPushToken(authToken) {
  try {
    await fetch(`${API_URL}/api/notifications/device`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
  } catch (e) {
    console.error('Failed to unregister push token:', e);
  }
}
