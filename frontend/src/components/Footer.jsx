import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Layout.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerMain}>
          {/* Brand */}
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <div className={styles.logoIcon}>
                <svg viewBox="0 0 40 40" fill="none">
                  <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M4 16H36" stroke="currentColor" strokeWidth="2.5"/>
                  <circle cx="12" cy="24" r="3" fill="currentColor"/>
                </svg>
              </div>
              <span>Bankify</span>
            </div>
            <p className={styles.footerTagline}>
              Your trusted digital banking partner. Secure, fast, and reliable financial services at your fingertips.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className={styles.footerLinks}>
            <div className={styles.footerLinkGroup}>
              <h4>Products</h4>
              <Link to="/accounts">Savings Account</Link>
              <Link to="/accounts">Current Account</Link>
              <Link to="/cards">Credit Cards</Link>
              <Link to="/loans">Personal Loans</Link>
              <Link to="/loans">Home Loans</Link>
            </div>
            <div className={styles.footerLinkGroup}>
              <h4>Services</h4>
              <Link to="/transfer">Fund Transfer</Link>
              <Link to="/transactions">Bill Payments</Link>
              <Link to="#">Mobile Banking</Link>
              <Link to="#">Internet Banking</Link>
              <Link to="#">UPI Payments</Link>
            </div>
            <div className={styles.footerLinkGroup}>
              <h4>Support</h4>
              <Link to="#">Help Center</Link>
              <Link to="#">FAQs</Link>
              <Link to="#">Contact Us</Link>
              <Link to="#">Branch Locator</Link>
              <Link to="#">Report Fraud</Link>
            </div>
            <div className={styles.footerLinkGroup}>
              <h4>Legal</h4>
              <Link to="#">Privacy Policy</Link>
              <Link to="#">Terms of Service</Link>
              <Link to="#">Cookie Policy</Link>
              <Link to="#">Security</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Bankify. All rights reserved.</p>
          <div className={styles.footerCertifications}>
            <span className={styles.certification}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              SSL Secured
            </span>
            <span className={styles.certification}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              PCI DSS Compliant
            </span>
            <span className={styles.certification}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              24/7 Support
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;