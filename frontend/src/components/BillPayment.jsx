import React, { useState } from 'react';
import styles from '../styles/Components.module.css';

const BillPayment = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [formData, setFormData] = useState({
    consumerId: '',
    amount: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [billDetails, setBillDetails] = useState(null);

  const categories = [
    { id: 'electricity', name: 'Electricity', icon: '💡', color: '#f59e0b' },
    { id: 'water', name: 'Water', icon: '💧', color: '#3b82f6' },
    { id: 'gas', name: 'Gas', icon: '🔥', color: '#ef4444' },
    { id: 'broadband', name: 'Broadband', icon: '📡', color: '#8b5cf6' },
    { id: 'dth', name: 'DTH', icon: '📺', color: '#ec4899' },
    { id: 'mobile', name: 'Mobile', icon: '📱', color: '#10b981' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️', color: '#6366f1' },
    { id: 'loan', name: 'Loan EMI', icon: '💰', color: '#14b8a6' },
  ];

  const providers = {
    electricity: ['Tata Power', 'Adani Electricity', 'MSEDCL', 'BESCOM'],
    water: ['Municipal Water', 'Delhi Jal Board', 'BWSSB'],
    gas: ['Indraprastha Gas', 'Mahanagar Gas', 'Gujarat Gas'],
    broadband: ['Jio Fiber', 'Airtel Xstream', 'ACT Fibernet', 'BSNL'],
    dth: ['Tata Play', 'Airtel Digital TV', 'Dish TV', 'Sun Direct'],
    mobile: ['Jio', 'Airtel', 'Vi', 'BSNL'],
    insurance: ['LIC', 'HDFC Life', 'ICICI Prudential', 'SBI Life'],
    loan: ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank'],
  };

  const handleFetchBill = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setBillDetails({
      name: 'John Doe',
      billNumber: 'BILL' + Math.random().toString().slice(2, 10),
      dueDate: '25 Jan 2025',
      amount: Math.floor(Math.random() * 3000) + 500,
    });
    setIsLoading(false);
    setStep(3);
  };

  const handlePay = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    onSuccess?.({
      category: selectedCategory,
      provider: selectedProvider,
      amount: billDetails?.amount || formData.amount,
      transactionId: 'TXN' + Date.now(),
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.billPayModal}>
        <div className={styles.modalHeader}>
          <h2>
            {step === 1 && 'Pay Bills'}
            {step === 2 && 'Select Provider'}
            {step === 3 && 'Confirm Payment'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Step 1: Select Category */}
          {step === 1 && (
            <div className={styles.categoryGrid}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={styles.categoryCard}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setStep(2);
                  }}
                  style={{ '--cat-color': cat.color }}
                >
                  <span className={styles.categoryIcon}>{cat.icon}</span>
                  <span className={styles.categoryName}>{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Select Provider & Enter Details */}
          {step === 2 && selectedCategory && (
            <div className={styles.providerStep}>
              <button className={styles.backBtn} onClick={() => setStep(1)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>

              <div className={styles.selectedCategory}>
                <span>{selectedCategory.icon}</span>
                <span>{selectedCategory.name}</span>
              </div>

              <div className={styles.providerList}>
                {providers[selectedCategory.id]?.map(provider => (
                  <button
                    key={provider}
                    className={`${styles.providerItem} ${selectedProvider === provider ? styles.selected : ''}`}
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <span className={styles.providerLogo}>{provider.charAt(0)}</span>
                    <span>{provider}</span>
                    {selectedProvider === provider && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {selectedProvider && (
                <div className={styles.billForm}>
                  <div className={styles.formGroup}>
                    <label>Consumer ID / Account Number</label>
                    <input
                      type="text"
                      value={formData.consumerId}
                      onChange={(e) => setFormData({...formData, consumerId: e.target.value})}
                      placeholder="Enter your consumer ID"
                    />
                  </div>

                  <button 
                    className={`${styles.fetchBtn} ${isLoading ? styles.loading : ''}`}
                    onClick={handleFetchBill}
                    disabled={!formData.consumerId || isLoading}
                  >
                    {isLoading ? 'Fetching Bill...' : 'Fetch Bill Details'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm Payment */}
          {step === 3 && billDetails && (
            <div className={styles.confirmStep}>
              <button className={styles.backBtn} onClick={() => setStep(2)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>

              <div className={styles.billSummary}>
                <div className={styles.billHeader}>
                  <span className={styles.billIcon}>{selectedCategory.icon}</span>
                  <div>
                    <h3>{selectedProvider}</h3>
                    <p>{selectedCategory.name} Bill</p>
                  </div>
                </div>

                <div className={styles.billDetails}>
                  <div className={styles.billRow}>
                    <span>Consumer Name</span>
                    <span>{billDetails.name}</span>
                  </div>
                  <div className={styles.billRow}>
                    <span>Bill Number</span>
                    <span>{billDetails.billNumber}</span>
                  </div>
                  <div className={styles.billRow}>
                    <span>Due Date</span>
                    <span>{billDetails.dueDate}</span>
                  </div>
                  <div className={`${styles.billRow} ${styles.amount}`}>
                    <span>Amount</span>
                    <span>₹{billDetails.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button 
                className={`${styles.payBtn} ${isLoading ? styles.loading : ''}`}
                onClick={handlePay}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Processing...
                  </>
                ) : (
                  `Pay ₹${billDetails.amount.toLocaleString()}`
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillPayment;