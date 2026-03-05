import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from './ThemeProvider'; // ✅ Import useTheme
import styles from '../styles/Layout.module.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme(); // ✅ Get theme state
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const notifications = [
    { id: 1, title: 'Welcome to Bankify!', message: 'Your account has been created successfully.', time: '2 min ago', read: false },
    { id: 2, title: 'Security Alert', message: 'New login detected from your device.', time: '1 hour ago', read: false },
    { id: 3, title: 'Account Update', message: 'Your KYC verification is pending.', time: '2 hours ago', read: true },
  ];

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.headerContainer}>
        {/* Logo */}
        <Link to="/dashboard" className={styles.headerLogo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 40 40" fill="none">
              <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M4 16H36" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="12" cy="24" r="3" fill="currentColor"/>
              <path d="M20 22H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20 26H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className={styles.logoText}>Bankify</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.headerNav}>
          <Link 
            to="/dashboard" 
            className={`${styles.navLink} ${location.pathname === '/dashboard' ? styles.navLinkActive : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/accounts" 
            className={`${styles.navLink} ${location.pathname === '/accounts' ? styles.navLinkActive : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M2 10h20"/>
            </svg>
            <span>Accounts</span>
          </Link>
          <Link 
            to="/transfer" 
            className={`${styles.navLink} ${location.pathname === '/transfer' ? styles.navLinkActive : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 1l4 4-4 4"/>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <path d="M7 23l-4-4 4-4"/>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            <span>Transfer</span>
          </Link>
          <Link 
            to="/transactions" 
            className={`${styles.navLink} ${location.pathname === '/transactions' ? styles.navLinkActive : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span>Transactions</span>
          </Link>
        </nav>

        {/* Right Section */}
        <div className={styles.headerRight}>
          {/* Search */}
          <div className={styles.searchBar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search..." />
          </div>

          {/* ✅ NEW: Dark Mode Toggle Button */}
          <button 
            className={styles.iconButton}
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDark ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              color: isDark ? '#1e293b' : '#fbbf24',
              transition: 'all 0.3s ease',
              boxShadow: isDark ? '0 4px 15px rgba(251, 191, 36, 0.3)' : '0 4px 15px rgba(30, 41, 59, 0.3)'
            }}
          >
            {isDark ? (
              // Sun Icon for Light Mode
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              // Moon Icon for Dark Mode
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Notifications */}
          <div className={styles.notificationWrapper} ref={notificationRef}>
            <button 
              className={styles.iconButton}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className={styles.notificationBadge}>3</span>
            </button>

            {showNotifications && (
              <div className={styles.notificationDropdown}>
                <div className={styles.dropdownHeader}>
                  <h4>Notifications</h4>
                  <button className={styles.markAllRead}>Mark all read</button>
                </div>
                <div className={styles.notificationList}>
                  {notifications.map(notif => (
                    <div key={notif.id} className={`${styles.notificationItem} ${!notif.read ? styles.unread : ''}`}>
                      <div className={styles.notificationIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 16v-4"/>
                          <path d="M12 8h.01"/>
                        </svg>
                      </div>
                      <div className={styles.notificationContent}>
                        <p className={styles.notificationTitle}>{notif.title}</p>
                        <p className={styles.notificationMessage}>{notif.message}</p>
                        <span className={styles.notificationTime}>{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.dropdownFooter}>
                  <Link to="/notifications">View all notifications</Link>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className={styles.userWrapper} ref={dropdownRef}>
            <button 
              className={styles.userButton}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=667eea&color=fff`} 
                alt={user?.firstName}
                className={styles.userAvatar}
              />
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.firstName} {user?.lastName}</span>
                <span className={styles.userRole}>Personal Account</span>
              </div>
              <svg className={`${styles.chevron} ${showDropdown ? styles.chevronUp : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </button>

            {showDropdown && (
              <div className={styles.userDropdown}>
                <div className={styles.dropdownUserInfo}>
                  <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=667eea&color=fff`} alt={user?.firstName} />
                  <div>
                    <p className={styles.dropdownUserName}>{user?.firstName} {user?.lastName}</p>
                    <p className={styles.dropdownUserEmail}>{user?.email}</p>
                  </div>
                </div>
                <div className={styles.dropdownDivider}></div>
                <Link to="/profile" className={styles.dropdownItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>My Profile</span>
                </Link>
                <Link to="/settings" className={styles.dropdownItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  <span>Settings</span>
                </Link>
                <Link to="/cards" className={styles.dropdownItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  <span>My Cards</span>
                </Link>
                
                {/* ✅ NEW: Dark Mode Toggle in Dropdown */}
                <button onClick={toggleTheme} className={styles.dropdownItem}>
                  {isDark ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/>
                      <line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/>
                      <line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                
                <div className={styles.dropdownDivider}></div>
                <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutItem}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;