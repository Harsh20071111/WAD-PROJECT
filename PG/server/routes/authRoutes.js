const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, refresh, logout, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rate-limit auth endpoints: max 15 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// Public routes
router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);
router.post('/refresh',  authLimiter, refresh);
router.post('/logout',   logout);

// Protected route
router.get('/me', protect, me);

module.exports = router;
