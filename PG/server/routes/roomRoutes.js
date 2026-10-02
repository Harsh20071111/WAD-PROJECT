const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const Room = require('../models/Room');
const Bed = require('../models/Bed');
const Resident = require('../models/Resident');
const mongoose = require('mongoose');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const rooms = await Room.find({ pgId: req.user.pgId, isActive: true }).sort({ floor: 1, roomNumber: 1 }).lean();
    const beds = await Bed.find({ pgId: req.user.pgId }).sort({ roomId: 1, label: 1 }).lean();
    const byRoom = beds.reduce((map, bed) => ((map[bed.roomId] ||= []).push(bed), map), {});
    res.json({ success: true, data: rooms.map((room) => ({ ...room, beds: byRoom[String(room._id)] || [] })) });
  } catch (error) { next(error); }
});

router.post('/', restrictTo('ADMIN'), async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const { roomNumber, floor, type, capacity, rent, amenities = [] } = req.body;
      if (!roomNumber || floor == null || !type || !capacity || !rent) {
        const error = new Error('roomNumber, floor, type, capacity and rent are required');
        error.statusCode = 400;
        throw error;
      }
      const exists = await Room.findOne({ pgId: req.user.pgId, roomNumber }).session(session);
      if (exists) {
        const error = new Error(`Room ${roomNumber} already exists`);
        error.statusCode = 409;
        throw error;
      }
      const room = await Room.create([{ pgId: req.user.pgId, roomNumber, floor, type, capacity, rent, amenities }], { session });
      const beds = [];
      for (let i = 0; i < capacity; i++) {
        beds.push({ pgId: req.user.pgId, roomId: room[0]._id, label: String.fromCharCode(65 + i), status: 'AVAILABLE' });
      }
      await Bed.insertMany(beds, { session });
      const createdBeds = await Bed.find({ roomId: room[0]._id }).session(session).lean();
      result = { ...room[0].toObject(), beds: createdBeds };
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) { next(Object.assign(error, { status: error.statusCode || 500 })); }
  finally { await session.endSession(); }
});

router.patch('/beds/:id/status', restrictTo('ADMIN'), async (req, res, next) => {
  try {
    const { status, statusNote = '' } = req.body;
    const allowed = ['AVAILABLE', 'OCCUPIED', 'UNDER_NOTICE', 'BLOCKED', 'MAINTENANCE'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid bed status' });
    const bed = await Bed.findOne({ _id: req.params.id, pgId: req.user.pgId });
    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
    if (bed.residentId && ['BLOCKED', 'MAINTENANCE'].includes(status)) return res.status(400).json({ success: false, message: 'Occupied beds must be vacated before blocking or maintenance' });
    if (bed.residentId && status === 'AVAILABLE') return res.status(400).json({ success: false, message: 'Use the vacate endpoint to release an occupied bed' });
    if (status === 'OCCUPIED' && !bed.residentId) return res.status(400).json({ success: false, message: 'Use the assign endpoint to occupy a bed' });
    bed.status = status;
    bed.statusNote = statusNote;
    bed.statusChangedAt = new Date();
    bed.statusChangedBy = req.user._id;
    await bed.save();
    res.json({ success: true, data: bed });
  } catch (error) { next(error); }
});

router.post('/beds/:id/assign', restrictTo('ADMIN'), async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const bed = await Bed.findOne({ _id: req.params.id, pgId: req.user.pgId }).session(session);
      if (!bed) { const error = new Error('Bed not found'); error.statusCode = 404; throw error; }
      if (['BLOCKED', 'MAINTENANCE'].includes(bed.status)) { const error = new Error(`Cannot assign a ${bed.status.toLowerCase()} bed`); error.statusCode = 400; throw error; }
      if (bed.status !== 'AVAILABLE' || bed.residentId) { const error = new Error('Bed is already assigned or unavailable'); error.statusCode = 409; throw error; }
      const resident = await Resident.findOne({ _id: req.body.residentId, pgId: req.user.pgId }).session(session);
      if (!resident) { const error = new Error('Resident not found'); error.statusCode = 404; throw error; }
      if (resident.bedId || resident.roomId) { const error = new Error('Resident already has a current bed'); error.statusCode = 409; throw error; }
      const updatedBed = await Bed.findOneAndUpdate({ _id: bed._id, pgId: req.user.pgId, status: 'AVAILABLE', residentId: null }, { status: 'OCCUPIED', residentId: resident._id, statusChangedAt: new Date(), statusChangedBy: req.user._id }, { new: true, session });
      if (!updatedBed) { const error = new Error('Bed was assigned by another request'); error.statusCode = 409; throw error; }
      resident.bedId = updatedBed._id;
      resident.roomId = updatedBed.roomId;
      resident.status = 'ACTIVE';
      await resident.save({ session });
      result = await Bed.findById(updatedBed._id).populate('residentId').session(session);
    });
    res.json({ success: true, data: result });
  } catch (error) { next(Object.assign(error, { status: error.statusCode || 500 })); }
  finally { await session.endSession(); }
});

router.post('/beds/:id/vacate', restrictTo('ADMIN'), async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const bed = await Bed.findOne({ _id: req.params.id, pgId: req.user.pgId }).session(session);
      if (!bed) { const error = new Error('Bed not found'); error.statusCode = 404; throw error; }
      if (!bed.residentId) { const error = new Error('Bed is already vacant'); error.statusCode = 409; throw error; }
      const residentId = bed.residentId;
      result = await Bed.findOneAndUpdate({ _id: bed._id, pgId: req.user.pgId, residentId }, { status: 'AVAILABLE', residentId: null, statusNote: '', statusChangedAt: new Date(), statusChangedBy: req.user._id }, { new: true, session });
      await Resident.updateOne({ _id: residentId, pgId: req.user.pgId, bedId: bed._id }, { $set: { bedId: null, roomId: null } }, { session });
    });
    res.json({ success: true, data: result });
  } catch (error) { next(Object.assign(error, { status: error.statusCode || 500 })); }
  finally { await session.endSession(); }
});

module.exports = router;
