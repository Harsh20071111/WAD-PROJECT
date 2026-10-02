const express = require('express');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const User = require('../models/User');
const Resident = require('../models/Resident');
const Room = require('../models/Room');
const Bed = require('../models/Bed');

const router = express.Router();
router.use(protect);

router.get('/me', async (req, res, next) => {
  try {
    const resident = await Resident.findOne({ userId: req.user._id, pgId: req.user.pgId }).populate('roomId').populate('bedId');
    res.json({ success: true, data: resident });
  } catch (error) { next(error); }
});

router.get('/', restrictTo('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const residents = await Resident.find({ pgId: req.user.pgId }).populate('userId', 'name email phone role isActive').populate('roomId').populate('bedId').sort({ createdAt: -1 });
    res.json({ success: true, data: residents });
  } catch (error) { next(error); }
});

router.post('/', restrictTo('ADMIN'), async (req, res, next) => {
  const session = await User.startSession();
  try {
    const { name, email, phone, password, gender, monthlyRent, securityDeposit = 0, joiningDate, roomId, bedId } = req.body;
    session.startTransaction();
    const [user] = await User.create([{ name, email: email.toLowerCase().trim(), phone, passwordHash: await bcrypt.hash(password || phone, 10), role: 'RESIDENT' }], { session });
    let residentRoom = null;
    let residentBed = null;
    if (bedId) {
      residentBed = await Bed.findOneAndUpdate({ _id: bedId, pgId: req.user.pgId, status: 'AVAILABLE' }, { status: 'OCCUPIED' }, { new: true, session });
      if (!residentBed) throw Object.assign(new Error('Bed is unavailable or outside this PG'), { statusCode: 409 });
      residentRoom = roomId || residentBed.roomId;
    }
    const [resident] = await Resident.create([{
      userId: user._id, pgId: req.user.pgId, gender, monthlyRent, securityDeposit, joiningDate, roomId: residentRoom, bedId: residentBed?._id || null, status: 'ACTIVE'
    }], { session });
    await session.commitTransaction();
    res.status(201).json({ success: true, data: await resident.populate([{ path: 'userId', select: 'name email phone role' }, { path: 'roomId' }, { path: 'bedId' }]) });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally { await session.endSession(); }
});

module.exports = router;
