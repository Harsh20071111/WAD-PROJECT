const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const Resident = require('../models/Resident');

const router = express.Router();
router.use(protect);

router.post('/', restrictTo('RESIDENT'), async (req, res, next) => {
  try {
    const resident = await Resident.findOne({ userId: req.user._id, pgId: req.user.pgId });
    if (!resident) return res.status(404).json({ success: false, message: 'Resident profile not found' });
    if (req.body.complaintId) {
      const complaint = await Complaint.findOne({ _id: req.body.complaintId, pgId: req.user.pgId, residentId: resident._id });
      if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found for this resident' });
      if (!['RESOLVED', 'CLOSED'].includes(complaint.status)) return res.status(400).json({ success: false, message: 'Feedback is available after resolution' });
    }
    res.status(201).json({ success: true, data: await Feedback.create({ ...req.body, pgId: req.user.pgId, residentId: resident._id, type: req.body.type || 'COMPLAINT_FEEDBACK' }) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Feedback already submitted for this complaint' });
    next(error);
  }
});

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
