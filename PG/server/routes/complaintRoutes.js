const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const Resident = require('../models/Resident');
const Staff = require('../models/Staff');
const Counter = require('../models/Counter');
const notify = require('../utils/notify');

const router = express.Router();
router.use(protect);

const nextRequestNo = async () => `REQ-${String(await Counter.getNext('complaint')).padStart(5, '0')}`;
const details = (query) => query
  .populate({ path: 'residentId', select: 'userId roomId', populate: { path: 'userId', select: 'name email phone' } })
  .populate({ path: 'assignedStaffId', populate: { path: 'userId', select: 'name email phone' } })
  .sort({ createdAt: -1 });

router.get('/', async (req, res, next) => {
  try {
    const filter = { pgId: req.user.pgId };
    if (req.user.role === 'RESIDENT') {
      const resident = await Resident.findOne({ userId: req.user._id });
      filter.residentId = resident?._id;
    } else if (req.user.role === 'STAFF') {
      const staff = await Staff.findOne({ userId: req.user._id });
      filter.assignedStaffId = staff?._id;
    }
    res.json({ success: true, data: await details(Complaint.find(filter)) });
  } catch (error) { next(error); }
});

router.post('/', restrictTo('RESIDENT'), async (req, res, next) => {
  try {
    const resident = await Resident.findOne({ userId: req.user._id, pgId: req.user.pgId });
    if (!resident) return res.status(404).json({ success: false, message: 'Resident profile not found.' });
    const { category, priority, title, description } = req.body;
    const complaint = await Complaint.create({ pgId: req.user.pgId, residentId: resident._id, roomId: resident.roomId, requestNo: await nextRequestNo(), category, priority, title, description });
    const pgAdmins = await require('../models/User').find({ pgId: req.user.pgId, role: 'ADMIN', isActive: true }).select('_id');
    await Promise.all(pgAdmins.map((admin) => notify(admin._id, 'COMPLAINT_CREATED', 'New service request', `${complaint.requestNo}: ${complaint.title}`, '/admin/complaints')));
    res.status(201).json({ success: true, data: complaint });
  } catch (error) { next(error); }
});

router.patch('/:id', restrictTo('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, pgId: req.user.pgId });
    if (!complaint) return res.status(404).json({ success: false, message: 'Request not found.' });
    const oldStatus = complaint.status;
    if (req.body.assignedStaffId !== undefined) {
      const staff = await Staff.findOne({ _id: req.body.assignedStaffId, pgId: req.user.pgId, isActive: true });
      if (!staff) return res.status(400).json({ success: false, message: 'Staff member is not valid for this PG.' });
      complaint.assignedStaffId = staff._id;
      complaint.status = complaint.status === 'NEW' ? 'ASSIGNED' : complaint.status;
      await notify(staff.userId, 'COMPLAINT_ASSIGNED', 'Request assigned to you', `${complaint.requestNo}: ${complaint.title}`, '/staff/tasks');
    }
    if (req.body.status) complaint.status = req.body.status;
    await complaint.save();
    if (oldStatus !== complaint.status) await ComplaintUpdate.create({ complaintId: complaint._id, fromStatus: oldStatus, toStatus: complaint.status, note: req.body.note || '', actorId: req.user._id });
    const resident = await Resident.findById(complaint.residentId);
    if (resident) await notify(resident.userId, 'COMPLAINT_UPDATED', 'Service request updated', `${complaint.requestNo} is now ${complaint.status}`, '/resident/complaints');
    res.json({ success: true, data: await details(Complaint.findById(complaint._id)) });
  } catch (error) { next(error); }
});

module.exports = router;
