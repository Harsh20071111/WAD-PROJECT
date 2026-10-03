const admin = require('firebase-admin');

let isInitialized = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
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
  admin,
  messaging: isInitialized ? admin.messaging() : noop,
  isInitialized
};
