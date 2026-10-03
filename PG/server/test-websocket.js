const http = require('http');
const express = require('express');
const { io: Client } = require('socket.io-client');
const jwt = require('jsonwebtoken');
const { initSocket, broadcastEvent } = require('./utils/socket');

const runWebSocketTest = async () => {
  console.log('🧪 Starting WebSocket Verification Test...');

  const app = express();
  const server = http.createServer(app);
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
  
  initSocket(server, allowedOrigins);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`✅ Test server running on port ${port}`);

  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'fallback_secret_key_123';
  const mockToken = jwt.sign({ id: 'user_123', role: 'ADMIN', name: 'Test Admin' }, secret, { expiresIn: '1h' });

  const clientSocket = Client(`http://localhost:${port}`, {
    auth: { token: mockToken },
    transports: ['websocket']
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);

    clientSocket.on('connect', () => {
      console.log('✅ Client connected successfully via WebSocket (ID:', clientSocket.id, ')');
      clearTimeout(timeout);
      resolve();
    });

    clientSocket.on('connect_error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });

  // Test broadcast event reception
  const eventPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Event reception timeout')), 5000);

    clientSocket.on('itemCreated', (payload) => {
      console.log('✅ Client received "itemCreated" real-time event:', payload);
      clearTimeout(timeout);
      resolve(payload);
    });
  });

  // Broadcast event from server
  broadcastEvent('itemCreated', { type: 'complaint', data: { id: 'c_1', title: 'Leaky Tap' } });

  const receivedData = await eventPromise;
  if (receivedData.data.type === 'complaint' && receivedData.data.data.title === 'Leaky Tap') {
    console.log('🎉 WebSocket real-time broadcast and reception verified successfully!');
  } else {
    throw new Error('Received payload did not match expected structure');
  }

  clientSocket.disconnect();
  await new Promise((resolve) => server.close(resolve));
  console.log('✅ WebSocket test completed with 100% SUCCESS.');
};

runWebSocketTest().catch((err) => {
  console.error('❌ WebSocket test failed:', err);
  process.exit(1);
});
