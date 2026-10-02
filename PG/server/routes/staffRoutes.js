const express = require('express');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const User = require('../models/User');
const Staff = require('../models/Staff');

const router = express.Router();
router.use(protect, restrictTo('ADMIN'));

router.get('/', async (req, res, next) => {
  try { res.json({ success: true, data: await Staff.find({ pgId: req.user.pgId }).populate('userId', 'name email phone role isActive').sort({ createdAt: -1 }) }); } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, password, categories = [] } = req.body;
    const [user] = await User.create([{ name, email: email.toLowerCase().trim(), phone, passwordHash: await bcrypt.hash(password, 10), role: 'STAFF', pgId: req.user.pgId }]);
    const staff = await Staff.create({ userId: user._id, pgId: req.user.pgId, categories });
    res.status(201).json({ success: true, data: await staff.populate('userId', 'name email phone role isActive') });
  } catch (error) { next(error); }
});

module.exports = router;
