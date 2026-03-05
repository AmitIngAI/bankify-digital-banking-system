import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { investmentService, fdService, rdService } from '../utils/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from '../styles/Investments.module.css';

const Investments = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [loading, setLoading] = useState(false);
  
  // Mutual Funds State
  const [portfolio, setPortfolio] = useState({
    totalValue: 485000,
    invested: 400000,
    returns: 85000,
    returnsPercent: 21.25,
    holdings: [
      {
        id: 1,
        name: 'HDFC Mid-Cap Opportunities',
        type: 'Equity',
        invested: 100000,
        current: 125000,
        returns: 25,
        units: 1234.56,
        nav: 101.25,
        risk: 'High'
      },
      {
        id: 2,
        name: 'ICICI Prudential Bluechip',
        type: 'Equity',
        invested: 150000,
        current: 180000,
        returns: 20,
        units: 2345.67,
        nav: 76.75,
        risk: 'Moderate'
      },
      {
        id: 3,
        name: 'SBI Small Cap Fund',
        type: 'Equity',
        invested: 75000,
        current: 95000,
        returns: 26.67,
        units: 567.89,
        nav: 167.25,
        risk: 'Very High'
      },
      {
        id: 4,
        name: 'Axis Liquid Fund',
        type: 'Debt',
        invested: 75000,
        current: 85000,
        returns: 13.33,
        units: 34.56,
        nav: 2459.50,
        risk: 'Low'
      }
    ]
  });

  const [exploreFunds] = useState([
    {
      id: 1,
      name: 'Parag Parikh Flexi Cap',
      category: 'Flexi Cap',
      returns1Y: 28.5,
      returns3Y: 22.3,
      returns5Y: 18.7,
      rating: 5,
      minInvestment: 1000,
      risk: 'Moderate',
      aum: '45,000 Cr'
    },
    {
      id: 2,
      name: 'Mirae Asset Large Cap',
      category: 'Large Cap',
      returns1Y: 18.2,
      returns3Y: 15.8,
      returns5Y: 14.2,
      rating: 5,
      minInvestment: 500,
      risk: 'Moderate',
      aum: '35,000 Cr'
    },
    {
      id: 3,
      name: 'Quant Small Cap Fund',
      category: 'Small Cap',
      returns1Y: 52.3,
      returns3Y: 38.5,
      returns5Y: 28.9,
      rating: 5,
      minInvestment: 1000,
      risk: 'Very High',
      aum: '8,000 Cr'
    },
    {
      id: 4,
      name: 'HDFC Balanced Advantage',
      category: 'Hybrid',
      returns1Y: 15.8,
      returns3Y: 14.2,
      returns5Y: 12.5,
      rating: 4,
      minInvestment: 500,
      risk: 'Moderate',
      aum: '55,000 Cr'
    },
    {
      id: 5,
      name: 'Nippon India Index Fund',
      category: 'Index',
      returns1Y: 16.5,
      returns3Y: 14.8,
      returns5Y: 13.2,
      rating: 4,
      minInvestment: 100,
      risk: 'Moderate',
      aum: '5,000 Cr'
    }
  ]);

  // FD State
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [showFDModal, setShowFDModal] = useState(false);
  const [fdForm, setFdForm] = useState({
    amount: '',
    tenure: '12',
    interestRate: 7.5,
    compoundingFrequency: 'quarterly'
  });
  const [fdCalculation, setFdCalculation] = useState(null);

  // RD State
  const [recurringDeposits, setRecurringDeposits] = useState([]);
  const [showRDModal, setShowRDModal] = useState(false);
  const [rdForm, setRdForm] = useState({
    monthlyAmount: '',
    tenure: '12',
    interestRate: 7.25,
    compoundingFrequency: 'quarterly'
  });
  const [rdCalculation, setRdCalculation] = useState(null);

  // SIP Calculator State
  const [sipValues, setSipValues] = useState({
    monthly: 10000,
    years: 10,
    expectedReturn: 12
  });

  // Interest rates based on tenure
  const fdInterestRates = {
    '6': 6.5,
    '12': 7.5,
    '24': 7.75,
    '36': 8.0,
    '60': 8.25
  };

  const rdInterestRates = {
    '12': 7.25,
    '24': 7.5,
    '36': 7.75,
    '60': 8.0
  };

  useEffect(() => {
    if (activeTab === 'fd' || activeTab === 'rd') {
      fetchDeposits();
    }
  }, [activeTab]);

  // FD Calculation Effect
  useEffect(() => {
    if (fdForm.amount && parseFloat(fdForm.amount) >= 1000) {
      const principal = parseFloat(fdForm.amount);
      const rate = fdInterestRates[fdForm.tenure] || 7.5;
      const tenure = parseInt(fdForm.tenure);
      
      // Compound Interest Formula: A = P(1 + r/n)^(nt)
      let n = 4; // quarterly by default
      if (fdForm.compoundingFrequency === 'monthly') n = 12;
      if (fdForm.compoundingFrequency === 'yearly') n = 1;
      if (fdForm.compoundingFrequency === 'maturity') n = 1;
      
      const t = tenure / 12; // convert months to years
      const maturityAmount = principal * Math.pow((1 + (rate / 100) / n), n * t);
      const interest = maturityAmount - principal;

      setFdCalculation({
        principal,
        interest: Math.round(interest),
        maturityAmount: Math.round(maturityAmount),
        rate
      });
      
      setFdForm(prev => ({ ...prev, interestRate: rate }));
    } else {
      setFdCalculation(null);
    }
  }, [fdForm.amount, fdForm.tenure, fdForm.compoundingFrequency]);

  // RD Calculation Effect
  useEffect(() => {
    if (rdForm.monthlyAmount && parseFloat(rdForm.monthlyAmount) >= 500) {
      const monthly = parseFloat(rdForm.monthlyAmount);
      const rate = rdInterestRates[rdForm.tenure] || 7.25;
      const tenure = parseInt(rdForm.tenure);
      
      // RD Maturity Calculation
      const n = 4; // quarterly compounding
      const i = rate / 100 / n;
      const totalMonths = tenure;
      
      let maturityAmount = 0;
      for (let month = 1; month <= totalMonths; month++) {
        const remainingMonths = totalMonths - month + 1;
        const years = remainingMonths / 12;
        maturityAmount += monthly * Math.pow((1 + (rate / 100) / 4), 4 * years);
      }
      
      const totalInvestment = monthly * tenure;
      const interest = maturityAmount - totalInvestment;

      setRdCalculation({
        totalInvestment,
        interest: Math.round(interest),
        maturityAmount: Math.round(maturityAmount),
        rate
      });
      
      setRdForm(prev => ({ ...prev, interestRate: rate }));
    } else {
      setRdCalculation(null);
    }
  }, [rdForm.monthlyAmount, rdForm.tenure, rdForm.compoundingFrequency]);

  // ✅ FIXED: Proper array handling for deposits
  const fetchDeposits = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'fd') {
        try {
          const response = await fdService.getAllFDs();
          
          // ✅ FIX: Ensure fixedDeposits is always an array
          const fdsData = response?.data || [];
          const fdsArray = Array.isArray(fdsData) ? fdsData : [];
          
          if (fdsArray.length > 0) {
            setFixedDeposits(fdsArray);
          } else {
            setFixedDeposits([
              {
                _id: '1',
                fdNumber: 'FD001234',
                amount: 100000,
                tenure: 12,
                interestRate: 7.5,
                maturityAmount: 107500,
                maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                startDate: new Date(),
                status: 'active'
              },
              {
                _id: '2',
                fdNumber: 'FD001235',
                amount: 50000,
                tenure: 24,
                interestRate: 7.75,
                maturityAmount: 58000,
                maturityDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
                startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
                status: 'active'
              }
            ]);
          }
        } catch (error) {
          console.log('Using demo FD data');
          setFixedDeposits([
            {
              _id: '1',
              fdNumber: 'FD001234',
              amount: 100000,
              tenure: 12,
              interestRate: 7.5,
              maturityAmount: 107500,
              maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              startDate: new Date(),
              status: 'active'
            },
            {
              _id: '2',
              fdNumber: 'FD001235',
              amount: 50000,
              tenure: 24,
              interestRate: 7.75,
              maturityAmount: 58000,
              maturityDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
              startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
              status: 'active'
            }
          ]);
        }
      } else if (activeTab === 'rd') {
        try {
          const response = await rdService.getAllRDs();
          
          // ✅ FIX: Ensure recurringDeposits is always an array
          const rdsData = response?.data || [];
          const rdsArray = Array.isArray(rdsData) ? rdsData : [];
          
          if (rdsArray.length > 0) {
            setRecurringDeposits(rdsArray);
          } else {
            setRecurringDeposits([
              {
                _id: '1',
                rdNumber: 'RD001234',
                monthlyAmount: 5000,
                tenure: 24,
                interestRate: 7.5,
                installmentsPaid: 8,
                maturityAmount: 132000,
                nextDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                status: 'active'
              }
            ]);
          }
        } catch (error) {
          console.log('Using demo RD data');
          setRecurringDeposits([
            {
              _id: '1',
              rdNumber: 'RD001234',
              monthlyAmount: 5000,
              tenure: 24,
              interestRate: 7.5,
              installmentsPaid: 8,
              maturityAmount: 132000,
              nextDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
              status: 'active'
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
      setFixedDeposits([]);
      setRecurringDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  // Create FD
  const handleCreateFD = async () => {
    try {
      if (!fdForm.amount || parseFloat(fdForm.amount) < 1000) {
        alert('Minimum FD amount is ₹1,000');
        return;
      }

      setLoading(true);

      try {
        await fdService.createFD({
          amount: parseFloat(fdForm.amount),
          tenure: parseInt(fdForm.tenure),
          interestRate: parseFloat(fdForm.interestRate),
          compoundingFrequency: fdForm.compoundingFrequency
        });
      } catch (error) {
        // If API fails, add to local state for demo
        const newFD = {
          _id: Date.now().toString(),
          fdNumber: `FD00${Math.floor(1000 + Math.random() * 9000)}`,
          amount: parseFloat(fdForm.amount),
          tenure: parseInt(fdForm.tenure),
          interestRate: fdForm.interestRate,
          maturityAmount: fdCalculation?.maturityAmount || parseFloat(fdForm.amount) * 1.075,
          maturityDate: new Date(Date.now() + parseInt(fdForm.tenure) * 30 * 24 * 60 * 60 * 1000),
          startDate: new Date(),
          status: 'active'
        };
        setFixedDeposits(prev => [...prev, newFD]);
      }

      alert('Fixed Deposit created successfully!');
      setShowFDModal(false);
      setFdForm({ amount: '', tenure: '12', interestRate: 7.5, compoundingFrequency: 'quarterly' });
      setFdCalculation(null);
    } catch (error) {
      console.error('Error creating FD:', error);
      alert('Failed to create Fixed Deposit');
    } finally {
      setLoading(false);
    }
  };

  // Create RD
  const handleCreateRD = async () => {
    try {
      if (!rdForm.monthlyAmount || parseFloat(rdForm.monthlyAmount) < 500) {
        alert('Minimum RD monthly amount is ₹500');
        return;
      }

      setLoading(true);

      try {
        await rdService.createRD({
          monthlyAmount: parseFloat(rdForm.monthlyAmount),
          tenure: parseInt(rdForm.tenure),
          interestRate: parseFloat(rdForm.interestRate),
          compoundingFrequency: rdForm.compoundingFrequency
        });
      } catch (error) {
        // If API fails, add to local state for demo
        const newRD = {
          _id: Date.now().toString(),
          rdNumber: `RD00${Math.floor(1000 + Math.random() * 9000)}`,
          monthlyAmount: parseFloat(rdForm.monthlyAmount),
          tenure: parseInt(rdForm.tenure),
          interestRate: rdForm.interestRate,
          installmentsPaid: 0,
          maturityAmount: rdCalculation?.maturityAmount || parseFloat(rdForm.monthlyAmount) * parseInt(rdForm.tenure) * 1.08,
          nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        };
        setRecurringDeposits(prev => [...prev, newRD]);
      }

      alert('Recurring Deposit created successfully!');
      setShowRDModal(false);
      setRdForm({ monthlyAmount: '', tenure: '12', interestRate: 7.25, compoundingFrequency: 'quarterly' });
      setRdCalculation(null);
    } catch (error) {
      console.error('Error creating RD:', error);
      alert('Failed to create Recurring Deposit');
    } finally {
      setLoading(false);
    }
  };

  // Break FD
  const handleBreakFD = async (fdId) => {
    if (!window.confirm('Are you sure you want to break this FD? You may lose some interest.')) {
      return;
    }

    try {
      await fdService.breakFD(fdId);
      alert('Fixed Deposit broken successfully!');
    } catch (error) {
      console.log('Demo mode: FD broken');
    }
    
    setFixedDeposits(prev => prev.filter(fd => fd._id !== fdId));
  };

  // Break RD
  const handleBreakRD = async (rdId) => {
    if (!window.confirm('Are you sure you want to break this RD? You may lose some interest.')) {
      return;
    }

    try {
      await rdService.breakRD(rdId);
      alert('Recurring Deposit broken successfully!');
    } catch (error) {
      console.log('Demo mode: RD broken');
    }
    
    setRecurringDeposits(prev => prev.filter(rd => rd._id !== rdId));
  };

  // Pay RD Installment
  const handlePayInstallment = async (rdId) => {
    try {
      await rdService.payInstallment(rdId);
      alert('Installment paid successfully!');
    } catch (error) {
      console.log('Demo mode: Installment paid');
    }
    
    setRecurringDeposits(prev => prev.map(rd => 
      rd._id === rdId 
        ? { ...rd, installmentsPaid: rd.installmentsPaid + 1 }
        : rd
    ));
  };

  // Calculate SIP Returns
  const calculateSIPReturns = () => {
    const { monthly, years, expectedReturn } = sipValues;
    const months = years * 12;
    const monthlyRate = expectedReturn / 12 / 100;
    
    const maturityValue = monthly * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    const invested = monthly * months;
    const returns = maturityValue - invested;

    return {
      invested,
      returns,
      maturityValue
    };
  };

  const sipResult = calculateSIPReturns();

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const getRiskColor = (risk) => {
    const colors = {
      'Low': '#10b981',
      'Moderate': '#f59e0b',
      'High': '#ef4444',
      'Very High': '#dc2626'
    };
    return colors[risk] || '#6b7280';
  };

  const getProgressPercent = (fd) => {
    const start = new Date(fd.startDate).getTime();
    const end = new Date(fd.maturityDate).getTime();
    const now = Date.now();
    const percent = ((now - start) / (end - start)) * 100;
    return Math.min(100, Math.max(0, percent));
  };

  // ✅ FIX: Safe filter functions
  const getActiveFDs = () => {
    if (!Array.isArray(fixedDeposits)) return [];
    return fixedDeposits.filter(fd => fd.status === 'active');
  };

  const getActiveRDs = () => {
    if (!Array.isArray(recurringDeposits)) return [];
    return recurringDeposits.filter(rd => rd.status === 'active');
  };

  const getTotalFDInvested = () => {
    if (!Array.isArray(fixedDeposits)) return 0;
    return fixedDeposits.reduce((sum, fd) => sum + (fd.amount || 0), 0);
  };

  const getTotalFDMaturity = () => {
    if (!Array.isArray(fixedDeposits)) return 0;
    return fixedDeposits.reduce((sum, fd) => sum + (fd.maturityAmount || 0), 0);
  };

  const getTotalRDMonthly = () => {
    if (!Array.isArray(recurringDeposits)) return 0;
    return recurringDeposits.reduce((sum, rd) => sum + (rd.monthlyAmount || 0), 0);
  };

  const getTotalRDMaturity = () => {
    if (!Array.isArray(recurringDeposits)) return 0;
    return recurringDeposits.reduce((sum, rd) => sum + (rd.maturityAmount || 0), 0);
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
              <h1>📈 Investments</h1>
              <p>Manage your mutual funds, FD & RD</p>
            </div>
            {activeTab === 'fd' && (
              <button className={styles.primaryBtn} onClick={() => setShowFDModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create FD
              </button>
            )}
            {activeTab === 'rd' && (
              <button className={styles.primaryBtn} onClick={() => setShowRDModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create RD
              </button>
            )}
            {activeTab === 'portfolio' && (
              <button className={styles.primaryBtn}>
                + Start New SIP
              </button>
            )}
          </div>

          {/* Portfolio Summary */}
          <div className={styles.portfolioSummary}>
            <div className={styles.summaryMain}>
              <div className={styles.portfolioValue}>
                <span className={styles.label}>Current Value</span>
                <span className={styles.value}>{formatCurrency(portfolio.totalValue)}</span>
              </div>
              <div className={styles.portfolioReturns}>
                <div className={styles.returnItem}>
                  <span className={styles.label}>Invested</span>
                  <span className={styles.value}>{formatCurrency(portfolio.invested)}</span>
                </div>
                <div className={styles.returnItem}>
                  <span className={styles.label}>Total Returns</span>
                  <span className={`${styles.value} ${styles.positive}`}>
                    +{formatCurrency(portfolio.returns)} ({portfolio.returnsPercent}%)
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.portfolioChart}>
              <div className={styles.miniChart}>
                <svg viewBox="0 0 100 40">
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    points="0,35 15,30 30,25 45,28 60,20 75,15 90,10 100,5"
                  />
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                  </linearGradient>
                  <polygon
                    fill="url(#chartGradient)"
                    points="0,35 15,30 30,25 45,28 60,20 75,15 90,10 100,5 100,40 0,40"
                  />
                </svg>
              </div>
              <span className={styles.chartLabel}>Last 1 Year</span>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <button 
              className={`${styles.tab} ${activeTab === 'portfolio' ? styles.active : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              📊 Mutual Funds
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'fd' ? styles.active : ''}`}
              onClick={() => setActiveTab('fd')}
            >
              🏦 Fixed Deposits
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'rd' ? styles.active : ''}`}
              onClick={() => setActiveTab('rd')}
            >
              📅 Recurring Deposits
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'explore' ? styles.active : ''}`}
              onClick={() => setActiveTab('explore')}
            >
              🔍 Explore Funds
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'sip' ? styles.active : ''}`}
              onClick={() => setActiveTab('sip')}
            >
              🧮 SIP Calculator
            </button>
          </div>

          {/* Loading State */}
          {loading && <LoadingSpinner />}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && !loading && (
            <div className={styles.holdingsSection}>
              <h3>Your Holdings</h3>
              <div className={styles.holdingsList}>
                {portfolio.holdings.map(holding => (
                  <div key={holding.id} className={styles.holdingCard}>
                    <div className={styles.holdingHeader}>
                      <div className={styles.holdingInfo}>
                        <h4>{holding.name}</h4>
                        <div className={styles.holdingMeta}>
                          <span className={styles.fundType}>{holding.type}</span>
                          <span 
                            className={styles.riskTag}
                            style={{ background: getRiskColor(holding.risk) + '20', color: getRiskColor(holding.risk) }}
                          >
                            {holding.risk}
                          </span>
                        </div>
                      </div>
                      <div className={`${styles.holdingReturns} ${holding.returns >= 0 ? styles.positive : styles.negative}`}>
                        {holding.returns >= 0 ? '+' : ''}{holding.returns}%
                      </div>
                    </div>
                    <div className={styles.holdingBody}>
                      <div className={styles.holdingRow}>
                        <span>Invested</span>
                        <span>{formatCurrency(holding.invested)}</span>
                      </div>
                      <div className={styles.holdingRow}>
                        <span>Current Value</span>
                        <span className={styles.currentValue}>{formatCurrency(holding.current)}</span>
                      </div>
                      <div className={styles.holdingRow}>
                        <span>Units</span>
                        <span>{holding.units.toFixed(2)}</span>
                      </div>
                      <div className={styles.holdingRow}>
                        <span>NAV</span>
                        <span>₹{holding.nav}</span>
                      </div>
                    </div>
                    <div className={styles.holdingActions}>
                      <button className={styles.actionBtn}>+ Invest More</button>
                      <button className={styles.actionBtn}>Redeem</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fixed Deposits Tab */}
          {activeTab === 'fd' && !loading && (
            <div className={styles.fdSection}>
              <h3>Your Fixed Deposits</h3>
              
              {/* FD Summary Cards */}
              <div className={styles.summaryCards}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  </div>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryLabel}>Active FDs</span>
                    <span className={styles.summaryValue}>{getActiveFDs().length}</span>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryLabel}>Total Invested</span>
                    <span className={styles.summaryValue}>{formatCurrency(getTotalFDInvested())}</span>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryLabel}>Maturity Value</span>
                    <span className={styles.summaryValue}>{formatCurrency(getTotalFDMaturity())}</span>
                  </div>
                </div>
              </div>

              <div className={styles.fdList}>
                {Array.isArray(fixedDeposits) && fixedDeposits.length > 0 ? (
                  fixedDeposits.map(fd => (
                    <div key={fd._id} className={styles.fdCard}>
                      <div className={styles.fdHeader}>
                        <div className={styles.fdInfo}>
                          <h4>Fixed Deposit</h4>
                          <span className={styles.fdNumber}>#{fd.fdNumber}</span>
                        </div>
                        <span className={`${styles.statusBadge} ${fd.status === 'active' ? styles.active : styles.matured}`}>
                          {fd.status}
                        </span>
                      </div>
                      
                      <div className={styles.fdBody}>
                        <div className={styles.fdAmount}>
                          <span className={styles.label}>Principal Amount</span>
                          <span className={styles.value}>{formatCurrency(fd.amount)}</span>
                        </div>
                        
                        <div className={styles.fdDetails}>
                          <div className={styles.fdDetailItem}>
                            <span className={styles.label}>Interest Rate</span>
                            <span className={styles.value}>{fd.interestRate}% p.a.</span>
                          </div>
                          <div className={styles.fdDetailItem}>
                            <span className={styles.label}>Tenure</span>
                            <span className={styles.value}>{fd.tenure} months</span>
                          </div>
                          <div className={styles.fdDetailItem}>
                            <span className={styles.label}>Maturity Amount</span>
                            <span className={`${styles.value} ${styles.highlight}`}>{formatCurrency(fd.maturityAmount)}</span>
                          </div>
                          <div className={styles.fdDetailItem}>
                            <span className={styles.label}>Maturity Date</span>
                            <span className={styles.value}>
                              {new Date(fd.maturityDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className={styles.progressSection}>
                          <div className={styles.progressHeader}>
                            <span>Progress</span>
                            <span>{Math.round(getProgressPercent(fd))}%</span>
                          </div>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressFill}
                              style={{ width: `${getProgressPercent(fd)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles.fdActions}>
                        <button className={styles.actionBtn}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          Statement
                        </button>
                        {fd.status === 'active' && (
                          <button 
                            className={styles.breakBtn}
                            onClick={() => handleBreakFD(fd._id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="15" y1="9" x2="9" y2="15"/>
                              <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                            Break FD
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    <h3>No Fixed Deposits</h3>
                    <p>Create your first FD and earn guaranteed returns!</p>
                    <button className={styles.primaryBtn} onClick={() => setShowFDModal(true)}>
                      Create Fixed Deposit
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recurring Deposits Tab */}
          {activeTab === 'rd' && !loading && (
            <div className={styles.rdSection}>
              <h3>Your Recurring Deposits</h3>
              
              {/* RD Summary Cards */}
              <div className={styles.summaryCards}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryLabel}>Active RDs</span>
                    <span className={styles.summaryValue}>{getActiveRDs().length}</span>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryLabel}>Monthly Deposit</span>
                    <span className={styles.summaryValue}>{formatCurrency(getTotalRDMonthly())}</span>
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryLabel}>Expected Maturity</span>
                    <span className={styles.summaryValue}>{formatCurrency(getTotalRDMaturity())}</span>
                  </div>
                </div>
              </div>

              <div className={styles.rdList}>
                {Array.isArray(recurringDeposits) && recurringDeposits.length > 0 ? (
                  recurringDeposits.map(rd => (
                    <div key={rd._id} className={styles.rdCard}>
                      <div className={styles.rdHeader}>
                        <div className={styles.rdInfo}>
                          <h4>Recurring Deposit</h4>
                          <span className={styles.rdNumber}>#{rd.rdNumber}</span>
                        </div>
                        <span className={`${styles.statusBadge} ${rd.status === 'active' ? styles.active : styles.matured}`}>
                          {rd.status}
                        </span>
                      </div>
                      
                      <div className={styles.rdBody}>
                        <div className={styles.rdAmounts}>
                          <div className={styles.amountBox}>
                            <span className={styles.label}>Monthly</span>
                            <span className={styles.value}>{formatCurrency(rd.monthlyAmount)}</span>
                          </div>
                          <div className={styles.amountBox}>
                            <span className={styles.label}>Maturity</span>
                            <span className={`${styles.value} ${styles.highlight}`}>{formatCurrency(rd.maturityAmount)}</span>
                          </div>
                        </div>
                        
                        <div className={styles.rdDetails}>
                          <div className={styles.rdDetailItem}>
                            <span className={styles.label}>Interest Rate</span>
                            <span className={styles.value}>{rd.interestRate}% p.a.</span>
                          </div>
                          <div className={styles.rdDetailItem}>
                            <span className={styles.label}>Tenure</span>
                            <span className={styles.value}>{rd.tenure} months</span>
                          </div>
                          <div className={styles.rdDetailItem}>
                            <span className={styles.label}>Installments Paid</span>
                            <span className={styles.value}>{rd.installmentsPaid}/{rd.tenure}</span>
                          </div>
                          <div className={styles.rdDetailItem}>
                            <span className={styles.label}>Next Due</span>
                            <span className={styles.value}>
                              {new Date(rd.nextDueDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className={styles.progressSection}>
                          <div className={styles.progressHeader}>
                            <span>Installments Progress</span>
                            <span>{Math.round((rd.installmentsPaid / rd.tenure) * 100)}%</span>
                          </div>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressFill}
                              style={{ width: `${(rd.installmentsPaid / rd.tenure) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles.rdActions}>
                        <button 
                          className={styles.payBtn}
                          onClick={() => handlePayInstallment(rd._id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                          Pay Installment
                        </button>
                        <button className={styles.actionBtn}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          Statement
                        </button>
                        {rd.status === 'active' && (
                          <button 
                            className={styles.breakBtn}
                            onClick={() => handleBreakRD(rd._id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="15" y1="9" x2="9" y2="15"/>
                              <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                            Break RD
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <h3>No Recurring Deposits</h3>
                    <p>Start saving monthly and build wealth systematically!</p>
                    <button className={styles.primaryBtn} onClick={() => setShowRDModal(true)}>
                      Create Recurring Deposit
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Explore Tab */}
          {activeTab === 'explore' && !loading && (
            <div className={styles.exploreSection}>
              <div className={styles.filterBar}>
                <input 
                  type="text" 
                  placeholder="Search funds..." 
                  className={styles.searchInput}
                />
                <select className={styles.filterSelect}>
                  <option>All Categories</option>
                  <option>Large Cap</option>
                  <option>Mid Cap</option>
                  <option>Small Cap</option>
                  <option>Flexi Cap</option>
                  <option>Index Funds</option>
                  <option>Debt Funds</option>
                </select>
                <select className={styles.filterSelect}>
                  <option>Sort by: Returns</option>
                  <option>Sort by: Rating</option>
                  <option>Sort by: AUM</option>
                </select>
              </div>

              <div className={styles.fundsList}>
                {exploreFunds.map(fund => (
                  <div key={fund.id} className={styles.fundCard}>
                    <div className={styles.fundHeader}>
                      <div>
                        <h4>{fund.name}</h4>
                        <div className={styles.fundMeta}>
                          <span className={styles.category}>{fund.category}</span>
                          <span 
                            className={styles.riskTag}
                            style={{ background: getRiskColor(fund.risk) + '20', color: getRiskColor(fund.risk) }}
                          >
                            {fund.risk}
                          </span>
                        </div>
                      </div>
                      <div className={styles.rating}>
                        {'★'.repeat(fund.rating)}{'☆'.repeat(5 - fund.rating)}
                      </div>
                    </div>

                    <div className={styles.fundReturns}>
                      <div className={styles.returnPeriod}>
                        <span className={styles.period}>1Y</span>
                        <span className={`${styles.returnValue} ${fund.returns1Y >= 0 ? styles.positive : styles.negative}`}>
                          {fund.returns1Y}%
                        </span>
                      </div>
                      <div className={styles.returnPeriod}>
                        <span className={styles.period}>3Y</span>
                        <span className={`${styles.returnValue} ${fund.returns3Y >= 0 ? styles.positive : styles.negative}`}>
                          {fund.returns3Y}%
                        </span>
                      </div>
                      <div className={styles.returnPeriod}>
                        <span className={styles.period}>5Y</span>
                        <span className={`${styles.returnValue} ${fund.returns5Y >= 0 ? styles.positive : styles.negative}`}>
                          {fund.returns5Y}%
                        </span>
                      </div>
                    </div>

                    <div className={styles.fundFooter}>
                      <div className={styles.fundInfo}>
                        <span>Min: ₹{fund.minInvestment}</span>
                        <span>AUM: {fund.aum}</span>
                      </div>
                      <button className={styles.investBtn}>Invest</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIP Calculator Tab */}
          {activeTab === 'sip' && !loading && (
            <div className={styles.sipCalculator}>
              <div className={styles.calculatorCard}>
                <h3>🧮 SIP Calculator</h3>
                <div className={styles.calculatorInputs}>
                  <div className={styles.inputGroup}>
                    <label>Monthly Investment</label>
                    <div className={styles.sliderInput}>
                      <input 
                        type="range" 
                        min="500" 
                        max="100000" 
                        step="500"
                        value={sipValues.monthly}
                        onChange={(e) => setSipValues({...sipValues, monthly: parseInt(e.target.value)})}
                      />
                      <span className={styles.sliderValue}>₹{sipValues.monthly.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Investment Period</label>
                    <div className={styles.sliderInput}>
                      <input 
                        type="range" 
                        min="1" 
                        max="30"
                        value={sipValues.years}
                        onChange={(e) => setSipValues({...sipValues, years: parseInt(e.target.value)})}
                      />
                      <span className={styles.sliderValue}>{sipValues.years} Years</span>
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Expected Return Rate</label>
                    <div className={styles.sliderInput}>
                      <input 
                        type="range" 
                        min="6" 
                        max="20"
                        value={sipValues.expectedReturn}
                        onChange={(e) => setSipValues({...sipValues, expectedReturn: parseInt(e.target.value)})}
                      />
                      <span className={styles.sliderValue}>{sipValues.expectedReturn}%</span>
                    </div>
                  </div>
                </div>

                <div className={styles.calculatorResult}>
                  <div className={styles.resultChart}>
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="#667eea" 
                        strokeWidth="10"
                        strokeDasharray={`${(sipResult.invested / sipResult.maturityValue) * 283} 283`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="10"
                        strokeDasharray={`${(sipResult.returns / sipResult.maturityValue) * 283} 283`}
                        strokeDashoffset={`-${(sipResult.invested / sipResult.maturityValue) * 283}`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className={styles.chartCenter}>
                      <span className={styles.totalValue}>{formatCurrency(sipResult.maturityValue)}</span>
                      <span className={styles.totalLabel}>Maturity Value</span>
                    </div>
                  </div>

                  <div className={styles.resultDetails}>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>
                        <i style={{background: '#667eea'}}></i>
                        Total Invested
                      </span>
                      <span className={styles.resultValue}>{formatCurrency(sipResult.invested)}</span>
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>
                        <i style={{background: '#10b981'}}></i>
                        Est. Returns
                      </span>
                      <span className={`${styles.resultValue} ${styles.positive}`}>+{formatCurrency(sipResult.returns)}</span>
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>
                        <i style={{background: '#8b5cf6'}}></i>
                        Maturity Value
                      </span>
                      <span className={styles.resultValue}><strong>{formatCurrency(sipResult.maturityValue)}</strong></span>
                    </div>
                  </div>
                </div>

                <button className={styles.startSipBtn}>
                  Start SIP Now →
                </button>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </main>
      <BottomNav />

      {/* Create FD Modal */}
      {showFDModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFDModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>🏦 Create Fixed Deposit</h3>
              <button className={styles.closeBtn} onClick={() => setShowFDModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Deposit Amount (₹)</label>
                <input 
                  type="number" 
                  placeholder="Enter amount (Min: ₹1,000)"
                  value={fdForm.amount}
                  onChange={(e) => setFdForm({...fdForm, amount: e.target.value})}
                  min="1000"
                />
                <small>Minimum deposit: ₹1,000</small>
              </div>
              <div className={styles.formGroup}>
                <label>Tenure</label>
                <select 
                  value={fdForm.tenure}
                  onChange={(e) => setFdForm({...fdForm, tenure: e.target.value})}
                >
                  <option value="6">6 Months - 6.5% p.a.</option>
                  <option value="12">12 Months - 7.5% p.a.</option>
                  <option value="24">24 Months - 7.75% p.a.</option>
                  <option value="36">36 Months - 8.0% p.a.</option>
                  <option value="60">60 Months - 8.25% p.a.</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Interest Payout</label>
                <select 
                  value={fdForm.compoundingFrequency}
                  onChange={(e) => setFdForm({...fdForm, compoundingFrequency: e.target.value})}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="maturity">On Maturity</option>
                </select>
              </div>

              {fdCalculation && (
                <div className={styles.calculationResult}>
                  <h4>📊 Maturity Details</h4>
                  <div className={styles.resultItem}>
                    <span>Principal Amount</span>
                    <span>{formatCurrency(fdCalculation.principal)}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span>Interest Rate</span>
                    <span>{fdCalculation.rate}% p.a.</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span>Interest Earned</span>
                    <span className={styles.positive}>+{formatCurrency(fdCalculation.interest)}</span>
                  </div>
                  <div className={`${styles.resultItem} ${styles.total}`}>
                    <span>Maturity Amount</span>
                    <strong>{formatCurrency(fdCalculation.maturityAmount)}</strong>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setShowFDModal(false)}>
                Cancel
              </button>
              <button 
                className={styles.primaryBtn} 
                onClick={handleCreateFD}
                disabled={!fdForm.amount || parseFloat(fdForm.amount) < 1000}
              >
                Create FD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create RD Modal */}
      {showRDModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRDModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>📅 Create Recurring Deposit</h3>
              <button className={styles.closeBtn} onClick={() => setShowRDModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Monthly Amount (₹)</label>
                <input 
                  type="number" 
                  placeholder="Enter monthly amount (Min: ₹500)"
                  value={rdForm.monthlyAmount}
                  onChange={(e) => setRdForm({...rdForm, monthlyAmount: e.target.value})}
                  min="500"
                />
                <small>Minimum monthly amount: ₹500</small>
              </div>
              <div className={styles.formGroup}>
                <label>Tenure</label>
                <select 
                  value={rdForm.tenure}
                  onChange={(e) => setRdForm({...rdForm, tenure: e.target.value})}
                >
                  <option value="12">12 Months - 7.25% p.a.</option>
                  <option value="24">24 Months - 7.5% p.a.</option>
                  <option value="36">36 Months - 7.75% p.a.</option>
                  <option value="60">60 Months - 8.0% p.a.</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Interest Compounding</label>
                <select 
                  value={rdForm.compoundingFrequency}
                  onChange={(e) => setRdForm({...rdForm, compoundingFrequency: e.target.value})}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="maturity">On Maturity</option>
                </select>
              </div>

              {rdCalculation && (
                <div className={styles.calculationResult}>
                  <h4>📊 Maturity Details</h4>
                  <div className={styles.resultItem}>
                    <span>Monthly Investment</span>
                    <span>{formatCurrency(parseFloat(rdForm.monthlyAmount))}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span>Total Investment</span>
                    <span>{formatCurrency(rdCalculation.totalInvestment)}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span>Interest Rate</span>
                    <span>{rdCalculation.rate}% p.a.</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span>Interest Earned</span>
                    <span className={styles.positive}>+{formatCurrency(rdCalculation.interest)}</span>
                  </div>
                  <div className={`${styles.resultItem} ${styles.total}`}>
                    <span>Maturity Amount</span>
                    <strong>{formatCurrency(rdCalculation.maturityAmount)}</strong>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setShowRDModal(false)}>
                Cancel
              </button>
              <button 
                className={styles.primaryBtn} 
                onClick={handleCreateRD}
                disabled={!rdForm.monthlyAmount || parseFloat(rdForm.monthlyAmount) < 500}
              >
                Create RD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;