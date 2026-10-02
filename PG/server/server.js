const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const dotenv  = require('dotenv');
const net     = require('net');
const connectDB = require('./config/db');

// Load environment variables first
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

// CORS — allow the client origin (supports multiple comma-separated origins)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ─── Logging & Parsing ────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));

// Phase 4+:  app.use('/api/rooms',      require('./routes/roomRoutes'));
// Phase 4+:  app.use('/api/public',     require('./routes/publicRoutes'));
// Phase 5+:  app.use('/api/residents',  require('./routes/residentRoutes'));
// Phase 6+:  app.use('/api/payments',   require('./routes/paymentRoutes'));
// Phase 8+:  app.use('/api/complaints', require('./routes/complaintRoutes'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PG Management API is running',
    timestamp: new Date(),
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// ─── Start server (auto-increment port if busy) ───────────────────────────────
const PORT = Number(process.env.PORT || 5000);

const getAvailablePort = (preferred) =>
  new Promise((resolve, reject) => {
    const tester = net.createServer();
    tester.once('error', (err) => {
      if (err.code === 'EADDRINUSE') return resolve(getAvailablePort(preferred + 1));
      reject(err);
    });
    tester.once('listening', () => {
      const addr = tester.address();
      const port = typeof addr === 'object' && addr ? addr.port : preferred;
      tester.close(() => resolve(port));
    });
    tester.listen(preferred);
  });

getAvailablePort(PORT)
  .then((port) => {
    app.listen(port, '0.0.0.0', () =>
      console.log(
        `✅ PG Management server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`
      )
    );
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
