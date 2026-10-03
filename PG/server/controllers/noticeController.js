const Notice = require('../models/Notice');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @GET /api/notices
const getNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find({ isActive: true })
    .populate('createdBy', 'name role')
    .sort({ isPinned: -1, isUrgent: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: notices.length,
    data: notices
  });
});

// @POST /api/notices
const createNotice = asyncHandler(async (req, res) => {
  const { title, body, audience, isPinned, isUrgent, pgId } = req.body;

  let targetPgId = pgId;
  if (!targetPgId && req.user) {
    targetPgId = req.user.pgId;
  }

  const notice = await Notice.create({
    pgId: targetPgId,
    title,
    body,
    audience: audience || 'ALL',
    isPinned: Boolean(isPinned),
    isUrgent: Boolean(isUrgent),
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: notice
  });
});

module.exports = { getNotices, createNotice };
