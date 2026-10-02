const Notification = require('../models/Notification');

const notify = (userId, type, title, message, link = '') =>
  Notification.create({ userId, type, title, message, link });

module.exports = notify;
