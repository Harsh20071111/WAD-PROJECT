const Notification = require('../models/Notification');
const pushService = require('../services/pushService');
const User = require('../models/User');

const notify = async (userId, type, title, message, link = '') => {
  const notif = await Notification.create({ userId, type, title, message, link });
  
  // Fire-and-forget push
  pushService.sendToUser(userId, {
    title,
    body: message,
    link,
    type
  }).catch(() => {});
  
  return notif;
};

notify.notifyAdmins = async (pgId, { type, title, message, link }) => {
  try {
    const admins = await User.find({ pgId, role: 'ADMIN' });
    const promises = admins.map(admin => notify(admin._id, type, title, message, link));
    await Promise.all(promises);
  } catch (err) {
    console.error('Error notifying admins:', err);
  }
};

module.exports = notify;
