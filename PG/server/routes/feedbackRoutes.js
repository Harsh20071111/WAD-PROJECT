const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { submitFeedback, getStaffRatings } = require('../controllers/feedbackController');
const Feedback = require('../models/Feedback');

router.use(protect);

router.post('/', restrictTo('RESIDENT'), submitFeedback);
router.get('/staff-ratings', restrictTo('ADMIN'), getStaffRatings);

router.get('/', restrictTo('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const filter = { pgId: req.user.pgId };
    if (req.query.rating) filter.rating = Number(req.query.rating);
    if (req.query.complaintId) filter.complaintId = req.query.complaintId;
    const [items, average, byStaff] = await Promise.all([
      Feedback.find(filter).populate('residentId', 'userId').populate({ path: 'complaintId', populate: { path: 'assignedStaffId', populate: { path: 'userId', select: 'name email' } } }).sort({ createdAt: -1 }),
      Feedback.aggregate([{ $match: filter }, { $group: { _id: null, rating: { $avg: '$rating' }, count: { $sum: 1 } } }]),
      Feedback.aggregate([
        { $match: filter }, { $lookup: { from: 'complaints', localField: 'complaintId', foreignField: '_id', as: 'complaint' } }, { $unwind: '$complaint' },
        { $match: { 'complaint.pgId': req.user.pgId, 'complaint.assignedStaffId': { $ne: null } } },
        { $group: { _id: '$complaint.assignedStaffId', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ])
    ]);
    res.json({ success: true, data: { items, averageRating: average[0]?.rating || 0, count: average[0]?.count || 0, byStaff } });
  } catch (error) { next(error); }
});

module.exports = router;
