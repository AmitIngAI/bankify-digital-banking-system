// Push Notifications Utility
export const NotificationService = {
  // Check if notifications are supported
  isSupported: () => {
    return 'Notification' in window && 'serviceWorker' in navigator;
  },

  // Request permission
  requestPermission: async () => {
    if (!NotificationService.isSupported()) {
      console.log('Notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  // Send notification
  send: (title, options = {}) => {
    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const defaultOptions = {
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      tag: 'bankify-notification',
      renotify: true,
      ...options
    };

    const notification = new Notification(title, defaultOptions);

    notification.onclick = () => {
      window.focus();
      notification.close();
      options.onClick?.();
    };

    return notification;
  },

  // Transaction notification
  sendTransactionAlert: (type, amount, description) => {
    const title = type === 'credit' ? '💰 Money Received!' : '💸 Payment Sent';
    const body = type === 'credit' 
      ? `₹${amount.toLocaleString()} received - ${description}`
      : `₹${amount.toLocaleString()} sent - ${description}`;

    return NotificationService.send(title, {
      body,
      tag: 'transaction-' + Date.now(),
      data: { type, amount, description }
    });
  },

  // Security alert
  sendSecurityAlert: (message) => {
    return NotificationService.send('🔐 Security Alert', {
      body: message,
      tag: 'security-alert',
      requireInteraction: true
    });
  },

  // Reminder notification
  sendReminder: (title, message) => {
    return NotificationService.send(`⏰ ${title}`, {
      body: message,
      tag: 'reminder'
    });
  },

  // Promo notification
  sendPromo: (title, message) => {
    return NotificationService.send(`🎁 ${title}`, {
      body: message,
      tag: 'promo'
    });
  }
};

// In-app notification store
export const createNotificationStore = () => {
  let notifications = [];
  let listeners = [];

  const notify = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    notifications = [newNotification, ...notifications].slice(0, 50);
    listeners.forEach(listener => listener(notifications));
    
    // Also send push notification if enabled
    if (notification.push !== false) {
      NotificationService.send(notification.title, {
        body: notification.message,
        tag: notification.type
      });
    }

    return newNotification;
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };

  const markAsRead = (id) => {
    notifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    listeners.forEach(listener => listener(notifications));
  };

  const markAllAsRead = () => {
    notifications = notifications.map(n => ({ ...n, read: true }));
    listeners.forEach(listener => listener(notifications));
  };

  const deleteNotification = (id) => {
    notifications = notifications.filter(n => n.id !== id);
    listeners.forEach(listener => listener(notifications));
  };

  const getAll = () => notifications;
  const getUnreadCount = () => notifications.filter(n => !n.read).length;

  return {
    notify,
    subscribe,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getAll,
    getUnreadCount
  };
};

export const notificationStore = createNotificationStore();