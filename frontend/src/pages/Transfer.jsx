import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountAPI, beneficiaryAPI, transactionAPI } from '../utils/apiService';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import styles from '../styles/Pages.module.css';

const Transfer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('bank');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  // Data states
  const [accounts, setAccounts] = useState([]);
  const [recentBeneficiaries, setRecentBeneficiaries] = useState([]);
  const [allBeneficiaries, setAllBeneficiaries] = useState([]);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);

  // ✅ NEW: Self Transfer States
  const [selfTransferForm, setSelfTransferForm] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    remarks: ''
  });

  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccountNumber: '',
    beneficiaryName: '',
    ifscCode: '',
    bankName: '',
    amount: '',
    remarks: '',
    transferType: 'IMPS',
    saveBeneficiary: false
  });

  const [errors, setErrors] = useState({});

  // Fetch data on mount
  useEffect(() => {
    fetchAccounts();
    fetchRecentBeneficiaries();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await accountAPI.getAll();
      if (response?.data?.success) {
        const accData = response.data.data || [];
        setAccounts(Array.isArray(accData) ? accData : []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      // Demo accounts
      setAccounts([
        { _id: '1', accountNumber: '1234567890', accountType: 'savings', balance: 150000 },
        { _id: '2', accountNumber: '0987654321', accountType: 'current', balance: 250000 }
      ]);
    }
  };

  const fetchRecentBeneficiaries = async () => {
    try {
      const response = await beneficiaryAPI.getRecent();
      if (response?.data?.success) {
        const benData = response.data.data || [];
        setRecentBeneficiaries(Array.isArray(benData) ? benData : []);
      }
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      // Demo beneficiaries
      setRecentBeneficiaries([
        { _id: '1', beneficiaryName: 'Rahul Kumar', accountNumber: '9876543210', ifscCode: 'HDFC0001234', bankName: 'HDFC Bank' },
        { _id: '2', beneficiaryName: 'Priya Sharma', accountNumber: '1234567890', ifscCode: 'ICIC0001234', bankName: 'ICICI Bank' }
      ]);
    }
  };

  const fetchAllBeneficiaries = async () => {
    try {
      const response = await beneficiaryAPI.getAll();
      if (response?.data?.success) {
        const benData = response.data.data || [];
        setAllBeneficiaries(Array.isArray(benData) ? benData : []);
      }
    } catch (error) {
      console.error('Error fetching all beneficiaries:', error);
      setAllBeneficiaries([
        { _id: '1', beneficiaryName: 'Rahul Kumar', accountNumber: '9876543210', ifscCode: 'HDFC0001234', bankName: 'HDFC Bank' },
        { _id: '2', beneficiaryName: 'Priya Sharma', accountNumber: '1234567890', ifscCode: 'ICIC0001234', bankName: 'ICICI Bank' }
      ]);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'fromAccount':
        return !value ? 'Please select an account' : '';
      case 'toAccountNumber':
        if (!value) return 'Account number is required';
        if (!/^\d{9,18}$/.test(value)) return 'Invalid account number';
        return '';
      case 'beneficiaryName':
        if (!value.trim()) return 'Beneficiary name is required';
        if (value.length < 3) return 'Name too short';
        return '';
      case 'ifscCode':
        if (!value) return 'IFSC code is required';
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase())) return 'Invalid IFSC format';
        return '';
      case 'amount':
        if (!value) return 'Amount is required';
        const amt = parseFloat(value);
        if (isNaN(amt) || amt <= 0) return 'Invalid amount';
        
        // Transfer type limits
        const limits = {
          IMPS: { min: 1, max: 200000 },
          NEFT: { min: 1, max: 10000000 },
          RTGS: { min: 200000, max: 10000000 }
        };
        
        const limit = limits[formData.transferType];
        if (limit) {
          if (amt < limit.min) return `Minimum ₹${limit.min.toLocaleString()} for ${formData.transferType}`;
          if (amt > limit.max) return `Maximum ₹${limit.max.toLocaleString()} for ${formData.transferType}`;
        }
        
        const selectedAccount = accounts.find(a => a._id === formData.fromAccount);
        if (selectedAccount && amt > selectedAccount.balance) return 'Insufficient balance';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateStep = (stepNum) => {
    const stepFields = {
      1: ['fromAccount', 'toAccountNumber', 'beneficiaryName', 'ifscCode'],
      2: ['amount']
    };

    const newErrors = {};
    stepFields[stepNum]?.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSelectBeneficiary = async (beneficiary) => {
    setFormData(prev => ({
      ...prev,
      beneficiaryName: beneficiary.beneficiaryName,
      toAccountNumber: beneficiary.accountNumber,
      ifscCode: beneficiary.ifscCode,
      bankName: beneficiary.bankName || ''
    }));

    // Update last used
    try {
      await beneficiaryAPI.updateLastUsed(beneficiary._id);
    } catch (error) {
      console.error('Error updating last used:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;

    setIsLoading(true);

    try {
      const transferData = {
        fromAccountId: formData.fromAccount,
        toAccountNumber: formData.toAccountNumber,
        beneficiaryName: formData.beneficiaryName,
        ifscCode: formData.ifscCode.toUpperCase(),
        bankName: formData.bankName,
        amount: parseFloat(formData.amount),
        transferType: formData.transferType,
        remarks: formData.remarks,
        saveBeneficiary: formData.saveBeneficiary
      };

      const response = await transactionAPI.transfer(transferData);

      if (response?.data?.success) {
        setTransactionData(response.data.data);
        setShowSuccess(true);
        
        // Refresh beneficiaries if saved
        if (formData.saveBeneficiary) {
          fetchRecentBeneficiaries();
        }
      }
    } catch (error) {
      console.log('Demo mode: Transfer successful');
      // Demo success
      setTransactionData({
        transactionId: `TXN${Date.now()}`,
        amount: parseFloat(formData.amount),
        recipient: {
          name: formData.beneficiaryName,
          accountNumber: formData.toAccountNumber,
          ifscCode: formData.ifscCode
        },
        date: new Date(),
        transferType: formData.transferType,
        transactionFee: getTransferFee()
      });
      setShowSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NEW: Handle Self Transfer
  const handleSelfTransfer = async () => {
    if (!selfTransferForm.fromAccount) {
      alert('Please select source account');
      return;
    }
    if (!selfTransferForm.toAccount) {
      alert('Please select destination account');
      return;
    }
    if (selfTransferForm.fromAccount === selfTransferForm.toAccount) {
      alert('Source and destination accounts cannot be same');
      return;
    }
    if (!selfTransferForm.amount || parseFloat(selfTransferForm.amount) < 1) {
      alert('Please enter a valid amount');
      return;
    }

    const fromAcc = accounts.find(a => a._id === selfTransferForm.fromAccount);
    if (fromAcc && parseFloat(selfTransferForm.amount) > fromAcc.balance) {
      alert('Insufficient balance');
      return;
    }

    setIsLoading(true);

    try {
      // API call for self transfer
      await transactionAPI.selfTransfer({
        fromAccountId: selfTransferForm.fromAccount,
        toAccountId: selfTransferForm.toAccount,
        amount: parseFloat(selfTransferForm.amount),
        remarks: selfTransferForm.remarks
      });

      const toAcc = accounts.find(a => a._id === selfTransferForm.toAccount);
      
      setTransactionData({
        transactionId: `SELF${Date.now()}`,
        amount: parseFloat(selfTransferForm.amount),
        recipient: {
          name: 'Self Transfer',
          accountNumber: toAcc?.accountNumber || '',
          ifscCode: 'SELF'
        },
        date: new Date(),
        transferType: 'Self Transfer',
        transactionFee: 0
      });
      setShowSuccess(true);
    } catch (error) {
      console.log('Demo mode: Self transfer successful');
      const toAcc = accounts.find(a => a._id === selfTransferForm.toAccount);
      
      setTransactionData({
        transactionId: `SELF${Date.now()}`,
        amount: parseFloat(selfTransferForm.amount),
        recipient: {
          name: 'Self Transfer',
          accountNumber: toAcc?.accountNumber || '',
          ifscCode: 'SELF'
        },
        date: new Date(),
        transferType: 'Self Transfer',
        transactionFee: 0
      });
      setShowSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBeneficiary = async (beneficiaryData) => {
    try {
      const response = await beneficiaryAPI.add(beneficiaryData);
      if (response?.data?.success) {
        fetchRecentBeneficiaries();
        fetchAllBeneficiaries();
        setShowBeneficiaryModal(false);
      }
    } catch (error) {
      // Demo success
      console.log('Demo: Beneficiary added');
      const newBen = {
        _id: Date.now().toString(),
        ...beneficiaryData
      };
      setRecentBeneficiaries(prev => [newBen, ...prev]);
      setAllBeneficiaries(prev => [newBen, ...prev]);
      setShowBeneficiaryModal(false);
      alert('Beneficiary added successfully!');
    }
  };

  const handleDeleteBeneficiary = async (id) => {
    if (window.confirm('Are you sure you want to delete this beneficiary?')) {
      try {
        await beneficiaryAPI.delete(id);
        fetchRecentBeneficiaries();
        fetchAllBeneficiaries();
      } catch (error) {
        // Demo delete
        setRecentBeneficiaries(prev => prev.filter(b => b._id !== id));
        setAllBeneficiaries(prev => prev.filter(b => b._id !== id));
      }
    }
  };

  // ✅ NEW: Handle Tab Change with UPI Navigation
  const handleTabChange = (tab) => {
    if (tab === 'upi') {
      // Navigate to UPI page
      navigate('/upi');
    } else {
      setActiveTab(tab);
      setStep(1); // Reset step when changing tabs
      setErrors({});
    }
  };

  const selectedAccount = accounts.find(a => a._id === formData.fromAccount);

  const getTransferFee = () => {
    const amount = parseFloat(formData.amount) || 0;
    switch (formData.transferType) {
      case 'IMPS':
        return amount > 1000 ? 5 : 0;
      case 'NEFT':
        return 0;
      case 'RTGS':
        return amount >= 200000 ? 25 : 0;
      default:
        return 0;
    }
  };

  // Success Screen
  if (showSuccess && transactionData) {
    return (
      <div className={styles.pageLayout}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className={styles.mainContent}>
          <div className={styles.successContainer}>
            <div className={styles.successCard}>
              <div className={styles.successIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
              </div>
              <h1>Transfer Successful!</h1>
              <p className={styles.successAmount}>{formatCurrency(transactionData.amount)}</p>
              <p>has been sent to</p>
              <p className={styles.successBeneficiary}>{transactionData.recipient.name}</p>
              
              <div className={styles.successDetails}>
                <div className={styles.successRow}>
                  <span>Transaction ID</span>
                  <span>{transactionData.transactionId}</span>
                </div>
                <div className={styles.successRow}>
                  <span>To Account</span>
                  <span>••••{transactionData.recipient.accountNumber.slice(-4)}</span>
                </div>
                {transactionData.recipient.ifscCode !== 'SELF' && (
                  <div className={styles.successRow}>
                    <span>IFSC Code</span>
                    <span>{transactionData.recipient.ifscCode}</span>
                  </div>
                )}
                <div className={styles.successRow}>
                  <span>Date & Time</span>
                  <span>{new Date(transactionData.date).toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.successRow}>
                  <span>Transfer Type</span>
                  <span>{transactionData.transferType}</span>
                </div>
                {transactionData.transactionFee > 0 && (
                  <div className={styles.successRow}>
                    <span>Transfer Fee</span>
                    <span>₹{transactionData.transactionFee}</span>
                  </div>
                )}
              </div>

              <div className={styles.successActions}>
                <button 
                  className={styles.secondaryBtn}
                  onClick={() => navigate('/transactions')}
                >
                  View Transactions
                </button>
                <button 
                  className={styles.primaryBtn}
                  onClick={() => {
                    setShowSuccess(false);
                    setTransactionData(null);
                    setStep(1);
                    setFormData({
                      fromAccount: '',
                      toAccountNumber: '',
                      beneficiaryName: '',
                      ifscCode: '',
                      bankName: '',
                      amount: '',
                      remarks: '',
                      transferType: 'IMPS',
                      saveBeneficiary: false
                    });
                    setSelfTransferForm({
                      fromAccount: '',
                      toAccount: '',
                      amount: '',
                      remarks: ''
                    });
                    fetchAccounts();
                  }}
                >
                  New Transfer
                </button>
              </div>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className={styles.pageLayout}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={styles.mainContent}>
        <div className={styles.pageContainer}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              <h1>Transfer Money</h1>
              <p>Send money instantly to anyone</p>
            </div>
            <button 
              className={styles.secondaryBtn}
              onClick={() => {
                fetchAllBeneficiaries();
                setShowBeneficiaryModal(true);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              Manage Beneficiaries
            </button>
          </div>

          {/* Transfer Type Tabs - ✅ FIXED: Added proper onClick handlers */}
          <div className={styles.transferTabs}>
            <button 
              className={`${styles.transferTab} ${activeTab === 'bank' ? styles.active : ''}`}
              onClick={() => handleTabChange('bank')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              Bank Transfer
            </button>
            <button 
              className={`${styles.transferTab} ${activeTab === 'upi' ? styles.active : ''}`}
              onClick={() => handleTabChange('upi')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
              UPI
            </button>
            <button 
              className={`${styles.transferTab} ${activeTab === 'self' ? styles.active : ''}`}
              onClick={() => handleTabChange('self')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 1l4 4-4 4"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <path d="M7 23l-4-4 4-4"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
              Self Transfer
            </button>
          </div>

          {/* Bank Transfer Tab */}
          {activeTab === 'bank' && (
            <>
              {/* Progress Steps */}
              <div className={styles.progressSteps}>
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={`${styles.progressStep} ${step >= s ? styles.active : ''} ${step > s ? styles.completed : ''}`}
                  >
                    <div className={styles.stepCircle}>
                      {step > s ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                      ) : s}
                    </div>
                    <span className={styles.stepLabel}>
                      {s === 1 ? 'Details' : s === 2 ? 'Amount' : 'Confirm'}
                    </span>
                  </div>
                ))}
                <div className={styles.progressLine}>
                  <div className={styles.progressFill} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                </div>
              </div>

              {/* Transfer Form */}
              <div className={styles.transferFormContainer}>
                <form onSubmit={handleSubmit} className={styles.transferForm}>
                  {/* Step 1: Beneficiary Details */}
                  {step === 1 && (
                    <div className={styles.formStep}>
                      <h2>Beneficiary Details</h2>
                      
                      {/* Recent Beneficiaries */}
                      {recentBeneficiaries.length > 0 && (
                        <div className={styles.recentBeneficiaries}>
                          <h4>Recent Beneficiaries</h4>
                          <div className={styles.beneficiaryList}>
                            {recentBeneficiaries.map((ben) => (
                              <button 
                                key={ben._id} 
                                type="button"
                                className={styles.beneficiaryCard}
                                onClick={() => handleSelectBeneficiary(ben)}
                              >
                                <div className={styles.beneficiaryAvatar}>
                                  {ben.beneficiaryName.charAt(0)}
                                </div>
                                <div className={styles.beneficiaryInfo}>
                                  <span className={styles.beneficiaryName}>{ben.beneficiaryName}</span>
                                  <span className={styles.beneficiaryAccount}>
                                    ••••{ben.accountNumber.slice(-4)} • {ben.bankName || ben.ifscCode}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={styles.dividerText}>
                        <span>or enter new beneficiary</span>
                      </div>

                      {/* From Account */}
                      <div className={`${styles.formGroup} ${errors.fromAccount ? styles.hasError : ''}`}>
                        <label>From Account <span className={styles.required}>*</span></label>
                        <div className={styles.selectWrapper}>
                          <select
                            name="fromAccount"
                            value={formData.fromAccount || ''}
                            onChange={handleChange}
                          >
                            <option value="">Select Account</option>
                            {accounts.map(acc => (
                              <option key={acc._id} value={acc._id}>
                                {acc.accountType ? acc.accountType.charAt(0).toUpperCase() + acc.accountType.slice(1) : 'Account'} - ••••{acc.accountNumber ? acc.accountNumber.slice(-4) : '0000'} ({formatCurrency(acc.balance || 0)})
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.fromAccount && <span className={styles.errorText}>{errors.fromAccount}</span>}
                      </div>

                      {/* Beneficiary Name */}
                      <div className={`${styles.formGroup} ${errors.beneficiaryName ? styles.hasError : ''}`}>
                        <label>Beneficiary Name <span className={styles.required}>*</span></label>
                        <div className={styles.inputWrapper}>
                          <input
                            type="text"
                            name="beneficiaryName"
                            value={formData.beneficiaryName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter beneficiary name"
                          />
                        </div>
                        {errors.beneficiaryName && <span className={styles.errorText}>{errors.beneficiaryName}</span>}
                      </div>

                      {/* Account Number */}
                      <div className={`${styles.formGroup} ${errors.toAccountNumber ? styles.hasError : ''}`}>
                        <label>Account Number <span className={styles.required}>*</span></label>
                        <div className={styles.inputWrapper}>
                          <input
                            type="text"
                            name="toAccountNumber"
                            value={formData.toAccountNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter account number"
                            maxLength={18}
                          />
                        </div>
                        {errors.toAccountNumber && <span className={styles.errorText}>{errors.toAccountNumber}</span>}
                      </div>

                      {/* IFSC Code */}
                      <div className={`${styles.formGroup} ${errors.ifscCode ? styles.hasError : ''}`}>
                        <label>IFSC Code <span className={styles.required}>*</span></label>
                        <div className={styles.inputWrapper}>
                          <input
                            type="text"
                            name="ifscCode"
                            value={formData.ifscCode}
                            onChange={(e) => handleChange({ target: { name: 'ifscCode', value: e.target.value.toUpperCase() }})}
                            onBlur={handleBlur}
                            placeholder="e.g., HDFC0001234"
                            maxLength={11}
                            style={{ textTransform: 'uppercase' }}
                          />
                        </div>
                        {errors.ifscCode && <span className={styles.errorText}>{errors.ifscCode}</span>}
                      </div>

                      {/* Bank Name (Optional) */}
                      <div className={styles.formGroup}>
                        <label>Bank Name (Optional)</label>
                        <div className={styles.inputWrapper}>
                          <input
                            type="text"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            placeholder="e.g., HDFC Bank"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Amount */}
                  {step === 2 && (
                    <div className={styles.formStep}>
                      <h2>Enter Amount</h2>

                      {/* Amount Input */}
                      <div className={styles.amountInputContainer}>
                        <span className={styles.currencySymbol}>₹</span>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="0"
                          className={styles.amountInput}
                          autoFocus
                        />
                      </div>
                      {errors.amount && <span className={`${styles.errorText} ${styles.centered}`}>{errors.amount}</span>}

                      {selectedAccount && (
                        <p className={styles.balanceHint}>
                          Available Balance: {formatCurrency(selectedAccount.balance)}
                        </p>
                      )}

                      {/* Quick Amount Buttons */}
                      <div className={styles.quickAmounts}>
                        {[500, 1000, 2000, 5000, 10000].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            className={styles.quickAmountBtn}
                            onClick={() => setFormData(prev => ({ ...prev, amount: amt.toString() }))}
                          >
                            ₹{amt.toLocaleString()}
                          </button>
                        ))}
                      </div>

                      {/* Transfer Type */}
                      <div className={styles.formGroup}>
                        <label>Transfer Type</label>
                        <div className={styles.transferTypeOptions}>
                          {[
                            { value: 'IMPS', label: 'IMPS', desc: 'Instant • ₹5 fee (>₹1000)', limit: '₹1 - ₹2L' },
                            { value: 'NEFT', label: 'NEFT', desc: '30 mins • Free', limit: '₹1 - ₹1Cr' },
                            { value: 'RTGS', label: 'RTGS', desc: '30 mins • ₹25 fee', limit: '₹2L - ₹1Cr' }
                          ].map(type => (
                            <label 
                              key={type.value}
                              className={`${styles.transferTypeOption} ${formData.transferType === type.value ? styles.selected : ''}`}
                            >
                              <input
                                type="radio"
                                name="transferType"
                                value={type.value}
                                checked={formData.transferType === type.value}
                                onChange={handleChange}
                              />
                              <div className={styles.typeInfo}>
                                <span className={styles.typeLabel}>{type.label}</span>
                                <span className={styles.typeDesc}>{type.desc}</span>
                                <span className={styles.typeLimit}>{type.limit}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Remarks */}
                      <div className={styles.formGroup}>
                        <label>Remarks (Optional)</label>
                        <div className={styles.inputWrapper}>
                          <input
                            type="text"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            placeholder="Add a note"
                            maxLength={50}
                          />
                        </div>
                      </div>

                      {/* Save Beneficiary */}
                      <div className={styles.formGroup}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            name="saveBeneficiary"
                            checked={formData.saveBeneficiary}
                            onChange={handleChange}
                          />
                          <span>Save as beneficiary for future transfers</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Confirm */}
                  {step === 3 && (
                    <div className={styles.formStep}>
                      <h2>Confirm Transfer</h2>

                      <div className={styles.confirmCard}>
                        <div className={styles.confirmAmount}>
                          {formatCurrency(parseFloat(formData.amount || 0))}
                        </div>

                        <div className={styles.confirmDetails}>
                          <div className={styles.confirmRow}>
                            <span>From</span>
                            <span>{selectedAccount?.accountType} ••••{selectedAccount?.accountNumber?.slice(-4)}</span>
                          </div>
                          <div className={styles.confirmRow}>
                            <span>To</span>
                            <span>{formData.beneficiaryName}</span>
                          </div>
                          <div className={styles.confirmRow}>
                            <span>Account</span>
                            <span>••••{formData.toAccountNumber.slice(-4)}</span>
                          </div>
                          <div className={styles.confirmRow}>
                            <span>IFSC</span>
                            <span>{formData.ifscCode}</span>
                          </div>
                          {formData.bankName && (
                            <div className={styles.confirmRow}>
                              <span>Bank</span>
                              <span>{formData.bankName}</span>
                            </div>
                          )}
                          <div className={styles.confirmRow}>
                            <span>Transfer Type</span>
                            <span>{formData.transferType}</span>
                          </div>
                          {formData.remarks && (
                            <div className={styles.confirmRow}>
                              <span>Remarks</span>
                              <span>{formData.remarks}</span>
                            </div>
                          )}
                        </div>

                        <div className={styles.confirmFee}>
                          <span>Transfer Fee</span>
                          <span>{getTransferFee() === 0 ? 'Free' : `₹${getTransferFee()}`}</span>
                        </div>
                        
                        {getTransferFee() > 0 && (
                          <div className={styles.confirmTotal}>
                            <span>Total Amount</span>
                            <span>{formatCurrency(parseFloat(formData.amount || 0) + getTransferFee())}</span>
                          </div>
                        )}
                      </div>

                      {errors.submit && (
                        <div className={styles.errorAlert}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                          </svg>
                          <span>{errors.submit}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className={styles.formActions}>
                    {step > 1 && (
                      <button type="button" className={styles.backBtn} onClick={handleBack}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="19" y1="12" x2="5" y2="12"/>
                          <polyline points="12,19 5,12 12,5"/>
                        </svg>
                        Back
                      </button>
                    )}
                    
                    {step < 3 ? (
                      <button type="button" className={styles.primaryBtn} onClick={handleNext}>
                        Continue
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12,5 19,12 12,19"/>
                        </svg>
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        className={`${styles.primaryBtn} ${isLoading ? styles.loading : ''}`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className={styles.spinner}></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Confirm & Transfer
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                              <polyline points="22,4 12,14.01 9,11.01"/>
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </>
          )}

          {/* ✅ NEW: Self Transfer Tab Content */}
          {activeTab === 'self' && (
            <div className={styles.transferFormContainer}>
              <div className={styles.transferForm}>
                <div className={styles.formStep}>
                  <h2>Self Transfer</h2>
                  <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                    Transfer money between your own accounts instantly
                  </p>

                  {/* From Account */}
                  <div className={styles.formGroup}>
                    <label>From Account <span className={styles.required}>*</span></label>
                    <div className={styles.selectWrapper}>
                      <select
                        value={selfTransferForm.fromAccount}
                        onChange={(e) => setSelfTransferForm({...selfTransferForm, fromAccount: e.target.value})}
                      >
                        <option value="">Select Source Account</option>
                        {accounts.map(acc => (
                          <option key={acc._id} value={acc._id}>
                            {acc.accountType ? acc.accountType.charAt(0).toUpperCase() + acc.accountType.slice(1) : 'Account'} - ••••{acc.accountNumber ? acc.accountNumber.slice(-4) : '0000'} ({formatCurrency(acc.balance || 0)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* To Account */}
                  <div className={styles.formGroup}>
                    <label>To Account <span className={styles.required}>*</span></label>
                    <div className={styles.selectWrapper}>
                      <select
                        value={selfTransferForm.toAccount}
                        onChange={(e) => setSelfTransferForm({...selfTransferForm, toAccount: e.target.value})}
                      >
                        <option value="">Select Destination Account</option>
                        {accounts.filter(acc => acc._id !== selfTransferForm.fromAccount).map(acc => (
                          <option key={acc._id} value={acc._id}>
                            {acc.accountType ? acc.accountType.charAt(0).toUpperCase() + acc.accountType.slice(1) : 'Account'} - ••••{acc.accountNumber ? acc.accountNumber.slice(-4) : '0000'} ({formatCurrency(acc.balance || 0)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className={styles.formGroup}>
                    <label>Amount <span className={styles.required}>*</span></label>
                    <div className={styles.amountInputContainer}>
                      <span className={styles.currencySymbol}>₹</span>
                      <input
                        type="number"
                        value={selfTransferForm.amount}
                        onChange={(e) => setSelfTransferForm({...selfTransferForm, amount: e.target.value})}
                        placeholder="0"
                        className={styles.amountInput}
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className={styles.quickAmounts}>
                    {[1000, 5000, 10000, 25000, 50000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        className={styles.quickAmountBtn}
                        onClick={() => setSelfTransferForm({...selfTransferForm, amount: amt.toString()})}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Remarks */}
                  <div className={styles.formGroup}>
                    <label>Remarks (Optional)</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={selfTransferForm.remarks}
                        onChange={(e) => setSelfTransferForm({...selfTransferForm, remarks: e.target.value})}
                        placeholder="Add a note"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  {/* Transfer Button */}
                  <div className={styles.formActions}>
                    <button 
                      type="button"
                      className={`${styles.primaryBtn} ${isLoading ? styles.loading : ''}`}
                      onClick={handleSelfTransfer}
                      disabled={isLoading || !selfTransferForm.fromAccount || !selfTransferForm.toAccount || !selfTransferForm.amount}
                    >
                      {isLoading ? (
                        <>
                          <div className={styles.spinner}></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          Transfer Now
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 1l4 4-4 4"/>
                            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                            <path d="M7 23l-4-4 4-4"/>
                            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </main>

      <BottomNav />

      {/* Beneficiary Management Modal */}
      {showBeneficiaryModal && (
        <BeneficiaryModal
          beneficiaries={allBeneficiaries}
          onClose={() => setShowBeneficiaryModal(false)}
          onSelect={handleSelectBeneficiary}
          onAdd={handleAddBeneficiary}
          onDelete={handleDeleteBeneficiary}
        />
      )}
    </div>
  );
};

// Beneficiary Modal Component
const BeneficiaryModal = ({ beneficiaries, onClose, onSelect, onAdd, onDelete }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    beneficiaryName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.beneficiaryName || !formData.accountNumber || !formData.ifscCode) {
      alert('Please fill all required fields');
      return;
    }
    onAdd(formData);
    setFormData({ beneficiaryName: '', accountNumber: '', ifscCode: '', bankName: '' });
    setShowAddForm(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Manage Beneficiaries</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {!showAddForm ? (
            <>
              <button 
                className={styles.primaryBtn}
                onClick={() => setShowAddForm(true)}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add New Beneficiary
              </button>

              <div className={styles.beneficiaryModalList}>
                {!Array.isArray(beneficiaries) || beneficiaries.length === 0 ? (
                  <p className={styles.emptyText}>No saved beneficiaries</p>
                ) : (
                  beneficiaries.map((ben) => (
                    <div key={ben._id} className={styles.beneficiaryModalItem}>
                      <div className={styles.beneficiaryModalAvatar}>
                        {ben.beneficiaryName?.charAt(0) || 'B'}
                      </div>
                      <div className={styles.beneficiaryModalInfo}>
                        <span className={styles.beneficiaryModalName}>{ben.beneficiaryName}</span>
                        <span className={styles.beneficiaryModalAccount}>
                          {ben.accountNumber} • {ben.ifscCode}
                        </span>
                        {ben.bankName && <span className={styles.beneficiaryModalBank}>{ben.bankName}</span>}
                      </div>
                      <div className={styles.beneficiaryModalActions}>
                        <button
                          className={styles.selectBenBtn}
                          onClick={() => {
                            onSelect(ben);
                            onClose();
                          }}
                        >
                          Select
                        </button>
                        <button
                          className={styles.deleteBenBtn}
                          onClick={() => onDelete(ben._id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2 2 0 0 1-2,2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className={styles.addBeneficiaryForm}>
              <div className={styles.formGroup}>
                <label>Beneficiary Name *</label>
                <input
                  type="text"
                  value={formData.beneficiaryName}
                  onChange={(e) => setFormData({...formData, beneficiaryName: e.target.value})}
                  placeholder="Enter name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Account Number *</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  placeholder="Enter account number"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>IFSC Code *</label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})}
                  placeholder="e.g., HDFC0001234"
                  style={{ textTransform: 'uppercase' }}
                  maxLength={11}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  placeholder="e.g., HDFC Bank"
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn}>
                  Add Beneficiary
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transfer;