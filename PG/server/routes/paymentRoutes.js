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
const { runRentReminders } = require('../jobs/rentReminderJob');

const router = express.Router();
router.use(protect);

router.post('/run-reminders', restrictTo('ADMIN'), async (req, res, next) => {
  try {
    await runRentReminders();
    res.status(200).json({ success: true, message: 'Rent reminders triggered successfully' });
  } catch (err) {
    next(err);
  }
});

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

router.post('/custom', restrictTo('ADMIN'), async (req, res, next) => {
  try {
    const { residentId, month, amount } = req.body;
    if (!residentId || !month || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const resident = await Resident.findOne({ _id: residentId, pgId: req.user.pgId });
    if (!resident) return res.status(404).json({ success: false, message: 'Resident is not part of this PG.' });

    const [year, m] = month.split('-');
    const dueDate = new Date(year, parseInt(m) - 1, 5);

    let payment = await Payment.findOne({ residentId, month });
    
    if (payment) {
      payment.amount = amount;
      payment.lineItems = [{ type: 'ADJUSTMENT', label: 'Custom Assigned Amount', amount }];
      
      if (payment.paidAmount >= payment.amount) {
        payment.status = 'PAID';
      } else if (payment.paidAmount > 0) {
        payment.status = 'PARTIALLY_PAID';
      } else {
        const today = new Date();
        today.setHours(0,0,0,0);
        payment.status = (today > dueDate) ? 'OVERDUE' : 'PENDING';
      }
      await payment.save();
      await notify(resident.userId, 'PAYMENT_UPDATED', 'Payment amount updated', `Your ${month} payment has been updated to ₹${amount}.`, '/resident/payments');
    } else {
      payment = await Payment.create({ 
        pgId: req.user.pgId, 
        residentId, 
        month, 
        amount, 
        dueDate,
        lineItems: [{ type: 'RENT', label: 'Custom Assigned Rent', amount }]
      });
      await notify(resident.userId, 'PAYMENT_CREATED', 'New payment due', `A custom payment for ${month} of ₹${amount} is now due.`, '/resident/payments');
    }
    
    res.status(200).json({ success: true, data: payment });
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
    const receipt = await PaymentReceipt.create({ paymentId: payment._id, receiptNumber, residentSnapshot: { name: resident.userId.name, email: resident.userId.email, phone: resident.userId.phone, roomNumber: resident.roomId?.roomNumber, bedLabel: resident.bedId?.label }, pgSnapshot: { name: pg.name, address: `${pg.address.street}, ${pg.address.city}` }, month: payment.month, amount: payment.amount, lineItems: payment.lineItems, paidAt: payment.paidAt, transactionId: paymentId });
    await notify(req.user._id, 'PAYMENT_SUCCESS', 'Payment successful', `${payment.month} rent payment received.`, '/resident/payments');
    res.json({ success: true, data: { payment, receipt } });
  } catch (error) { next(error); }
});
router.get('/receipts', restrictTo('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const payments = await Payment.find({ pgId: req.user.pgId }).select('_id');
    const paymentIds = payments.map(p => p._id);
    const receipts = await PaymentReceipt.find({ paymentId: { $in: paymentIds } })
      .populate('paymentId', 'method status')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: receipts });
  } catch (error) { next(error); }
});

router.post('/rent-run', restrictTo('ADMIN'), async (req, res, next) => {
  try {
    const pgId = req.user.pgId;
    // Current month in YYYY-MM
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get all ACTIVE residents
    const residents = await Resident.find({ pgId, status: 'ACTIVE' });
    let generated = 0;
    let skipped = 0;
    let totalAmount = 0;

    for (const resi of residents) {
      try {
        // Prorate if joined mid-month
        const joiningDate = new Date(resi.joiningDate);
        let amount = resi.monthlyRent;
        let isProrated = false;

        if (joiningDate.getFullYear() === now.getFullYear() && joiningDate.getMonth() === now.getMonth()) {
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          const remainingDays = daysInMonth - joiningDate.getDate() + 1; // inclusive
          if (remainingDays < daysInMonth) {
            amount = Math.round((resi.monthlyRent / daysInMonth) * remainingDays);
            isProrated = true;
          }
        }

        const payment = new Payment({
          pgId,
          residentId: resi._id,
          month: currentMonth,
          amount,
          dueDate: new Date(now.getFullYear(), now.getMonth(), 5), // Due on 5th of current month
          lineItems: [{ type: 'RENT', label: isProrated ? 'Prorated Rent' : 'Monthly Rent', amount }]
        });

        await payment.save();
        generated++;
        totalAmount += amount;
      } catch (err) {
        if (err.code === 11000) { // duplicate key error (residentId + month)
          skipped++;
        } else {
          throw err;
        }
      }
    }

    // Call applyLateFees implicitly at the end of a rent run as a bonus, but the prompt says "Call applyLateFees() at the end", so we can just do it here.
    // However, it's better to implement applyLateFees as a separate function that can be called here and via its own endpoint.
    await applyLateFeesInternal(pgId);

    res.json({ success: true, data: { generated, skipped, totalAmount } });
  } catch (error) { next(error); }
});

