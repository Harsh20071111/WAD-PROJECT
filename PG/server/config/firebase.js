const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

let isInitialized = false;
let messagingObj = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    const app = initializeApp({
      credential: cert(serviceAccount)
    });
    messagingObj = getMessaging(app);
    isInitialized = true;
    console.log('✅ Firebase Admin initialized');
  } else {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_BASE64 is missing. Push notifications will be disabled.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
}

// Proxy noop to prevent errors if not initialized
const noop = new Proxy({}, {
  get: () => () => Promise.resolve()
});

module.exports = {
  messaging: isInitialized ? messagingObj : noop,
  isInitialized
};
