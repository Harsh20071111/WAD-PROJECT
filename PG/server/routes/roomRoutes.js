const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const Room = require('../models/Room');
const Bed = require('../models/Bed');

const router = express.Router();
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
  try {
    const { floor, roomNumber, type, capacity, rent, amenities = [] } = req.body;
    const room = await Room.create({ pgId: req.user.pgId, floor, roomNumber, type, capacity, rent, amenities });
    const beds = await Bed.insertMany(Array.from({ length: capacity }, (_, index) => ({
      pgId: req.user.pgId, roomId: room._id, label: String.fromCharCode(65 + index), status: 'AVAILABLE'
    })));
    res.status(201).json({ success: true, data: { ...room.toObject(), beds } });
  } catch (error) { next(error); }
});

module.exports = router;
