const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Send a notification to a specific user
 */
const notify = async ({ userId, type, title, message, link = '' }) => {
  try {
    const notification = await Notification.create({
      userId,
      type: type || 'SYSTEM',
      title,
      message,
      link
    });
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
};

/**
 * Send notification to all admin users
 */
const notifyAllAdmins = async ({ type = 'SLA_BREACH', title, message, link = '' }) => {
  try {
    const admins = await User.find({ role: 'ADMIN', isActive: true }).select('_id');
    const docs = admins.map(admin => ({
      userId: admin._id,
      type,
      title,
      message,
      link
    }));
    if (docs.length > 0) {
      await Notification.insertMany(docs);
    }
  } catch (err) {
    console.error('Error notifying admins:', err.message);
  }
};

module.exports = { notify, notifyAllAdmins };