const applyLateFeesInternal = async (pgId) => {
  const pg = await PG.findById(pgId);
  const graceDays = pg.graceDays || 5;
  const finePerDay = pg.finePerDay || 50;

  const today = new Date();
  today.setHours(0,0,0,0);

  const unpaidPayments = await Payment.find({
    pgId,
    status: { $in: ['PENDING', 'OVERDUE', 'PARTIALLY_PAID'] }
  });

  for (const p of unpaidPayments) {
    const dueDate = new Date(p.dueDate);
    dueDate.setHours(0,0,0,0);
    const graceDate = new Date(dueDate);
    graceDate.setDate(graceDate.getDate() + graceDays);

    if (today > graceDate) {
      const diffTime = Math.abs(today - graceDate);
      const daysPastGrace = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const lateFeeAmount = daysPastGrace * finePerDay;

      // Update line items: remove existing LATE_FEE, add new one
      p.lineItems = p.lineItems.filter(li => li.type !== 'LATE_FEE');
      p.lineItems.push({ type: 'LATE_FEE', label: 'Late Payment Fine', amount: lateFeeAmount });

      // Recompute total amount
      p.amount = p.lineItems.reduce((acc, curr) => acc + curr.amount, 0);
      p.status = 'OVERDUE';
      await p.save();
    }
  }
};

router.post('/apply-late-fees', restrictTo('ADMIN'), async (req, res, next) => {
  try {
    await applyLateFeesInternal(req.user.pgId);
    res.json({ success: true, message: 'Late fees applied successfully' });
  } catch (error) { next(error); }
});

router.post('/manual', restrictTo('ADMIN'), async (req, res, next) => {
  try {
    const { residentId, amount, mode, utr } = req.body;

    if (!residentId || !amount || !mode) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (mode === 'UPI' && !utr) {
      return res.status(400).json({ success: false, message: 'UTR required for UPI payments' });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const payments = await Payment.find({
      residentId,
      pgId: req.user.pgId,
      status: { $in: ['PENDING', 'OVERDUE', 'PARTIALLY_PAID'] }
    }).sort({ dueDate: 1 }); // oldest due first

    const totalOutstanding = payments.reduce((acc, p) => acc + (p.amount - p.paidAmount), 0);
    if (amount > totalOutstanding) {
      return res.status(400).json({ success: false, message: `Amount exceeds total outstanding of ₹${totalOutstanding}` });
    }

    let remainingToAllocate = amount;
    const resident = await Resident.findById(residentId).populate('userId').populate('roomId').populate('bedId');
    const pg = await PG.findById(req.user.pgId);

    for (const p of payments) {
      if (remainingToAllocate <= 0) break;

      const outstandingForInvoice = p.amount - p.paidAmount;
      const allocateToThis = Math.min(remainingToAllocate, outstandingForInvoice);

      p.paidAmount += allocateToThis;
      p.status = p.paidAmount >= p.amount ? 'PAID' : 'PARTIALLY_PAID';
      p.method = mode;
      p.transactionId = utr || `MANUAL-${Date.now()}`;
      p.paidAt = new Date();
      await p.save();

      remainingToAllocate -= allocateToThis;

      // Create Receipt
      const receiptNumber = `RCP-${String(await Counter.getNext('receipt')).padStart(6, '0')}`;
      await PaymentReceipt.create({
        paymentId: p._id,
        receiptNumber,
        residentSnapshot: {
          name: resident.userId.name,
          email: resident.userId.email,
          phone: resident.userId.phone,
          roomNumber: resident.roomId?.roomNumber,
          bedLabel: resident.bedId?.label
        },
        pgSnapshot: {
          name: pg.name,
          address: `${pg.address.street}, ${pg.address.city}`
        },
        month: p.month,
        amount: allocateToThis,
        lineItems: p.lineItems, // Capture current state of line items
        paidAt: p.paidAt,
        transactionId: p.transactionId
      });
    }

    await notify(resident.userId._id, 'PAYMENT_SUCCESS', 'Manual payment recorded', `A payment of ₹${amount} was recorded via ${mode}.`, '/resident/payments');

    res.json({ success: true, message: 'Payment recorded and allocated successfully' });
  } catch (error) { next(error); }
});

module.exports = router;
