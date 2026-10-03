const cron = require('node-cron');
const Payment = require('../models/Payment');
const Resident = require('../models/Resident');
const notify = require('../utils/notify');

const REMINDER_OFFSETS = [5, 0]; // Days

const runRentReminders = async () => {
  console.log('[Rent Reminder Cron] Running rent reminders check...');
  try {
    for (const offset of REMINDER_OFFSETS) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + offset);
      
      // IST bounds for the target date
      // targetDate is currently in server timezone, let's just use UTC logic with an offset if needed,
      // but standard approach is to use the local date strings
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      const tag = `${offset}D`;

      const payments = await Payment.find({
        status: { $in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] },
        dueDate: { $gte: startOfDay, $lte: endOfDay },
        remindersSent: { $ne: tag }
      }).populate('residentId');

      for (const payment of payments) {
        if (!payment.residentId || !payment.residentId.userId) continue;

        const outstanding = payment.amount - (payment.paidAmount || 0);
        const dueStr = new Date(payment.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        
        const title = offset === 0 ? "Rent due today" : `Rent due in ${offset} days`;
        const body = `Your PG rent of ₹${outstanding} is due on ${dueStr}. Tap to pay.`;

        await notify(payment.residentId.userId, 'PAYMENT_REMINDER', title, body, '/resident/payments');

        payment.remindersSent.push(tag);
        payment.reminderSentAt = new Date();
        await payment.save();
      }
    }
  } catch (err) {
    console.error('[Rent Reminder Cron] Error running rent reminders:', err.message);
  }
};

const initRentReminderCron = () => {
  // Run daily at 09:00 IST
  cron.schedule('0 9 * * *', runRentReminders, {
    timezone: 'Asia/Kolkata'
  });
};

module.exports = {
  initRentReminderCron,
  runRentReminders
};
