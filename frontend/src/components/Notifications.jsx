import React, { useState, useEffect } from 'react';
import { notificationService } from '../utils/api';
import styles from '../styles/Components.module.css';

const Notifications = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAllNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.log('Using demo notifications');
      // Demo data
      setNotifications([
        {
          _id: '1',
          type: 'transaction',
          title: 'Money Received',
          message: '₹5,000 received from Rahul Kumar',
          createdAt: new Date(Date.now() - 2 * 60 * 1000),
          read: false,
          icon: '💰'
        },
        {
          _id: '2',
          type: 'alert',
          title: 'Security Alert',
          message: 'New login detected from Mumbai, India',
          createdAt: new Date(Date.now() - 60 * 60 * 1000),
          read: false,
          icon: '🔐'
        },
        {
          _id: '3',
          type: 'payment',
          title: 'Bill Payment Due',
          message: 'Electricity bill of ₹2,450 is due on 25th Dec',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          read: false,
          icon: '⚡'
        },
        {
          _id: '4',
          type: 'loan',
          title: 'EMI Reminder',
          message: 'Your loan EMI of ₹16,500 is due tomorrow',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          read: true,
          icon: '⏰'
        },
        {
          _id: '5',
          type: 'transaction',
          title: 'Payment Successful',
          message: 'Netflix subscription ₹649 paid successfully',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          read: true,
          icon: '✅'
        },
        {
          _id: '6',
          type: 'investment',
          title: 'FD Maturity Alert',
          message: 'Your FD of ₹1,00,000 will mature on 30th Dec',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          read: true,
          icon: '🏦'
        },
        {
          _id: '7',
          type: 'promo',
          title: 'Special Offer',
          message: 'Get 5% cashback on electricity bill payments',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          read: true,
          icon: '🎁'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.log('Demo mode: marking as read locally');
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.log('Demo mode: marking all as read locally');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.log('Demo mode: deleting locally');
      setNotifications(prev => prev.filter(n => n._id !== id));
    }
  };

  const deleteAllRead = async () => {
    const readNotifications = notifications.filter(n => n.read);
    
    try {
      await Promise.all(
        readNotifications.map(n => notificationService.deleteNotification(n._id))
      );
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (error) {
      console.log('Demo mode: deleting all read locally');
      setNotifications(prev => prev.filter(n => !n.read));
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return notifDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const getNotificationIcon = (type) => {
    const icons = {
      transaction: '💰',
      payment: '💳',
      alert: '🔐',
      security: '⚠️',
      promo: '🎁',
      reminder: '⏰',
      loan: '🏦',
      investment: '📈',
      bill: '⚡',
      card: '💳',
      success: '✅',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[type] || '🔔';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const filterOptions = [
    { value: 'all', label: 'All', showCount: false },
    { value: 'unread', label: 'Unread', showCount: true },
    { value: 'transaction', label: 'Transactions', showCount: false },
    { value: 'payment', label: 'Payments', showCount: false },
    { value: 'alert', label: 'Alerts', showCount: false },
    { value: 'promo', label: 'Offers', showCount: false },
  ];

  return (
    <div className={styles.notificationsPanel}>
      <div className={styles.notifHeader}>
        <div className={styles.notifHeaderLeft}>
          <h2>
            Notifications
            {unreadCount > 0 && (
              <span className={styles.headerBadge}>{unreadCount}</span>
            )}
          </h2>
        </div>
        <div className={styles.notifHeaderActions}>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={markAllAsRead}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Mark all read
            </button>
          )}
          {notifications.filter(n => n.read).length > 0 && (
            <button className={styles.clearBtn} onClick={deleteAllRead}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              </svg>
              Clear read
            </button>
          )}
          <button className={styles.closeBtn} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.notifFilters}>
        {filterOptions.map(f => (
          <button
            key={f.value}
            className={`${styles.filterBtn} ${filter === f.value ? styles.active : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            {f.showCount && unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.notifList}>
        {loading ? (
          <div className={styles.notifLoading}>
            <div className={styles.spinner}></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map(notif => (
            <div 
              key={notif._id} 
              className={`${styles.notifItem} ${!notif.read ? styles.unread : ''}`}
              onClick={() => !notif.read && markAsRead(notif._id)}
            >
              <div className={styles.notifIcon}>
                {notif.icon || getNotificationIcon(notif.type)}
              </div>
              <div className={styles.notifContent}>
                <h4>{notif.title}</h4>
                <p>{notif.message}</p>
                <span className={styles.notifTime}>
                  {getTimeAgo(notif.createdAt || notif.time)}
                </span>
              </div>
              {!notif.read && <div className={styles.unreadDot}></div>}
              <button 
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this notification?')) {
                    deleteNotification(notif._id);
                  }
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className={styles.emptyNotif}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <h3>No notifications</h3>
            <p>
              {filter === 'unread' 
                ? "You're all caught up!" 
                : `No ${filter === 'all' ? '' : filter} notifications`}
            </p>
          </div>
        )}
      </div>

      {filteredNotifications.length > 0 && (
        <div className={styles.notifFooter}>
          <button className={styles.refreshBtn} onClick={fetchNotifications}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;