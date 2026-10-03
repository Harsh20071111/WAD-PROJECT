const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

/**
 * Initialize Socket.IO server attached to HTTP server.
 * Includes authentication middleware, room joining, and connection error handling.
 */
const initSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (
          !origin ||
          process.env.NODE_ENV !== 'production' ||
          allowedOrigins.includes(origin) ||
          /^http:\/\/localhost:\d+$/.test(origin)
        ) {
          return callback(null, true);
        }
        callback(new Error(`Socket CORS: origin ${origin} not allowed`));
      },
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // ─── Authentication Middleware ──────────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        console.warn('⚡ [WebSocket] Connection attempt without auth token - proceeding as public client');
        socket.user = { role: 'PUBLIC' };
        return next();
      }

      const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'fallback_secret_key_123';
      const decoded = jwt.verify(token, secret);
      socket.user = decoded;
      return next();
    } catch (err) {
      console.warn(`⚡ [WebSocket] Auth verification error: ${err.message}`);
      // Allow connection with guest/public role or reject gracefully
      socket.user = { role: 'PUBLIC' };
      return next();
    }
  });

  // ─── Connection Lifecycle ───────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userRole = socket.user?.role || 'PUBLIC';
    const userId = socket.user?.id || socket.user?._id;

    console.log(`⚡ [WebSocket] Client connected: ${socket.id} (User: ${userId || 'Anonymous'}, Role: ${userRole})`);

    // Join room based on user role & ID
    if (userId) {
      socket.join(`user:${userId}`);
    }
    if (userRole) {
      socket.join(`role:${userRole}`);
    }
    if (socket.user?.pgId) {
      socket.join(`pg:${socket.user.pgId}`);
    }

    // Allow clients to join specific room subscriptions
    socket.on('joinRoom', (roomName) => {
      if (roomName && typeof roomName === 'string') {
        socket.join(roomName);
        console.log(`⚡ [WebSocket] ${socket.id} joined room: ${roomName}`);
      }
    });

    socket.on('leaveRoom', (roomName) => {
      if (roomName && typeof roomName === 'string') {
        socket.leave(roomName);
        console.log(`⚡ [WebSocket] ${socket.id} left room: ${roomName}`);
      }
    });

    // Handle connection error
    socket.on('error', (err) => {
      console.error(`⚡ [WebSocket] Socket error on ${socket.id}:`, err);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`⚡ [WebSocket] Client disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  return io;
};

/**
 * Get current Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized! Call initSocket first.');
  }
  return io;
};

/**
 * Broadcast event to all connected clients or specific target room
 * 
 * Standard events:
 * - dataUpdated
 * - countUpdated
 * - itemCreated
 * - itemUpdated
 * - itemDeleted
 */
const broadcastEvent = (eventName, payload = {}, targetRoom = null) => {
  if (!io) {
    console.warn('⚡ [WebSocket] Cannot broadcast - io not initialized');
    return;
  }

  const messagePayload = {
    event: eventName,
    data: payload,
    timestamp: new Date().toISOString()
  };

  if (targetRoom) {
    io.to(targetRoom).emit(eventName, messagePayload);
  } else {
    io.emit(eventName, messagePayload);
  }

  console.log(`⚡ [WebSocket] Broadcast "${eventName}" to ${targetRoom || 'all'}`);
};

module.exports = {
  initSocket,
  getIO,
  broadcastEvent
};
