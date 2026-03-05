import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Components.module.css';

const OTPVerification = ({ onVerify, onResend, phone, onClose }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setIsVerifying(true);
    try {
      // Simulate OTP verification (accept any 6-digit OTP for demo)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otpString === '123456' || otpString.length === 6) {
        onVerify(otpString);
      } else {
        setError('Invalid OTP. Try 123456');
      }
    } catch (err) {
      setError('Verification failed');
    }
    setIsVerifying(false);
  };

  const handleResend = () => {
    setTimer(30);
    setOtp(['', '', '', '', '', '']);
    setError('');
    onResend?.();
  };

  return (
    <div className={styles.otpOverlay}>
      <div className={styles.otpModal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className={styles.otpIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h2>Verify OTP</h2>
        <p>Enter the 6-digit code sent to<br/><strong>+91 {phone || '••••••7890'}</strong></p>

        <div className={styles.otpInputs} onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`${styles.otpInput} ${error ? styles.error : ''}`}
              disabled={isVerifying}
            />
          ))}
        </div>

        {error && <p className={styles.otpError}>{error}</p>}

        <p className={styles.otpHint}>💡 Demo: Use OTP <strong>123456</strong></p>

        <button 
          className={`${styles.verifyBtn} ${isVerifying ? styles.loading : ''}`}
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <>
              <span className={styles.spinner}></span>
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>

        <div className={styles.resendSection}>
          {timer > 0 ? (
            <p>Resend OTP in <strong>{timer}s</strong></p>
          ) : (
            <button className={styles.resendBtn} onClick={handleResend}>
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;