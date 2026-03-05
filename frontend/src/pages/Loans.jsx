import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { loanService } from '../utils/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from '../styles/Pages.module.css';

const Loans = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('available');
  const [showCalculator, setShowCalculator] = useState(false);
  const [showEMISchedule, setShowEMISchedule] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Calculator State
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanTenure, setLoanTenure] = useState(36);
  const [interestRate, setInterestRate] = useState(10.5);
  const [selectedLoanType, setSelectedLoanType] = useState('personal');

  // Active Loans State
  const [activeLoans, setActiveLoans] = useState([]);
  const [emiSchedule, setEmiSchedule] = useState([]);

  // Loan Types with Interest Rates
  const loanTypes = {
    personal: { rate: 10.5, name: 'Personal Loan' },
    home: { rate: 8.5, name: 'Home Loan' },
    car: { rate: 9.5, name: 'Car Loan' },
    education: { rate: 9.0, name: 'Education Loan' }
  };

  const loanOffers = [
    {
      id: 1,
      type: 'personal',
      name: 'Personal Loan',
      icon: '💰',
      maxAmount: 1000000,
      interestRate: '10.5%',
      tenure: '12-60 months',
      preApproved: true,
      features: ['No collateral required', 'Instant approval', 'Flexible repayment']
    },
    {
      id: 2,
      type: 'home',
      name: 'Home Loan',
      icon: '🏠',
      maxAmount: 10000000,
      interestRate: '8.5%',
      tenure: 'Up to 30 years',
      preApproved: false,
      features: ['Low interest rates', 'Tax benefits', 'Long tenure']
    },
    {
      id: 3,
      type: 'car',
      name: 'Car Loan',
      icon: '🚗',
      maxAmount: 2500000,
      interestRate: '9.5%',
      tenure: '12-84 months',
      preApproved: true,
      features: ['Quick disbursal', 'Minimal documentation', 'Competitive rates']
    },
    {
      id: 4,
      type: 'education',
      name: 'Education Loan',
      icon: '📚',
      maxAmount: 5000000,
      interestRate: '9.0%',
      tenure: 'Up to 15 years',
      preApproved: false,
      features: ['Moratorium period', 'Tax benefits', 'Study abroad covered']
    }
  ];

  useEffect(() => {
    if (activeTab === 'active') {
      fetchActiveLoans();
    }
  }, [activeTab]);

  // Update interest rate when loan type changes
  useEffect(() => {
    setInterestRate(loanTypes[selectedLoanType].rate);
  }, [selectedLoanType]);

  const fetchActiveLoans = async () => {
    try {
      setLoading(true);
      const response = await loanService.getAllLoans();
      setActiveLoans(response.data || []);
    } catch (error) {
      console.log('Using demo loan data');
      // Demo data
      setActiveLoans([
        {
          _id: '1',
          loanNumber: 'LN001234',
          loanType: 'personal',
          amount: 500000,
          emi: 16161,
          tenure: 36,
          interestRate: 10.5,
          emisPaid: 8,
          nextDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: 'active',
          startDate: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000)
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateEMI = (principal = loanAmount, rate = interestRate, months = loanTenure) => {
    const P = principal;
    const R = rate / 12 / 100;
    const N = months;
    
    if (R === 0) return P / N;
    
    const emi = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
    return Math.round(emi);
  };

  const calculateTotalInterest = () => {
    const emi = calculateEMI();
    return (emi * loanTenure) - loanAmount;
  };

  const calculateTotalAmount = () => {
    return loanAmount + calculateTotalInterest();
  };

  // Apply for Loan
  const handleApplyLoan = async () => {
    try {
      setLoading(true);
      
      await loanService.applyLoan({
        loanType: selectedLoanType,
        amount: loanAmount,
        tenure: loanTenure,
        interestRate: interestRate
      });

      alert('Loan application submitted successfully!');
      setShowCalculator(false);
      setActiveTab('active');
      fetchActiveLoans();
    } catch (error) {
      console.error('Error applying for loan:', error);
      alert('Failed to apply for loan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pay EMI
  const handlePayEMI = async (loanId, emiAmount) => {
    try {
      setLoading(true);
      
      await loanService.payEMI(loanId, emiAmount);
      
      alert('EMI paid successfully!');
      fetchActiveLoans();
    } catch (error) {
      console.error('Error paying EMI:', error);
      alert('Failed to pay EMI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // View EMI Schedule
  const handleViewEMISchedule = async (loan) => {
    try {
      setLoading(true);
      setSelectedLoan(loan);
      
      const response = await loanService.getEMISchedule(loan._id);
      setEmiSchedule(response.data || []);
      
      setShowEMISchedule(true);
    } catch (error) {
      console.log('Generating demo EMI schedule');
      
      // Generate demo EMI schedule
      const schedule = [];
      const principal = loan.amount;
      const rate = loan.interestRate / 12 / 100;
      const emi = calculateEMI(loan.amount, loan.interestRate, loan.tenure);
      let balance = principal;

      for (let i = 1; i <= loan.tenure; i++) {
        const interestPortion = balance * rate;
        const principalPortion = emi - interestPortion;
        balance -= principalPortion;

        schedule.push({
          emiNumber: i,
          emiAmount: emi,
          principalPortion: Math.round(principalPortion),
          interestPortion: Math.round(interestPortion),
          balance: Math.max(0, Math.round(balance)),
          dueDate: new Date(new Date(loan.startDate).setMonth(new Date(loan.startDate).getMonth() + i)),
          status: i <= loan.emisPaid ? 'paid' : 'pending'
        });
      }
      
      setEmiSchedule(schedule);
      setShowEMISchedule(true);
    } finally {
      setLoading(false);
    }
  };

  // Foreclose Loan
  const handleForeclose = async (loanId) => {
    if (!window.confirm('Are you sure you want to foreclose this loan?')) {
      return;
    }

    try {
      setLoading(true);
      
      await loanService.foreclose(loanId);
      
      alert('Loan foreclosed successfully!');
      fetchActiveLoans();
    } catch (error) {
      console.error('Error foreclosing loan:', error);
      alert('Failed to foreclose loan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getProgressPercent = (loan) => {
    return Math.round((loan.emisPaid / loan.tenure) * 100);
  };

  return (
    <div className={styles.pageLayout}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={styles.mainContent}>
        <div className={styles.pageContainer}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              <h1>💳 Loans</h1>
              <p>Explore loan options and manage your existing loans</p>
            </div>
            <button 
              className={styles.primaryBtn}
              onClick={() => setShowCalculator(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2"/>
                <line x1="8" y1="6" x2="16" y2="6"/>
                <line x1="8" y1="10" x2="16" y2="10"/>
                <line x1="8" y1="14" x2="12" y2="14"/>
              </svg>
              EMI Calculator
            </button>
          </div>

          {/* Tabs */}
          <div className={styles.filterTabs}>
            <button 
              className={`${styles.filterTab} ${activeTab === 'available' ? styles.active : ''}`}
              onClick={() => setActiveTab('available')}
            >
              💰 Available Loans
            </button>
            <button 
              className={`${styles.filterTab} ${activeTab === 'active' ? styles.active : ''}`}
              onClick={() => setActiveTab('active')}
            >
              📋 Active Loans ({activeLoans.length})
            </button>
          </div>

          {loading && <LoadingSpinner />}

          {activeTab === 'available' && !loading ? (
            <>
              {/* Pre-approved Banner */}
              <div className={styles.preApprovedBanner}>
                <div className={styles.bannerContent}>
                  <div className={styles.bannerIcon}>🎉</div>
                  <div>
                    <h3>Pre-approved Loan Available!</h3>
                    <p>You're eligible for instant personal loan up to ₹10,00,000</p>
                  </div>
                </div>
                <button className={styles.bannerBtn} onClick={() => {
                  setSelectedLoanType('personal');
                  setShowCalculator(true);
                }}>
                  Apply Now
                </button>
              </div>

              {/* Loan Offers */}
              <div className={styles.loanOffersGrid}>
                {loanOffers.map(loan => (
                  <div key={loan.id} className={styles.loanOfferCard}>
                    {loan.preApproved && (
                      <span className={styles.preApprovedBadge}>Pre-Approved</span>
                    )}
                    <div className={styles.loanIcon}>{loan.icon}</div>
                    <h3>{loan.name}</h3>
                    
                    <div className={styles.loanDetails}>
                      <div className={styles.loanDetail}>
                        <span className={styles.detailLabel}>Up to</span>
                        <span className={styles.detailValue}>{formatCurrency(loan.maxAmount)}</span>
                      </div>
                      <div className={styles.loanDetail}>
                        <span className={styles.detailLabel}>Interest</span>
                        <span className={styles.detailValue}>{loan.interestRate} p.a.</span>
                      </div>
                      <div className={styles.loanDetail}>
                        <span className={styles.detailLabel}>Tenure</span>
                        <span className={styles.detailValue}>{loan.tenure}</span>
                      </div>
                    </div>

                    <ul className={styles.loanFeatures}>
                      {loan.features.map((feature, i) => (
                        <li key={i}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button 
                      className={styles.applyBtn}
                      onClick={() => {
                        setSelectedLoanType(loan.type);
                        setShowCalculator(true);
                      }}
                    >
                      {loan.preApproved ? 'Get Instant Loan' : 'Check Eligibility'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : activeTab === 'active' && !loading ? (
            /* Active Loans */
            <div className={styles.activeLoansSection}>
              {activeLoans.length > 0 ? (
                activeLoans.map(loan => (
                  <div key={loan._id} className={styles.activeLoanCard}>
                    <div className={styles.loanHeader}>
                      <div>
                        <h3>{loanTypes[loan.loanType]?.name || 'Loan'}</h3>
                        <span className={styles.loanId}>Loan ID: {loan.loanNumber || loan._id}</span>
                      </div>
                      <span className={`${styles.loanStatus} ${styles[loan.status]}`}>
                        {loan.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className={styles.loanAmountSection}>
                      <div className={styles.loanAmountInfo}>
                        <span className={styles.label}>Loan Amount</span>
                        <span className={styles.value}>{formatCurrency(loan.amount)}</span>
                      </div>
                      <div className={styles.loanAmountInfo}>
                        <span className={styles.label}>Monthly EMI</span>
                        <span className={styles.value}>{formatCurrency(loan.emi)}</span>
                      </div>
                    </div>

                    <div className={styles.loanProgress}>
                      <div className={styles.progressHeader}>
                        <span>EMIs Paid</span>
                        <span>{loan.emisPaid} of {loan.tenure}</span>
                      </div>
                      <div className={styles.progressTrack}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${getProgressPercent(loan)}%` }}
                        />
                      </div>
                      <div className={styles.progressFooter}>
                        <span>{getProgressPercent(loan)}% Completed</span>
                        <span>{loan.tenure - loan.emisPaid} EMIs remaining</span>
                      </div>
                    </div>

                    <div className={styles.nextPayment}>
                      <div className={styles.nextPaymentInfo}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <div>
                          <span>Next EMI Due</span>
                          <strong>
                            {new Date(loan.nextDueDate).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </strong>
                        </div>
                      </div>
                      <button 
                        className={styles.payNowBtn}
                        onClick={() => handlePayEMI(loan._id, loan.emi)}
                      >
                        Pay ₹{(loan.emi / 1000).toFixed(0)}K
                      </button>
                    </div>

                    <div className={styles.loanActions}>
                      <button 
                        className={styles.loanActionBtn}
                        onClick={() => handleViewEMISchedule(loan)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        EMI Schedule
                      </button>
                      <button className={styles.loanActionBtn}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                        </svg>
                        Statement
                      </button>
                      <button 
                        className={styles.loanActionBtn}
                        onClick={() => handleForeclose(loan._id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23"/>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        Foreclose
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M8 2v4M16 2v4M3 10h18"/>
                  </svg>
                  <h3>No Active Loans</h3>
                  <p>You don't have any active loans. Explore our loan options to get started.</p>
                  <button 
                    className={styles.primaryBtn}
                    onClick={() => setActiveTab('available')}
                  >
                    Explore Loans
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* EMI Calculator Modal */}
          {showCalculator && (
            <div className={styles.modalOverlay} onClick={() => setShowCalculator(false)}>
              <div className={styles.calculatorModal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>🧮 EMI Calculator</h2>
                  <button 
                    className={styles.closeBtn}
                    onClick={() => setShowCalculator(false)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                
                <div className={styles.calculatorBody}>
                  {/* Loan Type Selector */}
                  <div className={styles.loanTypeSelector}>
                    <label>Select Loan Type</label>
                    <div className={styles.loanTypeButtons}>
                      {Object.entries(loanTypes).map(([key, value]) => (
                        <button
                          key={key}
                          className={`${styles.loanTypeBtn} ${selectedLoanType === key ? styles.active : ''}`}
                          onClick={() => setSelectedLoanType(key)}
                        >
                          {value.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.sliderGroup}>
                    <div className={styles.sliderHeader}>
                      <label>Loan Amount</label>
                      <span className={styles.sliderValue}>{formatCurrency(loanAmount)}</span>
                    </div>
                    <input
                      type="range"
                      min="50000"
                      max="5000000"
                      step="50000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className={styles.slider}
                    />
                    <div className={styles.sliderRange}>
                      <span>₹50K</span>
                      <span>₹50L</span>
                    </div>
                  </div>

                  <div className={styles.sliderGroup}>
                    <div className={styles.sliderHeader}>
                      <label>Tenure (Months)</label>
                      <span className={styles.sliderValue}>{loanTenure} months ({(loanTenure / 12).toFixed(1)} years)</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="84"
                      step="6"
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(Number(e.target.value))}
                      className={styles.slider}
                    />
                    <div className={styles.sliderRange}>
                      <span>6 mo</span>
                      <span>84 mo</span>
                    </div>
                  </div>

                  <div className={styles.interestDisplay}>
                    <span>Interest Rate</span>
                    <span>{interestRate}% p.a.</span>
                  </div>

                  <div className={styles.emiResult}>
                    <div className={styles.emiCard}>
                      <span className={styles.emiLabel}>Monthly EMI</span>
                      <span className={styles.emiValue}>{formatCurrency(calculateEMI())}</span>
                    </div>

                    {/* Pie Chart Visualization */}
                    <div className={styles.chartContainer}>
                      <svg viewBox="0 0 100 100" className={styles.pieChart}>
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke="#667eea" 
                          strokeWidth="20"
                          strokeDasharray={`${(loanAmount / calculateTotalAmount()) * 251} 251`}
                          transform="rotate(-90 50 50)"
                        />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke="#ef4444" 
                          strokeWidth="20"
                          strokeDasharray={`${(calculateTotalInterest() / calculateTotalAmount()) * 251} 251`}
                          strokeDashoffset={`-${(loanAmount / calculateTotalAmount()) * 251}`}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className={styles.chartLegend}>
                        <div className={styles.legendItem}>
                          <span className={styles.legendColor} style={{background: '#667eea'}}></span>
                          <span>Principal</span>
                        </div>
                        <div className={styles.legendItem}>
                          <span className={styles.legendColor} style={{background: '#ef4444'}}></span>
                          <span>Interest</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.emiBreakdown}>
                      <div className={styles.breakdownItem}>
                        <span>Principal Amount</span>
                        <span>{formatCurrency(loanAmount)}</span>
                      </div>
                      <div className={styles.breakdownItem}>
                        <span>Total Interest</span>
                        <span className={styles.interest}>{formatCurrency(calculateTotalInterest())}</span>
                      </div>
                      <div className={`${styles.breakdownItem} ${styles.total}`}>
                        <span>Total Amount Payable</span>
                        <strong>{formatCurrency(calculateTotalAmount())}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button className={styles.secondaryBtn} onClick={() => setShowCalculator(false)}>
                    Cancel
                  </button>
                  <button className={styles.primaryBtn} onClick={handleApplyLoan}>
                    Apply for this Loan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EMI Schedule Modal */}
          {showEMISchedule && selectedLoan && (
            <div className={styles.modalOverlay} onClick={() => setShowEMISchedule(false)}>
              <div className={styles.scheduleModal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>📅 EMI Schedule</h2>
                  <button 
                    className={styles.closeBtn}
                    onClick={() => setShowEMISchedule(false)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                
                <div className={styles.scheduleBody}>
                  <div className={styles.scheduleHeader}>
                    <div className={styles.scheduleInfo}>
                      <span>Loan: {selectedLoan.loanNumber}</span>
                      <span>Amount: {formatCurrency(selectedLoan.amount)}</span>
                      <span>Rate: {selectedLoan.interestRate}% p.a.</span>
                    </div>
                  </div>

                  <div className={styles.scheduleTable}>
                    <div className={styles.tableHeader}>
                      <div>EMI #</div>
                      <div>Due Date</div>
                      <div>EMI</div>
                      <div>Principal</div>
                      <div>Interest</div>
                      <div>Balance</div>
                      <div>Status</div>
                    </div>
                    <div className={styles.tableBody}>
                      {emiSchedule.map((emi) => (
                        <div 
                          key={emi.emiNumber} 
                          className={`${styles.tableRow} ${emi.status === 'paid' ? styles.paid : ''}`}
                        >
                          <div>{emi.emiNumber}</div>
                          <div>{new Date(emi.dueDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
                          <div>{formatCurrency(emi.emiAmount)}</div>
                          <div>{formatCurrency(emi.principalPortion)}</div>
                          <div>{formatCurrency(emi.interestPortion)}</div>
                          <div>{formatCurrency(emi.balance)}</div>
                          <div>
                            <span className={`${styles.statusBadge} ${styles[emi.status]}`}>
                              {emi.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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

export default Loans;