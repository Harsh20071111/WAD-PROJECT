const Resident = require('../models/Resident');
const Bed = require('../models/Bed');
const Room = require('../models/Room');
const PG = require('../models/PG');
const User = require('../models/User');
const Payment = require('../models/Payment');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @GET /api/residents/me
const getMe = asyncHandler(async (req, res) => {
  const resident = await Resident.findOne({ userId: req.user._id })
    .populate('userId', 'name email phone role')
    .populate('pgId', 'name address contact amenities')
    .populate('roomId')
    .populate('bedId');

  if (!resident) {
    return res.status(404).json({
      success: false,
      message: 'Resident profile not found for this account.'
    });
  }

  let roommates = [];
  if (resident.roomId) {
    const beds = await Bed.find({ roomId: resident.roomId._id }).populate({
      path: 'residentId',
      populate: { path: 'userId', select: 'name email phone' }
    });

    roommates = beds.map((bed) => {
      const resDoc = bed.residentId;
      const userDoc = resDoc?.userId;
      const isMe = resDoc && resDoc._id.toString() === resident._id.toString();

      return {
        bedId: bed._id,
        label: bed.label,
        status: bed.status,
        residentName: isMe
          ? `${req.user.name} (You)`
          : userDoc?.name || (bed.status === 'OCCUPIED' ? 'Occupied' : 'Vacant'),
        isMe: Boolean(isMe)
      };
    });
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  let currentPayment = await Payment.findOne({
    residentId: resident._id,
    month: currentMonth
  });

  const dues = {
    month: currentMonth,
    amount: currentPayment ? currentPayment.amount : resident.monthlyRent,
    paidAmount: currentPayment ? currentPayment.paidAmount : 0,
    dueDate: currentPayment ? currentPayment.dueDate : new Date(now.getFullYear(), now.getMonth(), 5),
    status: currentPayment ? currentPayment.status : 'PENDING'
  };

  res.status(200).json({
    success: true,
    data: {
      resident,
      roommates,
      room: resident.roomId,
      bed: resident.bedId,
      dues
    }
  });
});

// @GET /api/residents/dues
const getDues = asyncHandler(async (req, res) => {
  const resident = await Resident.findOne({ userId: req.user._id });
  if (!resident) {
    return res.status(404).json({ success: false, message: 'Resident profile not found' });
  }

  const payments = await Payment.find({ residentId: resident._id }).sort({ month: -1 });

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentPayment = payments.find(p => p.month === currentMonth);

  res.status(200).json({
    success: true,
    data: {
      monthlyRent: resident.monthlyRent,
      currentDue: {
        month: currentMonth,
        amount: currentPayment ? currentPayment.amount : resident.monthlyRent,
        paidAmount: currentPayment ? currentPayment.paidAmount : 0,
        dueDate: currentPayment ? currentPayment.dueDate : new Date(now.getFullYear(), now.getMonth(), 5),
        status: currentPayment ? currentPayment.status : 'PENDING'
      },
      history: payments
    }
  });
});

module.exports = { getMe, getDues };
