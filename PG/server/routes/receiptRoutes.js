const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const PaymentReceipt = require('../models/PaymentReceipt');
const Payment = require('../models/Payment');
const Resident = require('../models/Resident');

const router = express.Router();
router.use(protect);

const paymentIdsFor = async (req) => {
  if (req.user.role === 'ADMIN') return (await Payment.find({ pgId: req.user.pgId }).select('_id').lean()).map((p) => p._id);
  const resident = await Resident.findOne({ userId: req.user._id, pgId: req.user.pgId }).select('_id');
  return resident ? (await Payment.find({ pgId: req.user.pgId, residentId: resident._id }).select('_id').lean()).map((p) => p._id) : [];
};

router.get('/', restrictTo('ADMIN', 'RESIDENT'), async (req, res, next) => {
  try { res.json({ success: true, data: await PaymentReceipt.find({ paymentId: { $in: await paymentIdsFor(req) } }).populate('paymentId').sort({ paidAt: -1 }) }); }
  catch (error) { next(error); }
});
router.get('/:id', restrictTo('ADMIN', 'RESIDENT'), async (req, res, next) => {
  try {
    const receipt = await PaymentReceipt.findById(req.params.id).populate('paymentId');
    if (!receipt || !(await paymentIdsFor(req)).some((id) => String(id) === String(receipt.paymentId?._id || receipt.paymentId))) return res.status(404).json({ success: false, message: 'Receipt not found' });
    res.json({ success: true, data: receipt });
  } catch (error) { next(error); }
});

module.exports = router;
