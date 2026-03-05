import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { accountService } from '../utils/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from '../styles/Pages.module.css';

const Accounts = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // ✅ NEW: Accounts state
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // ✅ NEW: New Account Modal States
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({
    accountType: 'savings',
    initialDeposit: '',
    branch: 'Mumbai Main Branch',
    nomineeRequired: false,
    nomineeName: '',
    nomineeRelation: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // ✅ NEW: Fetch accounts on mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await accountService.getAllAccounts();
      const accData = response?.data || [];
      const accArray = Array.isArray(accData) ? accData : [];
      
      if (accArray.length > 0) {
        setAccounts(accArray);
      } else {
        // Demo accounts
        setAccounts([
          {
            id: '1',
            _id: '1',
            accountNumber: '1234567890123456',
            type: 'savings',
            balance: 150000,
            status: 'active',
            interestRate: 4.5,
            createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          },
          {
            id: '2',
            _id: '2',
            accountNumber: '9876543210987654',
            type: 'current',
            balance: 250000,
            status: 'active',
            interestRate: 0,
            createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
          }
        ]);
      }
    } catch (error) {
      console.log('Using demo accounts');
      setAccounts([
        {
          id: '1',
          _id: '1',
          accountNumber: '1234567890123456',
          type: 'savings',
          balance: 150000,
          status: 'active',
          interestRate: 4.5,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          _id: '2',
          accountNumber: '9876543210987654',
          type: 'current',
          balance: 250000,
          status: 'active',
          interestRate: 0,
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Handle Create New Account
  const handleCreateAccount = async () => {
    if (!newAccountForm.accountType) {
      alert('Please select account type');
      return;
    }

    if (newAccountForm.initialDeposit && parseFloat(newAccountForm.initialDeposit) < 0) {
      alert('Initial deposit cannot be negative');
      return;
    }

    if (newAccountForm.nomineeRequired && !newAccountForm.nomineeName) {
      alert('Please enter nominee name');
      return;
    }

    setIsCreating(true);

    try {
      const accountData = {
        accountType: newAccountForm.accountType,
        initialDeposit: parseFloat(newAccountForm.initialDeposit) || 0,
        branch: newAccountForm.branch,
        nomineeRequired: newAccountForm.nomineeRequired,
        nomineeName: newAccountForm.nomineeName,
        nomineeRelation: newAccountForm.nomineeRelation
      };

      await accountService.createAccount(accountData);
      
      alert('🎉 Account created successfully!');
      setShowNewAccountModal(false);
      setNewAccountForm({
        accountType: 'savings',
        initialDeposit: '',
        branch: 'Mumbai Main Branch',
        nomineeRequired: false,
        nomineeName: '',
        nomineeRelation: ''
      });
      fetchAccounts();
    } catch (error) {
      console.log('Demo mode: Account created');
      
      // Demo: Add new account locally
      const newAccount = {
        id: Date.now().toString(),
        _id: Date.now().toString(),
        accountNumber: Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(),
        type: newAccountForm.accountType,
        balance: parseFloat(newAccountForm.initialDeposit) || 0,
        status: 'active',
        interestRate: newAccountForm.accountType === 'savings' ? 4.5 : 0,
        createdAt: new Date()
      };
      
      setAccounts(prev => [...prev, newAccount]);
      alert('🎉 Account created successfully!\nAccount Number: ' + newAccount.accountNumber);
      setShowNewAccountModal(false);
      setNewAccountForm({
        accountType: 'savings',
        initialDeposit: '',
        branch: 'Mumbai Main Branch',
        nomineeRequired: false,
        nomineeName: '',
        nomineeRelation: ''
      });
    } finally {
      setIsCreating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatAccountNumber = (num, show = false) => {
    if (!num) return '••••••••••••';
    if (show) return num;
    return `••••••••${num.slice(-4)}`;
  };

  const filteredAccounts = activeTab === 'all' 
    ? accounts 
    : accounts.filter(acc => acc.type === activeTab);

  const getAccountIcon = (type) => {
    switch (type) {
      case 'savings':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z"/>
            <path d="M2 9v1c0 1.1.9 2 2 2h1"/>
          </svg>
        );
      case 'current':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
          </svg>
        );
    }
  };

  const handleViewDetails = (account) => {
    setSelectedAccount(account);
    setShowAccountDetails(true);
  };

  if (loading) {
    return <LoadingSpinner />;
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
              <h1>My Accounts</h1>
              <p>Manage and view all your bank accounts</p>
            </div>
            {/* ✅ FIXED: Added onClick handler */}
            <button 
              className={styles.primaryBtn}
              onClick={() => setShowNewAccountModal(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Open New Account
            </button>
          </div>

          {/* Summary Cards */}
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M2 10h20"/>
                </svg>
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryLabel}>Total Accounts</span>
                <span className={styles.summaryValue}>{accounts.length}</span>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryLabel}>Total Balance</span>
                <span className={styles.summaryValue}>
                  {formatCurrency(accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0))}
                </span>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryLabel}>Active Status</span>
                <span className={styles.summaryValue}>All Active</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={styles.filterTabs}>
            <button 
              className={`${styles.filterTab} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Accounts
            </button>
            <button 
              className={`${styles.filterTab} ${activeTab === 'savings' ? styles.active : ''}`}
              onClick={() => setActiveTab('savings')}
            >
              Savings
            </button>
            <button 
              className={`${styles.filterTab} ${activeTab === 'current' ? styles.active : ''}`}
              onClick={() => setActiveTab('current')}
            >
              Current
            </button>
          </div>

          {/* Accounts List */}
          <div className={styles.accountsList}>
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <div key={account.id || account._id} className={styles.accountCard}>
                  <div className={styles.accountCardHeader}>
                    <div className={styles.accountTypeIcon}>
                      {getAccountIcon(account.type)}
                    </div>
                    <div className={styles.accountTypeInfo}>
                      <h3>{account.type === 'savings' ? 'Savings Account' : 'Current Account'}</h3>
                      <span className={`${styles.accountStatus} ${styles[account.status || 'active']}`}>
                        {account.status || 'active'}
                      </span>
                    </div>
                    <div className={styles.accountMenu}>
                      <button className={styles.menuBtn}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="1"/>
                          <circle cx="19" cy="12" r="1"/>
                          <circle cx="5" cy="12" r="1"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className={styles.accountCardBody}>
                    <div className={styles.accountNumber}>
                      <span className={styles.label}>Account Number</span>
                      <span className={styles.value}>{formatAccountNumber(account.accountNumber)}</span>
                    </div>
                    <div className={styles.accountBalance}>
                      <span className={styles.label}>Available Balance</span>
                      <span className={styles.value}>{formatCurrency(account.balance || 0)}</span>
                    </div>
                  </div>

                  <div className={styles.accountCardFooter}>
                    <button 
                      className={styles.accountAction}
                      onClick={() => handleViewDetails(account)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      View Details
                    </button>
                    <Link to="/transfer" className={styles.accountAction}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 1l4 4-4 4"/>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                        <path d="M7 23l-4-4 4-4"/>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                      </svg>
                      Transfer
                    </Link>
                    <button className={styles.accountAction}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                      Statement
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M2 10h20"/>
                </svg>
                <h3>No Accounts Found</h3>
                <p>Open your first account to get started!</p>
                <button 
                  className={styles.primaryBtn}
                  onClick={() => setShowNewAccountModal(true)}
                >
                  Open New Account
                </button>
              </div>
            )}
          </div>

          {/* Account Details Modal */}
          {showAccountDetails && selectedAccount && (
            <div className={styles.modalOverlay} onClick={() => setShowAccountDetails(false)}>
              <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>Account Details</h2>
                  <button 
                    className={styles.closeBtn}
                    onClick={() => setShowAccountDetails(false)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Account Type</span>
                      <span className={styles.detailValue}>
                        {selectedAccount.type === 'savings' ? 'Savings Account' : 'Current Account'}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Account Number</span>
                      <span className={styles.detailValue}>{selectedAccount.accountNumber}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>IFSC Code</span>
                      <span className={styles.detailValue}>BNKF0001234</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Branch</span>
                      <span className={styles.detailValue}>Mumbai Main Branch</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Available Balance</span>
                      <span className={styles.detailValue}>{formatCurrency(selectedAccount.balance || 0)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Interest Rate</span>
                      <span className={styles.detailValue}>{selectedAccount.interestRate || 0}% p.a.</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Account Holder</span>
                      <span className={styles.detailValue}>{user?.firstName} {user?.lastName}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Account Status</span>
                      <span className={`${styles.statusBadge} ${styles.active}`}>Active</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Opened On</span>
                      <span className={styles.detailValue}>
                        {new Date(selectedAccount.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.secondaryBtn} onClick={() => setShowAccountDetails(false)}>
                    Close
                  </button>
                  <button className={styles.primaryBtn}>
                    Download Statement
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ NEW: Open New Account Modal */}
          {showNewAccountModal && (
            <div className={styles.modalOverlay} onClick={() => setShowNewAccountModal(false)}>
              <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>🏦 Open New Account</h2>
                  <button 
                    className={styles.closeBtn}
                    onClick={() => setShowNewAccountModal(false)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <div className={styles.modalBody}>
                  {/* Account Type Selection */}
                  <div className={styles.formGroup}>
                    <label>Account Type <span style={{color: '#ef4444'}}>*</span></label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <label 
                        style={{
                          flex: 1,
                          padding: '1rem',
                          border: newAccountForm.accountType === 'savings' ? '2px solid #667eea' : '2px solid #e5e7eb',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          background: newAccountForm.accountType === 'savings' ? '#f0f5ff' : '#fff',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input
                          type="radio"
                          name="accountType"
                          value="savings"
                          checked={newAccountForm.accountType === 'savings'}
                          onChange={(e) => setNewAccountForm({...newAccountForm, accountType: e.target.value})}
                          style={{ display: 'none' }}
                        />
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🐷</div>
                        <div style={{ fontWeight: 600 }}>Savings Account</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>4.5% p.a. interest</div>
                      </label>
                      <label 
                        style={{
                          flex: 1,
                          padding: '1rem',
                          border: newAccountForm.accountType === 'current' ? '2px solid #667eea' : '2px solid #e5e7eb',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          background: newAccountForm.accountType === 'current' ? '#f0f5ff' : '#fff',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input
                          type="radio"
                          name="accountType"
                          value="current"
                          checked={newAccountForm.accountType === 'current'}
                          onChange={(e) => setNewAccountForm({...newAccountForm, accountType: e.target.value})}
                          style={{ display: 'none' }}
                        />
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💼</div>
                        <div style={{ fontWeight: 600 }}>Current Account</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>For business use</div>
                      </label>
                    </div>
                  </div>

                  {/* Initial Deposit */}
                  <div className={styles.formGroup}>
                    <label>Initial Deposit (Optional)</label>
                    <input
                      type="number"
                      placeholder="₹0"
                      value={newAccountForm.initialDeposit}
                      onChange={(e) => setNewAccountForm({...newAccountForm, initialDeposit: e.target.value})}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                    <small style={{ color: '#6b7280' }}>
                      {newAccountForm.accountType === 'savings' 
                        ? 'Minimum balance: ₹1,000' 
                        : 'Minimum balance: ₹10,000'}
                    </small>
                  </div>

                  {/* Branch Selection */}
                  <div className={styles.formGroup}>
                    <label>Select Branch</label>
                    <select
                      value={newAccountForm.branch}
                      onChange={(e) => setNewAccountForm({...newAccountForm, branch: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="Mumbai Main Branch">Mumbai Main Branch</option>
                      <option value="Delhi Central Branch">Delhi Central Branch</option>
                      <option value="Bangalore Tech Park Branch">Bangalore Tech Park Branch</option>
                      <option value="Chennai Marina Branch">Chennai Marina Branch</option>
                      <option value="Kolkata Park Street Branch">Kolkata Park Street Branch</option>
                    </select>
                  </div>

                  {/* Nominee */}
                  <div className={styles.formGroup}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newAccountForm.nomineeRequired}
                        onChange={(e) => setNewAccountForm({...newAccountForm, nomineeRequired: e.target.checked})}
                      />
                      <span>Add Nominee (Recommended)</span>
                    </label>
                  </div>

                  {newAccountForm.nomineeRequired && (
                    <>
                      <div className={styles.formGroup}>
                        <label>Nominee Name <span style={{color: '#ef4444'}}>*</span></label>
                        <input
                          type="text"
                          placeholder="Enter nominee name"
                          value={newAccountForm.nomineeName}
                          onChange={(e) => setNewAccountForm({...newAccountForm, nomineeName: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '1rem'
                          }}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Relationship</label>
                        <select
                          value={newAccountForm.nomineeRelation}
                          onChange={(e) => setNewAccountForm({...newAccountForm, nomineeRelation: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '1rem'
                          }}
                        >
                          <option value="">Select relationship</option>
                          <option value="spouse">Spouse</option>
                          <option value="parent">Parent</option>
                          <option value="child">Child</option>
                          <option value="sibling">Sibling</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Account Features */}
                  <div style={{
                    background: '#f0fdf4',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginTop: '1rem'
                  }}>
                    <h4 style={{ marginBottom: '0.5rem', color: '#166534' }}>✨ Account Features</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#166534', fontSize: '0.9rem' }}>
                      <li>Free debit card</li>
                      <li>Unlimited free NEFT/RTGS transfers</li>
                      <li>Free mobile & internet banking</li>
                      <li>24/7 customer support</li>
                      {newAccountForm.accountType === 'savings' && <li>4.5% annual interest rate</li>}
                    </ul>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button 
                    className={styles.secondaryBtn} 
                    onClick={() => setShowNewAccountModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className={styles.primaryBtn} 
                    onClick={handleCreateAccount}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <span className={styles.spinner}></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        Open Account
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '0.5rem', width: '18px', height: '18px' }}>
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22,4 12,14.01 9,11.01"/>
                        </svg>
                      </>
                    )}
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

export default Accounts;