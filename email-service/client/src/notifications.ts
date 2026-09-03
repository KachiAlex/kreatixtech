import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { getAccessToken } from './api';

let ws: WebSocket | null = null;
let currentUserEmail: string | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const WS_URL = (() => {
  if (Capacitor.isNativePlatform()) {
    return 'wss://mail.kreatixtech.com/ws';
  }
  if (typeof window !== 'undefined') {
    const isElectron = (window as any).electronAPI?.isElectron || (navigator as any).userAgent?.toLowerCase().includes('electron');
    if (isElectron) return 'wss://mail.kreatixtech.com/ws';
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/ws`;
  }
  return 'wss://mail.kreatixtech.com/ws';
})();

export async function initNotifications(): Promise<void> {
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') {
      console.log('Local notification permission not granted');
    }
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Local notification received:', notification);
    });
    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      console.log('Notification tapped:', action);
    });
    console.log('Local notifications initialized');
  } catch (err) {
    console.error('Local notifications init failed:', err);
  }
}

export async function setNotificationUserId(userId: string, email: string): Promise<void> {
  currentUserEmail = email;
  connectWebSocket();
}

export async function clearNotificationUser(): Promise<void> {
  currentUserEmail = null;
  disconnectWebSocket();
}

function connectWebSocket() {
  disconnectWebSocket();

  const token = getAccessToken();
  if (!token || !currentUserEmail) return;

  try {
    ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(currentUserEmail)}`);

    ws.onopen = () => {
      console.log('Notification WebSocket connected');
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_email') {
          await sendLocalNotification(data);
        }
      } catch (e) {
        console.error('WS message parse error:', e);
      }
    };

    ws.onclose = () => {
      console.log('Notification WebSocket closed, will reconnect in 5s');
      ws = null;
      if (currentUserEmail) {
        reconnectTimer = setTimeout(() => connectWebSocket(), 5000);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  } catch (err) {
    console.error('WebSocket connect failed:', err);
  }
}

function disconnectWebSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    ws.onclose = null;
    ws.close();
    ws = null;
  }
}

async function sendLocalNotification(data: { from?: string; subject?: string; from_name?: string }) {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title: data.from_name || data.from || 'New Email',
          body: data.subject || '(no subject)',
          smallIcon: 'ic_launcher',
          iconColor: '#F2782E',
          channelId: 'new-emails',
        },
      ],
    });
  } catch (err) {
    console.error('Failed to send local notification:', err);
  }
}
