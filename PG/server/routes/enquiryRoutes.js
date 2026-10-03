const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const Enquiry = require('../models/Enquiry');
const PG = require('../models/PG');
const rateLimit = require('express-rate-limit');
const https = require('https');
const notify = require('../utils/notify');

const router = express.Router();

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { success: false, message: 'Too many enquiries submitted from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public route: submit an enquiry from the website (no auth required)
router.post('/public', enquiryLimiter, async (req, res, next) => {
  try {
    let pgId = req.body.pgId;
    if (!pgId) {
      const defaultPg = await PG.findOne();
      pgId = defaultPg ? defaultPg._id : null;
    }
    if (!pgId) {
      return res.status(400).json({ success: false, message: 'PG identifier not found' });
    }

    const turnstileToken = req.body.turnstileToken;
    if (!turnstileToken) {
      return res.status(400).json({ success: false, message: 'Captcha token missing. Please complete the captcha.' });
    }

    const secret = process.env.TURNSTILE_SECRET || '0x4AAAAAAFMlU2HDadpXsPXEsu0WpiSLWyc';
    const postData = new URLSearchParams({ secret, response: turnstileToken }).toString();

    const verifyData = await new Promise((resolve, reject) => {
      const reqConfig = https.request('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch(e) {
            resolve({ success: false });
          }
        });
      });
      reqConfig.on('error', reject);
      reqConfig.write(postData);
      reqConfig.end();
    });

    if (!verifyData.success) {
      return res.status(400).json({ success: false, message: 'Captcha verification failed. Please try again.' });
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

    // Notify admins
    notify.notifyAdmins(pgId, {
      type: 'ENQUIRY',
      title: 'New enquiry',
      message: `${req.body.name} asked about a room`,
      link: '/admin/enquiries'
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
  try { 
    const enquiry = await Enquiry.create({ ...req.body, pgId: req.user.pgId });
    notify.notifyAdmins(req.user.pgId, {
      type: 'ENQUIRY',
      title: 'New enquiry',
      message: `${req.body.name} asked about a room`,
      link: '/admin/enquiries'
    });
    res.status(201).json({ success: true, data: enquiry }); 
  }
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
