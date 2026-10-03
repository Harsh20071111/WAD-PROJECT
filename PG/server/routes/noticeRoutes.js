const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const Notice = require('../models/Notice');
const Resident = require('../models/Resident');
const { broadcastEvent } = require('../utils/socket');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const base = { isActive: true, $or: [{ scheduledFor: null }, { scheduledFor: { $lte: now } }] };
    if (req.user.pgId) base.pgId = req.user.pgId;
    const notices = await Notice.find(base).sort({ isUrgent: -1, isPinned: -1, createdAt: -1 }).lean();
    if (req.user.role === 'ADMIN') return res.json({ success: true, count: notices.length, data: notices });
    let floor = null;
    if (req.user.role === 'RESIDENT') {
      const resident = await Resident.findOne({ userId: req.user._id }).populate('roomId', 'floor').lean();
      floor = resident?.roomId?.floor;
    }
    const data = notices.filter((notice) => notice.audience?.type === 'ALL'
      || typeof notice.audience === 'string'
      || (notice.audience?.type === 'RESIDENTS' && req.user.role === 'RESIDENT')
      || (notice.audience?.type === 'STAFF' && req.user.role === 'STAFF')
      || (notice.audience?.type === 'FLOOR' && floor != null && notice.audience.floor === floor));
    res.json({ success: true, count: data.length, data });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const noticeData = { ...req.body, createdBy: req.user._id };
    if (req.user.pgId) noticeData.pgId = req.user.pgId;
    const notice = await Notice.create(noticeData);
    
    // Real-time WebSocket emission
    broadcastEvent('itemCreated', { type: 'notice', data: notice });
    broadcastEvent('countUpdated', { entity: 'notice', action: 'created' });
    broadcastEvent('dataUpdated', { type: 'notice', action: 'created', data: notice });

    res.status(201).json({ success: true, data: notice });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const notice = await Notice.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.json({ success: true, data: notice });
  } catch (error) { next(error); }
});

router.patch('/:id', restrictTo('ADMIN'), async (req, res, next) => {
  try {
    const notice = await Notice.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true });
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });

    // Real-time WebSocket emission
    broadcastEvent('itemUpdated', { type: 'notice', data: notice });
    broadcastEvent('dataUpdated', { type: 'notice', action: 'updated', data: notice });

    res.json({ success: true, data: notice });
  } catch (error) { next(error); }
});

router.delete('/:id', restrictTo('ADMIN'), async (req, res, next) => {
  try {
    const notice = await Notice.findOneAndUpdate({ _id: req.params.id }, { isActive: false }, { new: true });
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });

    // Real-time WebSocket emission
    broadcastEvent('itemDeleted', { type: 'notice', data: notice });
    broadcastEvent('countUpdated', { entity: 'notice', action: 'deleted' });
    broadcastEvent('dataUpdated', { type: 'notice', action: 'deleted', data: notice });

    res.json({ success: true, data: notice });
  } catch (error) { next(error); }
});

module.exports = router;
