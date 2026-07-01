import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

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

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && user) {
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

      newSocket.on('new-message', (data) => {
        // Handle real-time messages
      });

      newSocket.on('assessment-updated', (data) => {
        // Handle legacy assessment updates
      });

      newSocket.on('request-updated', (data) => {
        // Handle service request updates
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
    localStorage.removeItem('portalToken');
    setToken(null);
    setUser(null);
    setSocket(null);
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const markNotificationRead = useCallback(async (notificationId) => {
    try {
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
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
    user,
    token,
    socket,
    isLoading,
    notifications,
    unreadCount,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'ANALYST',
    isClient: user?.role === 'CLIENT',
    login,
    register,
    logout,
    apiCall,
    markNotificationRead,
    refreshNotifications: fetchNotifications
  };

  return (
    <PortalContext.Provider value={value}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within PortalProvider');
  }
  return context;
}
