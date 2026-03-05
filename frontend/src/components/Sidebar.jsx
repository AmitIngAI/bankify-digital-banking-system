import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/Layout.module.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/accounts', label: 'Accounts', icon: 'wallet' },
    { path: '/transfer', label: 'Transfer', icon: 'transfer' },
    { path: '/transactions', label: 'Transactions', icon: 'history' },
    { path: '/cards', label: 'Cards', icon: 'card' },
    { path: '/loans', label: 'Loans', icon: 'loan' },
    { path: '/profile', label: 'Profile', icon: 'user' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];

  const getIcon = (icon) => {
    const icons = {
      home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
      wallet: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></>,
      transfer: <><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></>,
      history: <><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>,
      card: <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
      loan: <><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
      user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
      settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    };
    return icons[icon];
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`${styles.sidebarOverlay} ${isOpen ? styles.show : ''}`} 
        onClick={onClose}
      />
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <nav className={styles.sidebarNav}>
          <div className={styles.sidebarSection}>
            <span className={styles.sidebarSectionTitle}>Main Menu</span>
            {menuItems.slice(0, 6).map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.sidebarLink} ${location.pathname === item.path ? styles.sidebarLinkActive : ''}`}
                onClick={onClose}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {getIcon(item.icon)}
                </svg>
                <span>{item.label}</span>
                {location.pathname === item.path && <div className={styles.activeIndicator}></div>}
              </Link>
            ))}
          </div>
          
          <div className={styles.sidebarSection}>
            <span className={styles.sidebarSectionTitle}>Account</span>
            {menuItems.slice(6).map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.sidebarLink} ${location.pathname === item.path ? styles.sidebarLinkActive : ''}`}
                onClick={onClose}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {getIcon(item.icon)}
                </svg>
                <span>{item.label}</span>
                {location.pathname === item.path && <div className={styles.activeIndicator}></div>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.helpCard}>
            <div className={styles.helpIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h4>Need Help?</h4>
            <p>Contact our 24/7 support team</p>
            <button className={styles.helpButton}>Get Support</button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;