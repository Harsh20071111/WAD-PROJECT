import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket } from '../services/socket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socketInstance = connectSocket();
    socketRef.current = socketInstance;

    const onConnect = () => {
      console.log('⚡ [SocketContext] Connected');
      setIsConnected(true);
    };
    const onDisconnect = () => {
      console.log('⚡ [SocketContext] Disconnected');
      setIsConnected(false);
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);

    // If already connected (e.g. fast reconnect), reflect immediately
    if (socketInstance.connected) {
      setIsConnected(true);
    }

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      disconnectSocket();
      socketRef.current = null;
    };
  }, [user]);

  /**
   * Subscribe to a specific socket event. Returns a cleanup function.
   * Uses ref instead of state to avoid stale closure issues.
   */
  const subscribeToEvent = useCallback((eventName, callback) => {
    const sock = socketRef.current;
    if (!sock) return () => {};

    const handler = (payload) => {
      if (typeof callback === 'function') {
        callback(payload);
      }
    };

    sock.on(eventName, handler);

    return () => {
      sock.off(eventName, handler);
    };
  }, []); // No deps needed — uses ref, not state

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, subscribeToEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
