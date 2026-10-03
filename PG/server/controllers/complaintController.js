const Complaint = require('../models/Complaint');
const Resident = require('../models/Resident');
const Staff = require('../models/Staff');
const Room = require('../models/Room');
const PG = require('../models/PG');
const User = require('../models/User');
const { uploadBuffer } = require('../config/cloudinary');
const { getSlaHours } = require('../utils/slaCron');
const { notify, notifyAllAdmins } = require('../utils/notifier');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @POST /api/complaints
const createComplaint = asyncHandler(async (req, res) => {
  const { category, priority, title, description } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({
      success: false,
      message: 'Category, title, and description are required.'
    });
  }

  const resident = await Resident.findOne({ userId: req.user._id });
  if (!resident) {
    return res.status(404).json({
      success: false,
      message: 'Resident profile not found for current user.'
    });
  }

  const attachments = [];
  if (req.files && req.files.length > 0) {
    const filesToUpload = req.files.slice(0, 3);
    for (const file of filesToUpload) {
      try {
        const uploadResult = await uploadBuffer(file.buffer, 'complaints');
        attachments.push({ url: uploadResult.url, publicId: uploadResult.public_id });
      } catch (err) {
        console.warn('Cloudinary upload fallback:', err.message);
        const base64Data = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
        attachments.push({ url: dataUrl, publicId: `local_${Date.now()}` });
      }
    }
  }

  const slaHours = getSlaHours(category);
  const now = new Date();
  const slaDueAt = new Date(now.getTime() + slaHours * 60 * 60 * 1000);

  const requestNo = `REQ-${Math.floor(100000 + Math.random() * 900000)}`;

  const complaint = await Complaint.create({
    pgId: resident.pgId,
    requestNo,
    residentId: resident._id,
    roomId: resident.roomId,
    category,
    priority: priority || 'MEDIUM',
    title,
    description,
    attachments,
    status: 'NEW',
    slaHours,
    slaDueAt,
    timeline: [
      {
        status: 'NEW',
        note: 'Service request created',
        updatedBy: req.user._id,
        time: now
      }
    ]
  });

  let roomNumber = 'N/A';
  if (resident.roomId) {
    const room = await Room.findById(resident.roomId);
    if (room) roomNumber = room.roomNumber;
  }

  await notifyAllAdmins(resident.pgId, {
    type: 'NEW_COMPLAINT',
    title: `New service request #${requestNo}`,
    message: `${category}: ${title} (Room ${roomNumber})`,
    link: `/admin/service-requests`
  });

  res.status(201).json({
    success: true,
    data: complaint
  });
});

// @GET /api/complaints
const getComplaints = asyncHandler(async (req, res) => {
  const { status, category, breached } = req.query;
  const filter = {};

  if (req.user.role === 'RESIDENT') {
    const resident = await Resident.findOne({ userId: req.user._id });
    if (!resident) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }
    filter.residentId = resident._id;
  } else if (req.user.role === 'STAFF') {
    const staff = await Staff.findOne({ userId: req.user._id });
    if (staff) {
      filter.assignedStaffId = staff._id;
    } else {
      filter.assignedStaffId = req.user._id;
    }
  }

  if (status) filter.status = status;
  if (category) filter.category = category;

  if (breached === 'true') {
    const now = new Date();
    filter.$or = [
      { breachedAt: { $ne: null } },
      { slaDueAt: { $lt: now }, status: { $nin: ['RESOLVED', 'CLOSED'] } }
    ];
  }

  const complaints = await Complaint.find(filter)
    .populate({
      path: 'residentId',
      populate: { path: 'userId', select: 'name email phone' }
    })
    .populate({
      path: 'assignedStaffId',
      populate: { path: 'userId', select: 'name email phone' }
    })
    .populate('roomId', 'roomNumber floor')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: complaints.length,
    data: complaints
  });
});

// @GET /api/complaints/:id
const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate({
      path: 'residentId',
      populate: { path: 'userId', select: 'name email phone' }
    })
    .populate({
      path: 'assignedStaffId',
      populate: { path: 'userId', select: 'name email phone' }
    })
    .populate('roomId', 'roomNumber floor');

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  res.status(200).json({
    success: true,
    data: complaint
  });
});

// @PATCH /api/complaints/:id/status
const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, note, assignedStaffId } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  if (req.user.role === 'STAFF') {
    const staff = await Staff.findOne({ userId: req.user._id });
    const staffId = staff ? staff._id.toString() : req.user._id.toString();

    if (!complaint.assignedStaffId || complaint.assignedStaffId.toString() !== staffId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update tickets assigned to you.'
      });
    }
  }

  const now = new Date();

  if (status) {
    complaint.status = status;
    if (status === 'RESOLVED') {
      complaint.resolvedAt = now;
      if (note) complaint.resolutionNote = note;
    }
  }

  if (assignedStaffId && req.user.role === 'ADMIN') {
    complaint.assignedStaffId = assignedStaffId;
    if (complaint.status === 'NEW') {
      complaint.status = 'ASSIGNED';
    }
  }

  const timelineNote = note || `Status updated to ${status}`;
  complaint.timeline.push({
    status: complaint.status,
    note: timelineNote,
    updatedBy: req.user._id,
    time: now
  });

  await complaint.save();

  if (status === 'RESOLVED') {
    const resident = await Resident.findById(complaint.residentId);
    if (resident && resident.userId) {
      await notify({
        userId: resident.userId,
        type: 'COMPLAINT_RESOLVED',
        title: `Request Resolved: ${complaint.requestNo}`,
        message: `Your service request "${complaint.title}" has been marked as resolved! Please share your feedback.`,
        link: `/resident/complaints`
      });
    }
  }

  res.status(200).json({
    success: true,
    data: complaint
  });
});

// @POST /api/complaints/:id/reopen
const reopenComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  if (complaint.status !== 'RESOLVED') {
    return res.status(400).json({
      success: false,
      message: 'Only resolved complaints can be reopened.'
    });
  }

  const now = new Date();
  const resolvedTime = complaint.resolvedAt ? new Date(complaint.resolvedAt).getTime() : 0;
  const hoursSinceResolution = (now.getTime() - resolvedTime) / (1000 * 60 * 60);

  if (hoursSinceResolution > 48) {
    return res.status(400).json({
      success: false,
      message: 'Reopen window has expired. Reopens are only allowed within 48 hours of resolution.'
    });
  }

  complaint.status = 'IN_PROGRESS';
  complaint.resolvedAt = null;
  complaint.timeline.push({
    status: 'IN_PROGRESS',
    note: req.body.reason ? `Reopened by resident: ${req.body.reason}` : 'Reopened by resident.',
    updatedBy: req.user._id,
    time: now
  });

  await complaint.save();

  res.status(200).json({
    success: true,
    message: 'Complaint reopened successfully.',
    data: complaint
  });
});

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  reopenComplaint
};
