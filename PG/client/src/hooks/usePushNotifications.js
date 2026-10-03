import { useState, useEffect } from 'react';
import { getMessagingInstance } from '../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState('unsupported'); // 'unsupported' | 'default' | 'granted' | 'denied'

  useEffect(() => {
    if (!('Notification' in window)) {
      setStatus('unsupported');
      return;
    }
    
    // Convert native permission to our status format
    setStatus(Notification.permission);
  }, []);

  useEffect(() => {
    if (status === 'granted' && user) {
      // Silently refresh token on app load if we already have permission
      registerDevice();
    }
  }, [status, user]);

  useEffect(() => {
    let unsubscribe = () => {};

    const setupOnMessage = async () => {
      const messaging = await getMessagingInstance();
      if (messaging) {
        unsubscribe = onMessage(messaging, (payload) => {
          console.log('[Foreground Push Received]', payload);
          
          const title = payload.notification?.title || payload.data?.title || 'New Notification';
          const body = payload.notification?.body || payload.data?.body || '';
          const link = payload.data?.link;
          
          // Show a simple toast or alert if toast doesn't exist
          // Since Toast is missing in the project, we'll create a simple DOM element
          showForegroundToast(title, body, link);
        });
      }
    };
    
    if (status === 'granted' && user) {
      setupOnMessage();
    }
    
    return () => unsubscribe();
  }, [status, user]);

  const showForegroundToast = (title, body, link) => {
    // Simple dynamic toast since "Toast.jsx" wasn't found
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-surface text-on-surface p-4 rounded-lg shadow-lg border border-outline-variant z-50 animate-fade-in flex flex-col gap-2 max-w-sm';
    toast.innerHTML = `
      <div class="font-bold text-label-lg">${title}</div>
      <div class="text-body-sm text-on-surface-variant">${body}</div>
      ${link ? `<a href="${link}" class="text-primary text-label-md font-medium hover:underline self-end mt-1">View</a>` : ''}
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 5000);
  };

  const registerDevice = async () => {
    try {
      const messaging = await getMessagingInstance();
      if (!messaging) return;
      
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      // Get the VAPID key from env if available, though getToken usually works without it if setup in firebase console
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY; 
      
      const currentToken = await getToken(messaging, { 
        vapidKey, 
        serviceWorkerRegistration: registration 
      });
      
      if (currentToken) {
        await api.post('/devices/register', { token: currentToken });
        console.log('[Push] Device registered');
      }
    } catch (err) {
      console.error('[Push] Error registering device:', err);
    }
  };

  const enable = async () => {
    if (!('Notification' in window)) return;
    
    try {
      const permission = await Notification.requestPermission();
      setStatus(permission);
      
      if (permission === 'granted') {
        await registerDevice();
      }
    } catch (err) {
      console.error('[Push] Error requesting permission:', err);
    }
  };

  const disable = async () => {
    try {
      const messaging = await getMessagingInstance();
      if (!messaging) return;
      
      const registration = await navigator.serviceWorker.ready;
      const currentToken = await getToken(messaging, { serviceWorkerRegistration: registration });
      
      if (currentToken) {
        await api.delete('/devices/unregister', { data: { token: currentToken } });
        // Normally you'd also deleteToken(messaging) here but firebase limits it in some versions
      }
    } catch (err) {
      console.error('[Push] Error disabling push:', err);
    }
  };

  return { status, enable, disable };
};
