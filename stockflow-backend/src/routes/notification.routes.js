const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const { authenticate } = require('../middleware/auth.middleware');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@stockflow.app',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Store subscriptions in memory (use DB in production)
const subscriptions = new Map();

router.get('/vapid-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.post('/subscribe', authenticate, (req, res) => {
  const { subscription, userId } = req.body;
  
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: 'Invalid subscription' });
  }

  subscriptions.set(userId, subscription);
  console.log(`User ${userId} subscribed to notifications`);
  
  res.status(201).json({ message: 'Subscribed successfully' });
});

router.post('/unsubscribe', authenticate, (req, res) => {
  const { userId } = req.body;
  subscriptions.delete(userId);
  res.json({ message: 'Unsubscribed' });
});

// Send notification to specific user
router.post('/send', authenticate, async (req, res) => {
  const { userId, title, body, url } = req.body;
  
  const subscription = subscriptions.get(userId);
  if (!subscription) {
    return res.status(404).json({ message: 'User not subscribed' });
  }

  const payload = JSON.stringify({
    title: title || 'StockFlow',
    body: body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'stockflow',
    data: { url: url || '/' },
    actions: [
      { action: 'open', title: 'Open App' }
    ]
  });

  try {
    await webpush.sendNotification(subscription, payload);
    res.json({ message: 'Notification sent' });
  } catch (error) {
    console.error('Push error:', error);
    if (error.statusCode === 410) {
      subscriptions.delete(userId); // Remove expired subscription
    }
    res.status(500).json({ message: 'Failed to send notification' });
  }
});

// Send to all subscribers (for admin/broadcast)
router.post('/broadcast', authenticate, async (req, res) => {
  const { title, body } = req.body;
  
  const payload = JSON.stringify({
    title: title || 'StockFlow',
    body: body || 'Broadcast message',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'stockflow-broadcast',
    data: { url: '/' },
  });

  const results = [];
  for (const [userId, subscription] of subscriptions) {
    try {
      await webpush.sendNotification(subscription, payload);
      results.push({ userId, status: 'sent' });
    } catch (error) {
      console.error(`Failed to send to ${userId}:`, error);
      if (error.statusCode === 410) {
        subscriptions.delete(userId);
      }
      results.push({ userId, status: 'failed' });
    }
  }

  res.json({ message: 'Broadcast complete', results });
});

module.exports = router;