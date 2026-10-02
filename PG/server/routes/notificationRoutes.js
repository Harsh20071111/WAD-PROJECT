const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try { res.json({ success: true, data: await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50) }); } catch (error) { next(error); }
});
router.patch('/:id/read', async (req, res, next) => {
  try { res.json({ success: true, data: await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true }, { new: true }) }); } catch (error) { next(error); }
});

module.exports = router;
