const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const PG = require('../models/PG');

const router = express.Router();

router.use(protect);

router.get('/mine', async (req, res, next) => {
  try {
    const pg = req.user.pgId ? await PG.findById(req.user.pgId) : null;
    res.json({ success: true, data: pg });
  } catch (error) { next(error); }
});

router.post('/', restrictTo('ADMIN'), async (req, res, next) => {
  try {
    if (req.user.pgId) return res.status(409).json({ success: false, message: 'Admin already owns a PG.' });
    const { name, address, contact, amenities = [] } = req.body;
    const pg = await PG.create({ name, address, contact, amenities, ownerId: req.user._id });
    req.user.pgId = pg._id;
    await req.user.save({ validateModifiedOnly: true });
    res.status(201).json({ success: true, data: pg });
  } catch (error) { next(error); }
});

module.exports = router;
