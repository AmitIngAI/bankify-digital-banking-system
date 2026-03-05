import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import styles from '../styles/Pages.module.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageLayout}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={styles.mainContent}>
        <div className={styles.pageContainer}>
          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.profileCover}></div>
            <div className={styles.profileInfo}>
              <div className={styles.avatarSection}>
                <img 
                  src={user?.avatar} 
                  alt={user?.firstName}
                  className={styles.profileAvatar}
                />
                <button className={styles.changeAvatarBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
              </div>
              <div className={styles.profileDetails}>
                <h1>{user?.firstName} {user?.lastName}</h1>
                <p>{user?.email}</p>
                <div className={styles.profileBadges}>
                  <span className={`${styles.badge} ${styles.verified}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                    Verified
                  </span>
                  <span className={styles.badge}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    Premium Member
                  </span>
                </div>
              </div>
              <button 
                className={styles.editProfileBtn}
                onClick={() => setIsEditing(!isEditing)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className={styles.profileContent}>
            {/* Personal Information */}
            <div className={styles.profileSection}>
              <div className={styles.sectionHeader}>
                <h2>Personal Information</h2>
              </div>
              <div className={styles.profileForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{user?.firstName}</p>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{user?.lastName}</p>
                    )}
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <p>{user?.email}</p>
                    <span className={styles.verifiedText}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                      </svg>
                      Verified
                    </span>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mobile Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    ) : (
                      <p>+91 {user?.phone}</p>
                    )}
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Date of Birth</label>
                    <p>{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-IN') : 'Not set'}</p>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Gender</label>
                    <p>{user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className={styles.profileSection}>
              <div className={styles.sectionHeader}>
                <h2>Address Information</h2>
              </div>
              <div className={styles.profileForm}>
                <div className={styles.formGroup}>
                  <label>Address</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                    />
                  ) : (
                    <p>{user?.address || 'Not set'}</p>
                  )}
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{user?.city || 'Not set'}</p>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>State</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{user?.state || 'Not set'}</p>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Pincode</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{user?.pincode || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Information */}
            <div className={styles.profileSection}>
              <div className={styles.sectionHeader}>
                <h2>KYC Information</h2>
                <span className={`${styles.kycStatus} ${styles[user?.kycStatus || 'pending']}`}>
                  {user?.kycStatus === 'verified' ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className={styles.profileForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>PAN Number</label>
                    <p>{user?.panNumber ? `${user.panNumber.slice(0, 4)}••••${user.panNumber.slice(-2)}` : 'Not set'}</p>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Aadhar Number</label>
                    <p>{user?.aadharNumber ? `••••••••${user.aadharNumber.slice(-4)}` : 'Not set'}</p>
                  </div>
                </div>
              </div>
              {user?.kycStatus !== 'verified' && (
                <button className={styles.verifyKycBtn}>
                  Complete KYC Verification
                </button>
              )}
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className={styles.saveSection}>
                <button 
                  className={`${styles.primaryBtn} ${isLoading ? styles.loading : ''}`}
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;