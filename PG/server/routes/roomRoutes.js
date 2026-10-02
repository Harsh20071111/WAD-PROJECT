const express = require('express');
const router = express.Router();
const { getRooms, updateRoom, assignBed, checkoutBed, createRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const Room = require('../models/Room');
const Bed = require('../models/Bed');

router.use(protect);

router.get('/matrix', getRooms);
router.put('/:id', updateRoom);
router.post('/:roomId/beds/:bedId/assign', assignBed);
router.post('/:roomId/beds/:bedId/checkout', checkoutBed);

router.get('/', async (req, res, next) => {
  try {
    const rooms = await Room.find({ pgId: req.user.pgId, isActive: true }).sort({ floor: 1, roomNumber: 1 }).lean();
    const beds = await Bed.find({ pgId: req.user.pgId }).sort({ roomId: 1, label: 1 }).lean();
    const byRoom = beds.reduce((map, bed) => ((map[bed.roomId] ||= []).push(bed), map), {});
    res.json({ success: true, data: rooms.map((room) => ({ ...room, beds: byRoom[String(room._id)] || [] })) });
  } catch (error) { next(error); }
});

router.post('/', restrictTo('ADMIN'), createRoom);

module.exports = router;
