import { io } from 'socket.io-client';

// Resolve the backend server URL for Socket.IO direct connection.
// In dev mode, Vite proxies /api to the backend. But Socket.IO needs the actual backend URL.
const resolveSocketUrl = () => {
  // Explicit socket URL takes priority
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  
  // If API URL is an absolute URL (http://...), strip /api suffix
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl.startsWith('http')) return apiUrl.replace(/\/api$/, '');
  
  // Relative /api path means we use Vite proxy — connect to same origin
  // Vite's proxy configuration will handle WebSocket upgrade
  return undefined; // defaults to window.location.origin
};

const SOCKET_URL = resolveSocketUrl();

let socket = null;

/**
 * Initialize or get active Socket.IO connection.
 * The singleton pattern ensures only one connection exists at a time.
 */
export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('accessToken');
    
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      // Use both transports — polling as fallback if websocket upgrade fails
      transports: ['websocket', 'polling'],
      // Critical: set the path for Socket.IO when using Vite proxy
      path: '/socket.io/'
    });

    socket.on('connect', () => {
      console.log('⚡ [WebSocket] Connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚡ [WebSocket] Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ [WebSocket] Disconnected:', reason);
    });

    socket.on('reconnect', (attempt) => {
      console.log('⚡ [WebSocket] Reconnected after', attempt, 'attempts');
    });
  }

  return socket;
};

/**
 * Connect socket — updates JWT token and initiates connection if not already connected.
 */
export const connectSocket = () => {
  const instance = getSocket();
  const token = localStorage.getItem('accessToken');
  if (token) {
    instance.auth = { token };
  }
  if (!instance.connected) {
    instance.connect();
  }
  return instance;
};

/**
 * Disconnect socket cleanly and destroy the instance.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};
