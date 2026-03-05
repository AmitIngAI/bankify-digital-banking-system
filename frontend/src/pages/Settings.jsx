import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import styles from '../styles/Pages.module.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    smsAlerts: true,
    pushNotifications: true,
    biometricLogin: false,
    twoFactorAuth: true,
    transactionAlerts: true,
    marketingEmails: false,
    darkMode: false,
    language: 'en'
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const settingsSections = [
    {
      title: 'Notifications',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      ),
      items: [
        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive notifications on your device' },
        { key: 'emailAlerts', label: 'Email Alerts', desc: 'Get important updates via email' },
        { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive SMS for transactions' },
        { key: 'transactionAlerts', label: 'Transaction Alerts', desc: 'Get notified for every transaction' }
      ]
    },
    {
      title: 'Security',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      items: [
        { key: 'biometricLogin', label: 'Biometric Login', desc: 'Use fingerprint or face ID to login' },
        { key: 'twoFactorAuth', label: 'Two-Factor Authentication', desc: 'Add extra layer of security' }
      ]
    },
    {
      title: 'Preferences',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
      items: [
        { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive offers and promotional content' },
        { key: 'darkMode', label: 'Dark Mode', desc: 'Switch to dark theme' }
      ]
    }
  ];

  return (
    <div className={styles.pageLayout}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={styles.mainContent}>
        <div className={styles.pageContainer}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              <h1>Settings</h1>
              <p>Manage your account settings and preferences</p>
            </div>
          </div>

          {/* Settings Sections */}
          <div className={styles.settingsContainer}>
            {settingsSections.map((section, idx) => (
              <div key={idx} className={styles.settingsSection}>
                <div className={styles.settingsSectionHeader}>
                  <div className={styles.settingsIcon}>{section.icon}</div>
                  <h2>{section.title}</h2>
                </div>
                <div className={styles.settingsList}>
                  {section.items.map((item) => (
                    <div key={item.key} className={styles.settingItem}>
                      <div className={styles.settingInfo}>
                        <span className={styles.settingLabel}>{item.label}</span>
                        <span className={styles.settingDesc}>{item.desc}</span>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settings[item.key]}
                          onChange={() => handleToggle(item.key)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Language */}
            <div className={styles.settingsSection}>
              <div className={styles.settingsSectionHeader}>
                <div className={styles.settingsIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <h2>Language & Region</h2>
              </div>
              <div className={styles.settingsList}>
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <span className={styles.settingLabel}>Language</span>
                    <span className={styles.settingDesc}>Select your preferred language</span>
                  </div>
                  <select 
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className={styles.languageSelect}
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="mr">मराठी</option>
                    <option value="ta">தமிழ்</option>
                    <option value="te">తెలుగు</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.settingsSection}>
              <div className={styles.settingsSectionHeader}>
                <div className={styles.settingsIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                <h2>Quick Actions</h2>
              </div>
              <div className={styles.quickActionsList}>
                <button className={styles.quickAction}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>Change Password</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevron}>
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>
                <button className={styles.quickAction}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>Update Email</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevron}>
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>
                <button className={styles.quickAction}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>Contact Support</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevron}>
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>
                <button className={styles.quickAction}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>Help & FAQs</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevron}>
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Logout */}
            <div className={styles.logoutSection}>
              <button 
                className={styles.logoutBtn}
                onClick={() => setShowLogoutModal(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
              <p className={styles.version}>Bankify v2.0.0</p>
            </div>
          </div>

          {/* Logout Modal */}
          {showLogoutModal && (
            <div className={styles.modalOverlay} onClick={() => setShowLogoutModal(false)}>
              <div className={styles.logoutModal} onClick={e => e.stopPropagation()}>
                <div className={styles.logoutIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
                <h3>Logout</h3>
                <p>Are you sure you want to logout from your account?</p>
                <div className={styles.logoutActions}>
                  <button 
                    className={styles.cancelBtn}
                    onClick={() => setShowLogoutModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className={styles.confirmLogoutBtn}
                    onClick={handleLogout}
                  >
                    Yes, Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;