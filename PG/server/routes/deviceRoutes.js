const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const DeviceToken = require('../models/DeviceToken');
const pushService = require('../services/pushService');

const router = express.Router();

// Apply authentication middleware
router.use(protect);

router.post('/register', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    const deviceToken = await DeviceToken.findOneAndUpdate(
      { token },
      { 
        userId: req.user._id, 
        pgId: req.user.pgId,
        userAgent: req.headers['user-agent'],
        lastSeenAt: Date.now()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, data: deviceToken });
  } catch (error) {
    next(error);
  }
});

router.delete('/unregister', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    await DeviceToken.findOneAndDelete({ token, userId: req.user._id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
});

router.post('/test', restrictTo('ADMIN'), async (req, res, next) => {
  try {
    // Fire and forget
    pushService.sendToUser(req.user._id, {
      title: 'Test Notification',
      body: 'This is a test web push notification from PG Management',
      link: '/admin/dashboard',
      type: 'test'
    }).catch(console.error);

    res.status(200).json({ success: true, message: 'Test notification queued' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
