const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const Resident = require('../models/Resident');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @POST /api/feedback
const submitFeedback = asyncHandler(async (req, res) => {
  const { complaintId, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5 stars.'
    });
  }

  const resident = await Resident.findOne({ userId: req.user._id });
  if (!resident) {
    return res.status(404).json({ success: false, message: 'Resident profile not found' });
  }

  let complaint = null;
  if (complaintId) {
    complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
  }

  const feedback = await Feedback.create({
    pgId: resident.pgId,
    residentId: resident._id,
    complaintId: complaintId || null,
    type: complaintId ? 'COMPLAINT_FEEDBACK' : 'GENERAL',
    rating: Number(rating),
    comment: comment || ''
  });

  if (complaint) {
    complaint.status = 'CLOSED';
    complaint.timeline.push({
      status: 'CLOSED',
      note: `Resident left ${rating}-star feedback: "${comment || 'No comment'}"`,
      updatedBy: req.user._id,
      time: new Date()
    });
    await complaint.save();
  }

  res.status(201).json({
    success: true,
    data: feedback
  });
});

// @GET /api/feedback/staff-ratings
const getStaffRatings = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({ type: 'COMPLAINT_FEEDBACK' })
    .populate({
      path: 'complaintId',
      populate: { path: 'assignedStaffId', populate: { path: 'userId', select: 'name email' } }
    })
    .sort({ createdAt: -1 });

  const staffStatsMap = {};

  for (const f of feedbacks) {
    const staffDoc = f.complaintId?.assignedStaffId;
    if (!staffDoc) continue;

    const staffId = staffDoc._id.toString();
    const staffName = staffDoc.userId?.name || 'Staff Member';

    if (!staffStatsMap[staffId]) {
      staffStatsMap[staffId] = {
        staffId,
        staffName,
        totalRatings: 0,
        ratingSum: 0,
        averageRating: 0,
        recentFeedback: []
      };
    }

    staffStatsMap[staffId].totalRatings += 1;
    staffStatsMap[staffId].ratingSum += f.rating;
    staffStatsMap[staffId].recentFeedback.push({
      rating: f.rating,
      comment: f.comment,
      createdAt: f.createdAt
    });
  }

  const staffRatingsList = Object.values(staffStatsMap).map(s => ({
    ...s,
    averageRating: Number((s.ratingSum / s.totalRatings).toFixed(1))
  }));

  res.status(200).json({
    success: true,
    count: staffRatingsList.length,
    data: staffRatingsList
  });
});

module.exports = { submitFeedback, getStaffRatings };
