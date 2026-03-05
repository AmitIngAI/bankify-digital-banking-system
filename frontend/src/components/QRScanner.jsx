import React, { useState } from 'react';
import styles from '../styles/Components.module.css';

const QRScanner = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState(null);

  // Simulate QR scan (in real app, use camera)
  const handleSimulateScan = () => {
    setIsScanning(false);
    const mockData = {
      upiId: 'merchant@upi',
      name: 'Coffee Shop',
      amount: 250,
    };
    setScannedData(mockData);
    onScan?.(mockData);
  };

  return (
    <div className={styles.qrOverlay}>
      <div className={styles.qrScanner}>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <h2>Scan QR Code</h2>

        <div className={styles.scannerFrame}>
          <div className={styles.scannerCorner} style={{top: 0, left: 0}}></div>
          <div className={styles.scannerCorner} style={{top: 0, right: 0}}></div>
          <div className={styles.scannerCorner} style={{bottom: 0, left: 0}}></div>
          <div className={styles.scannerCorner} style={{bottom: 0, right: 0}}></div>
          
          {isScanning && <div className={styles.scanLine}></div>}
          
          <div className={styles.mockQR}>
            <svg viewBox="0 0 100 100" fill="currentColor">
              <rect x="10" y="10" width="20" height="20"/>
              <rect x="70" y="10" width="20" height="20"/>
              <rect x="10" y="70" width="20" height="20"/>
              <rect x="40" y="40" width="20" height="20"/>
              <rect x="35" y="10" width="10" height="10"/>
              <rect x="55" y="35" width="10" height="10"/>
              <rect x="35" y="55" width="10" height="10"/>
            </svg>
          </div>
        </div>

        <p className={styles.scanHint}>
          {isScanning ? 'Point camera at QR code' : 'QR Code Scanned!'}
        </p>

        {/* Demo button - remove in production */}
        <button className={styles.demoScanBtn} onClick={handleSimulateScan}>
          📷 Simulate Scan (Demo)
        </button>

        {scannedData && (
          <div className={styles.scannedResult}>
            <p><strong>{scannedData.name}</strong></p>
            <p>{scannedData.upiId}</p>
            {scannedData.amount && <p className={styles.amount}>₹{scannedData.amount}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;