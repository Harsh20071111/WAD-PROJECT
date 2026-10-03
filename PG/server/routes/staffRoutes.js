const express = require('express');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { uploadBuffer } = require('../config/cloudinary');
const User = require('../models/User');
const Staff = require('../models/Staff');

const router = express.Router();
router.use(protect, restrictTo('ADMIN'));

router.get('/', async (req, res, next) => {
  try { res.json({ success: true, data: await Staff.find({ pgId: req.user.pgId }).populate('userId', 'name email phone role isActive').sort({ createdAt: -1 }) }); } catch (error) { next(error); }
});

router.post('/', uploadSingle, async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    let categories = [];
    if (req.body.categories) {
      categories = Array.isArray(req.body.categories) ? req.body.categories : req.body.categories.split(',').map(c => c.trim());
    }

    let kycDocumentUrl = '';
    if (req.file) {
      const uploadResult = await uploadBuffer(req.file.buffer, 'kyc_documents');
      kycDocumentUrl = uploadResult.url;
    }

    const [user] = await User.create([{ name, email: email.toLowerCase().trim(), phone, passwordHash: await bcrypt.hash(password, 10), role: 'STAFF', pgId: req.user.pgId }]);
    const staff = await Staff.create({ 
      userId: user._id, 
      pgId: req.user.pgId, 
      categories,
      kycDocumentUrl,
      kycStatus: 'PENDING'
    });
    res.status(201).json({ success: true, data: await staff.populate('userId', 'name email phone role isActive') });
  } catch (error) { next(error); }
});

router.patch('/:id/kyc', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid KYC status' });
    }
    const staff = await Staff.findOneAndUpdate(
      { _id: req.params.id, pgId: req.user.pgId },
      { kycStatus: status },
      { new: true }
    ).populate('userId', 'name email phone role isActive');
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: staff });
  } catch (error) { next(error); }
});

module.exports = router;
