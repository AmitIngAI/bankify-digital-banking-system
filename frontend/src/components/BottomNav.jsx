import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/Layout.module.css';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: 'home' },
    { path: '/accounts', label: 'Accounts', icon: 'wallet' },
    { path: '/transfer', label: 'Transfer', icon: 'transfer' },
    { path: '/transactions', label: 'History', icon: 'history' },
    { path: '/profile', label: 'Profile', icon: 'user' },
  ];

  const getIcon = (icon) => {
    const icons = {
      home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></>,
      wallet: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="14" r="2"/></>,
      transfer: <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5,12 12,5 19,12"/></>,
      history: <><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>,
      user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    };
    return icons[icon];
  };

  return (
    <nav className={styles.bottomNav}>
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`${styles.bottomNavItem} ${location.pathname === item.path ? styles.bottomNavItemActive : ''}`}
        >
          <div className={styles.bottomNavIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {getIcon(item.icon)}
            </svg>
            {location.pathname === item.path && <div className={styles.bottomNavIndicator}></div>}
          </div>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;