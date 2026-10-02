const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const Enquiry = require('../models/Enquiry');
const PG = require('../models/PG');

const router = express.Router();

// Public route: submit an enquiry from the website (no auth required)
router.post('/public', async (req, res, next) => {
  try {
    let pgId = req.body.pgId;
    if (!pgId) {
      const defaultPg = await PG.findOne();
      pgId = defaultPg ? defaultPg._id : null;
    }
    if (!pgId) {
      return res.status(400).json({ success: false, message: 'PG identifier not found' });
    }

    const enquiry = await Enquiry.create({
      pgId,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email || '',
      moveInDate: req.body.moveInDate || null,
      message: req.body.message || '',
      source: 'WEBSITE',
      status: 'NEW',
    });

    res.status(201).json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
});

router.use(protect, restrictTo('ADMIN'));

router.get('/', async (req, res, next) => {
  try { res.json({ success: true, data: await Enquiry.find({ pgId: req.user.pgId }).populate('roomId', 'roomNumber floor').sort({ createdAt: -1 }) }); }
  catch (error) { next(error); }
});
router.post('/', async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await Enquiry.create({ ...req.body, pgId: req.user.pgId }) }); }
  catch (error) { next(error); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findOne({ _id: req.params.id, pgId: req.user.pgId }).populate('roomId', 'roomNumber floor');
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, data: enquiry });
  } catch (error) { next(error); }
});
router.patch('/:id', async (req, res, next) => {
  try {
    const current = await Enquiry.findOne({ _id: req.params.id, pgId: req.user.pgId });
    if (!current) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    if (req.body.status) {
      const allowed = { NEW: ['CONTACTED'], CONTACTED: ['CONVERTED', 'CLOSED'], CONVERTED: [], CLOSED: [] };
      if (!allowed[current.status].includes(req.body.status)) return res.status(400).json({ success: false, message: `Invalid enquiry status transition: ${current.status} -> ${req.body.status}` });
    }
    Object.assign(current, req.body);
    await current.save();
    res.json({ success: true, data: current });
  } catch (error) { next(error); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findOneAndDelete({ _id: req.params.id, pgId: req.user.pgId });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, data: enquiry });
  } catch (error) { next(error); }
});

module.exports = router;
