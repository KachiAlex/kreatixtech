import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { initPushNotifications, unregisterPushToken } from '../services/mobile';

const PortalContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || '';

// Socket.io requires a persistent server (not serverless).
// fly.io supports WebSockets; Vercel serverless does not.
// When API_URL is unset we're in local dev using Vite's proxy — sockets
// can still connect directly to localhost:5000 in that case.
const SOCKET_URL = API_URL || 'http://localhost:5000';

export function PortalProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('portalToken'));
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef({});

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && user) {
      // Initialize native push notifications
      initPushNotifications(token);

      const newSocket = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 3,
        transports: ['websocket', 'polling'],
        timeout: 5000
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('connect_error', (err) => {
        console.warn('Socket connection failed:', err.message);
        newSocket.disconnect();
      });

      newSocket.on('new-notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
        pushToast({ title: notif.title, message: notif.message, type: 'info' });
      });

      newSocket.on('new-message', (data) => {
        pushToast({ title: 'New Message', message: data?.message?.message?.substring(0, 80) || 'You have a new message', type: 'message' });
      });

      newSocket.on('assessment-updated', (data) => {});

      newSocket.on('request-updated', (data) => {
        if (data?.status) {
          pushToast({ title: 'Request Updated', message: `Status changed to ${data.status.replace(/_/g, ' ')}`, type: 'info' });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, user]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        fetchNotifications();
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications?unreadOnly=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('portalToken', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('portalToken', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    if (token) unregisterPushToken(token);
    localStorage.removeItem('portalToken');
    setToken(null);
    setUser(null);
    setSocket(null);
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const pushToast = useCallback(({ title, message, type = 'info' }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, title, message, type }]);
    toastTimers.current[id] = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      delete toastTimers.current[id];
    }, 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    clearTimeout(toastTimers.current[id]);
    delete toastTimers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markNotificationRead = useCallback(async (notificationId) => {
    try {
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [token]);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [token]);

  const apiCall = useCallback(async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 401) {
      logout();
      throw new Error('Session expired');
    }

    return response;
  }, [token, logout]);

  const value = {
    user, token, socket, isLoading,
    notifications, unreadCount,
    toasts, pushToast, dismissToast,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'ANALYST',
    isClient: user?.role === 'CLIENT',
    login, register, logout, apiCall,
    markNotificationRead, markAllNotificationsRead,
    refreshNotifications: fetchNotifications,
  };

  return (
    <PortalContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) throw new Error('usePortal must be used within PortalProvider');
  return context;
}

const TOAST_STYLES = {
  info:    { bar: 'bg-blue-500',    icon: '🔔' },
  message: { bar: 'bg-[#F2782E]',   icon: '💬' },
  success: { bar: 'bg-green-500',   icon: '✅' },
  error:   { bar: 'bg-red-500',     icon: '❌' },
};

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        const style = TOAST_STYLES[t.type] || TOAST_STYLES.info;
        return (
          <div key={t.id}
            className="pointer-events-auto bg-white rounded-xl shadow-2xl border border-[#E8E5E0] overflow-hidden flex animate-slide-in"
            style={{ animation: 'slideIn 0.25s ease' }}
          >
            <div className={`w-1 flex-shrink-0 ${style.bar}`} />
            <div className="flex-1 px-4 py-3 min-w-0">
              <p className="text-sm font-bold text-[#0E0E0F] flex items-center gap-1.5">
                <span>{style.icon}</span>{t.title}
              </p>
              {t.message && <p className="text-xs text-[#6B6F76] mt-0.5 truncate">{t.message}</p>}
            </div>
            <button onClick={() => onDismiss(t.id)} className="px-3 text-[#6B6F76] hover:text-[#0E0E0F] text-lg leading-none flex-shrink-0">×</button>
          </div>
        );
      })}
    </div>
  );
}
