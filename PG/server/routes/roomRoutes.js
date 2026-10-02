const express = require('express');
const router = express.Router();
const { getRooms, updateRoom, assignBed, checkoutBed } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.get('/matrix', protect, getRooms);
router.put('/:id', protect, updateRoom);
router.post('/:roomId/beds/:bedId/assign', protect, assignBed);
router.post('/:roomId/beds/:bedId/checkout', protect, checkoutBed);

module.exports = router;
