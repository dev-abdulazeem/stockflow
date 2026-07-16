import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useNotifications() {
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [vapidKey, setVapidKey] = useState(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    fetchVapidKey();
  }, []);

  const fetchVapidKey = async () => {
    try {
      const { data } = await api.get('/notifications/vapid-key');
      setVapidKey(data.publicKey);
    } catch (error) {
      console.error('Failed to fetch VAPID key:', error);
    }
  };

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('This device does not support notifications');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      await subscribeToPush();
    }
    
    return result === 'granted';
  }, [vapidKey]);

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !vapidKey) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      
      if (existingSub) {
        setSubscription(existingSub);
        await saveSubscription(existingSub);
        return;
      }

      const newSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      setSubscription(newSub);
      await saveSubscription(newSub);
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  };

  const saveSubscription = async (sub) => {
    try {
      await api.post('/notifications/subscribe', {
        subscription: sub,
      });
    } catch (error) {
      console.error('Failed to save subscription:', error);
    }
  };

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    
    try {
      await subscription.unsubscribe();
      await api.post('/notifications/unsubscribe');
      setSubscription(null);
      setPermission('default');
    } catch (error) {
      console.error('Unsubscribe failed:', error);
    }
  }, [subscription]);

  // Send local notification (for testing)
  const sendLocalNotification = useCallback((title, options = {}) => {
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: 'stockflow',
          requireInteraction: true,
          ...options,
        });
      });
    }
  }, [permission]);

  // Send push notification from server
  const sendPushNotification = useCallback(async (title, body, url = '/') => {
    try {
      await api.post('/notifications/send', {
        title,
        body,
        url,
      });
    } catch (error) {
      console.error('Failed to send push:', error);
    }
  }, []);

  return {
    permission,
    subscription,
    requestPermission,
    unsubscribe,
    sendLocalNotification,
    sendPushNotification,
  };
}

// Helper
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}