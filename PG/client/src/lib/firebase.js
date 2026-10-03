import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let messagingObj = null;

try {
  app = initializeApp(firebaseConfig);
} catch (err) {
  console.warn('Firebase initialization error', err);
}

export const getMessagingInstance = async () => {
  if (messagingObj) return messagingObj;
  
  if (app) {
    try {
      const supported = await isSupported();
      if (supported) {
        messagingObj = getMessaging(app);
        return messagingObj;
      }
    } catch (e) {
      console.warn('Firebase messaging not supported or error:', e);
    }
  }
  return null;
};
