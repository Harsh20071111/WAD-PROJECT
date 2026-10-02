const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const Payment = require('../models/Payment');
const PaymentReceipt = require('../models/PaymentReceipt');
const Resident = require('../models/Resident');
const PG = require('../models/PG');
const Counter = require('../models/Counter');
const notify = require('../utils/notify');

const router = express.Router();
router.use(protect);

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

router.get('/mine', restrictTo('RESIDENT'), async (req, res, next) => {
  try {
    const resident = await Resident.findOne({ userId: req.user._id, pgId: req.user.pgId });
    res.json({ success: true, data: resident ? await Payment.find({ residentId: resident._id }).sort({ month: -1 }) : [] });
  } catch (error) { next(error); }
});

router.get('/', restrictTo('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    res.json({ success: true, data: await Payment.find({ pgId: req.user.pgId }).populate({ path: 'residentId', populate: { path: 'userId', select: 'name email phone' } }).sort({ dueDate: -1 }) });
  } catch (error) { next(error); }
});

router.post('/', restrictTo('ADMIN'), async (req, res, next) => {
  try {
    const { residentId, month, amount, dueDate } = req.body;
    const resident = await Resident.findOne({ _id: residentId, pgId: req.user.pgId });
    if (!resident) return res.status(404).json({ success: false, message: 'Resident is not part of this PG.' });
    const payment = await Payment.create({ pgId: req.user.pgId, residentId, month, amount, dueDate });
    await notify(resident.userId, 'PAYMENT_CREATED', 'New payment due', `${month} rent of ₹${amount} is now due.`, '/resident/payments');
    res.status(201).json({ success: true, data: payment });
  } catch (error) { next(error); }
});

router.post('/:id/order', restrictTo('RESIDENT'), async (req, res, next) => {
  try {
    if (!razorpay) return res.status(503).json({ success: false, message: 'Razorpay is not configured on the server.' });
    const resident = await Resident.findOne({ userId: req.user._id, pgId: req.user.pgId });
    const payment = await Payment.findOne({ _id: req.params.id, residentId: resident?._id, status: { $in: ['PENDING', 'OVERDUE', 'PARTIALLY_PAID'] } });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment is not available.' });
    const order = await razorpay.orders.create({ amount: Math.round((payment.amount - payment.paidAmount) * 100), currency: 'INR', receipt: `payment_${payment._id}` });
    payment.gatewayOrderId = order.id;
    await payment.save();
    res.status(201).json({ success: true, data: { key: process.env.RAZORPAY_KEY_ID, order, payment } });
  } catch (error) { next(error); }
});

router.post('/:id/verify', restrictTo('RESIDENT'), async (req, res, next) => {
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    const payment = await Payment.findOne({ _id: req.params.id, residentId: (await Resident.findOne({ userId: req.user._id }))?._id, gatewayOrderId: orderId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment order not found.' });
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
    const received = Buffer.from(signature || '');
    if (received.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(expected), received)) return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    payment.paidAmount = payment.amount;
    payment.status = 'PAID';
    payment.transactionId = paymentId;
    payment.method = 'RAZORPAY';
    payment.paidAt = new Date();
    await payment.save();
    const resident = await Resident.findById(payment.residentId).populate('userId').populate('roomId').populate('bedId');
    const pg = await PG.findById(payment.pgId);
    const receiptNumber = `RCP-${String(await Counter.getNext('receipt')).padStart(6, '0')}`;
    const receipt = await PaymentReceipt.create({ paymentId: payment._id, receiptNumber, residentSnapshot: { name: resident.userId.name, email: resident.userId.email, phone: resident.userId.phone, roomNumber: resident.roomId?.roomNumber, bedLabel: resident.bedId?.label }, pgSnapshot: { name: pg.name, address: `${pg.address.street}, ${pg.address.city}` }, month: payment.month, amount: payment.amount, paidAt: payment.paidAt, transactionId: paymentId });
    await notify(req.user._id, 'PAYMENT_SUCCESS', 'Payment successful', `${payment.month} rent payment received.`, '/resident/payments');
    res.json({ success: true, data: { payment, receipt } });
  } catch (error) { next(error); }
});

module.exports = router;
