const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const Notice = require('../models/Notice');
const Resident = require('../models/Resident');
const Room = require('../models/Room');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const base = { pgId: req.user.pgId, isActive: true, $or: [{ scheduledFor: null }, { scheduledFor: { $lte: now } }] };
    const notices = await Notice.find(base).sort({ isUrgent: -1, isPinned: -1, createdAt: -1 }).lean();
    if (req.user.role === 'ADMIN') return res.json({ success: true, data: notices });
    let floor = null;
    if (req.user.role === 'RESIDENT') {
      const resident = await Resident.findOne({ userId: req.user._id, pgId: req.user.pgId }).populate('roomId', 'floor').lean();
      floor = resident?.roomId?.floor;
    }
    const data = notices.filter((notice) => notice.audience?.type === 'ALL'
      || (notice.audience?.type === 'RESIDENTS' && req.user.role === 'RESIDENT')
      || (notice.audience?.type === 'STAFF' && req.user.role === 'STAFF')
      || (notice.audience?.type === 'FLOOR' && floor != null && notice.audience.floor === floor));
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.use(restrictTo('ADMIN'));
router.post('/', async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await Notice.create({ ...req.body, pgId: req.user.pgId, createdBy: req.user._id }) }); }
  catch (error) { next(error); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const notice = await Notice.findOne({ _id: req.params.id, pgId: req.user.pgId, isActive: true }).lean();
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.json({ success: true, data: notice });
  } catch (error) { next(error); }
});
router.patch('/:id', async (req, res, next) => {
  try {
    const notice = await Notice.findOneAndUpdate({ _id: req.params.id, pgId: req.user.pgId }, req.body, { new: true, runValidators: true });
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.json({ success: true, data: notice });
  } catch (error) { next(error); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const notice = await Notice.findOneAndUpdate({ _id: req.params.id, pgId: req.user.pgId }, { isActive: false }, { new: true });
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.json({ success: true, data: notice });
  } catch (error) { next(error); }
});

module.exports = router;
