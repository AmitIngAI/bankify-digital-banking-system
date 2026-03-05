import React from 'react';
import styles from '../styles/Components.module.css';

const LoadingSpinner = ({ 
  fullScreen = false, 
  size = 'medium', 
  text = 'Loading...',
  showLogo = true 
}) => {
  
  // Full Screen Loader (for page transitions)
  if (fullScreen) {
    return (
      <div className={styles.fullScreenLoader}>
        <div className={styles.loaderContent}>
          {/* Bankify Logo */}
          {showLogo && (
            <div className={styles.bankifyLogo}>
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
            </div>
          )}
          
          {/* Spinner */}
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}>
              <div className={styles.spinnerRing}></div>
              <div className={styles.spinnerRing}></div>
              <div className={styles.spinnerRing}></div>
            </div>
          </div>
          
          {/* Loading Text */}
          {text && <p className={styles.loaderText}>{text}</p>}
        </div>
      </div>
    );
  }

  // Inline Loader (for sections/components)
  return (
    <div className={`${styles.loadingContainer} ${styles[size]}`}>
      <div className={styles.loadingSpinner}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.bankLogo}>🏦</div>
      </div>
      {text && <p className={styles.loadingText}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;