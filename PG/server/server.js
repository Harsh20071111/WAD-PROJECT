const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const dotenv  = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables first
dotenv.config();

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

// CORS — allow the client origin (supports multiple comma-separated origins)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) || allowedOrigins.includes(origin)) {
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
app.use('/api/pg', require('./routes/pgRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/residents', require('./routes/residentRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/receipts', require('./routes/receiptRoutes'));

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
  const statusCode = err.statusCode || err.status || (res.statusCode !== 200 ? res.statusCode : 500);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// ─── Start server after MongoDB is ready ─────────────────────────────────────
const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () =>
    console.log(
      `✅ PG Management server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    )
  );
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
