const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const PG = require('../models/PG');
const Bed = require('../models/Bed');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');
const Resident = require('../models/Resident');

const router = express.Router();

router.use(protect);

router.get('/mine', async (req, res, next) => {
  try {
    const pg = req.user.pgId ? await PG.findById(req.user.pgId) : null;
    res.json({ success: true, data: pg });
  } catch (error) { next(error); }
});

router.get('/summary', restrictTo('ADMIN'), async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    const [bedCounts, collection, openComplaints, pendingKyc] = await Promise.all([
      Bed.aggregate([
        { $match: { pgId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Payment.aggregate([
        { $match: { pgId } },
        { $group: { _id: null, billed: { $sum: '$amount' }, collected: { $sum: '$paidAmount' } } }
      ]),
      Complaint.countDocuments({ pgId, status: { $nin: ['RESOLVED', 'CLOSED'] } }),
      Resident.countDocuments({ pgId, status: 'PENDING_VERIFICATION' })
    ]);
    const counts = Object.fromEntries(bedCounts.map(({ _id, count }) => [_id, count]));
    const billed = collection[0]?.billed || 0;
    const collected = collection[0]?.collected || 0;
    res.json({ success: true, data: {
      occupancy: {
        totalBeds: Object.values(counts).reduce((sum, count) => sum + count, 0),
        occupiedBeds: counts.OCCUPIED || 0,
        availableBeds: counts.AVAILABLE || 0,
        underNoticeBeds: counts.UNDER_NOTICE || 0
      },
      collection: { billed, collected, percent: billed ? Math.round((collected / billed) * 10000) / 100 : 0 },
      openComplaints,
      pendingKyc
    }});
  } catch (error) { next(error); }
});

router.post('/', restrictTo('ADMIN'), async (req, res, next) => {
  try {
    if (req.user.pgId) return res.status(409).json({ success: false, message: 'Admin already owns a PG.' });
    const { name, address, contact, amenities = [] } = req.body;
    const pg = await PG.create({ name, address, contact, amenities, ownerId: req.user._id });
    req.user.pgId = pg._id;
    await req.user.save({ validateModifiedOnly: true });
    res.status(201).json({ success: true, data: pg });
  } catch (error) { next(error); }
});

module.exports = router;
