const { messaging, isInitialized } = require('../config/firebase');
const DeviceToken = require('../models/DeviceToken');
const User = require('../models/User');

const cleanInvalidTokens = async (response, tokens) => {
  const invalidTokens = [];
  response.responses.forEach((res, idx) => {
    if (!res.success) {
      const errorCode = res.error?.code;
      if (
        errorCode === 'messaging/registration-token-not-registered' ||
        errorCode === 'messaging/invalid-registration-token'
      ) {
        invalidTokens.push(tokens[idx]);
      }
    }
  });

  if (invalidTokens.length > 0) {
    try {
      await DeviceToken.deleteMany({ token: { $in: invalidTokens } });
    } catch (err) {
      console.error('Failed to clean up invalid push tokens:', err);
    }
  }
};

exports.sendToUser = async (userId, { title, body, link, type }) => {
  if (!isInitialized) return;
  try {
    const devices = await DeviceToken.find({ userId });
    if (!devices.length) return;

    const tokens = devices.map(d => d.token);
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const absoluteLink = link?.startsWith('http') ? link : `${frontendUrl}${link || ''}`;

    const message = {
      notification: { title, body },
      data: { 
        link: absoluteLink, 
        type: type || 'default' 
      },
      webpush: {
        fcmOptions: {
          link: absoluteLink
        }
      },
      tokens
    };

    // Firebase limit is 500 per batch
    for (let i = 0; i < tokens.length; i += 500) {
      const batchTokens = tokens.slice(i, i + 500);
      const response = await messaging.sendEachForMulticast({ ...message, tokens: batchTokens });
      await cleanInvalidTokens(response, batchTokens);
    }
  } catch (err) {
    console.error(`Push error for user ${userId}:`, err.message);
  }
};

exports.sendToRole = async (pgId, role, payload) => {
  if (!isInitialized) return;
  try {
    const users = await User.find({ pgId, role });
    for (const user of users) {
      this.sendToUser(user._id, payload).catch(() => {});
    }
  } catch (err) {
    console.error(`Push role error for pg ${pgId} / role ${role}:`, err.message);
  }
};
