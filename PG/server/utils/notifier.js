const Notification = require('../models/Notification');
const User = require('../models/User');
const pushService = require('../services/pushService');

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

    // Fire-and-forget push
    pushService.sendToUser(userId, {
      title,
      body: message,
      link,
      type: type || 'SYSTEM'
    }).catch(() => {});

    return notification;
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
};

/**
 * Send notification to all admin users of a PG
 */
const notifyAllAdmins = async (pgId, { type = 'SLA_BREACH', title, message, link = '' }) => {
  try {
    const admins = await User.find({ pgId, role: 'ADMIN', isActive: true }).select('_id');
    const docs = admins.map(admin => ({
      userId: admin._id,
      type,
      title,
      message,
      link
    }));
    if (docs.length > 0) {
      await Notification.insertMany(docs);

      // Fire-and-forget push for each admin
      docs.forEach(doc => {
        pushService.sendToUser(doc.userId, {
          title: doc.title,
          body: doc.message,
          link: doc.link,
          type: doc.type
        }).catch(() => {});
      });
    }
  } catch (err) {
    console.error('Error notifying admins:', err.message);
  }
};

module.exports = { notify, notifyAllAdmins };
