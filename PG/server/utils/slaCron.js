const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const { notifyAllAdmins } = require('./notifier');

const SLA_HOURS_MAP = {
  electrical: 12,
  plumbing: 24,
  housekeeping: 24,
  cleaning: 24,
  wifi: 12,
  'wi-fi': 12,
  food: 48,
  other: 72
};

const getSlaHours = (category) => {
  if (!category) return 72;
  const key = category.toLowerCase().trim();
  return SLA_HOURS_MAP[key] || 72;
};

const checkSlaBreaches = async () => {
  try {
    const now = new Date();
    const breachedComplaints = await Complaint.find({
      slaDueAt: { $lt: now },
      status: { $nin: ['RESOLVED', 'CLOSED'] },
      breachedAt: null
    });

    for (const complaint of breachedComplaints) {
      complaint.breachedAt = now;
      complaint.timeline.push({
        status: complaint.status,
        note: `⚠️ SLA breached! (Due at ${complaint.slaDueAt.toLocaleString()}). Admin notified.`,
        time: now
      });
      await complaint.save();

      await notifyAllAdmins({
        type: 'SLA_BREACH',
        title: `🚨 SLA Breached: ${complaint.requestNo}`,
        message: `Complaint #${complaint.requestNo} (${complaint.category}: ${complaint.title}) has passed its SLA target of ${complaint.slaHours}h!`,
        link: `/admin/complaints`
      });

      console.log(`[SLA Cron] Processed SLA breach for complaint #${complaint.requestNo}`);
    }
  } catch (err) {
    console.error('[SLA Cron] Error checking SLA breaches:', err.message);
  }
};

const initSlaCron = () => {
  cron.schedule('*/5 * * * *', () => {
    console.log('[SLA Cron] Running 5-minute SLA breach check...');
    checkSlaBreaches();
  });

  setTimeout(() => {
    checkSlaBreaches();
  }, 10000);
};

module.exports = { getSlaHours, checkSlaBreaches, initSlaCron };
