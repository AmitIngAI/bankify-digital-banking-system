import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  const { user, accounts, transactions } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); 

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const calculatedBalance = accounts?.length 
    ? accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
    : 0;

  const totalBalance = calculatedBalance > 0 ? calculatedBalance : 50000;
  
  const savingsAccount = accounts.find(acc => acc.type === 'savings');
  const currentAccount = accounts.find(acc => acc.type === 'current');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickActions = [
    { icon: '💸', label: 'Send Money', path: '/transfer', color: '#667eea' },
    { icon: '📱', label: 'Mobile Recharge', path: '/recharge', color: '#10b981' },
    { icon: '💡', label: 'Pay Bills', path: '/bills', color: '#f59e0b' },
    { icon: '🏦', label: 'Bank Transfer', path: '/transfer', color: '#8b5cf6' },
    { icon: '💳', label: 'Card Payment', path: '/cards', color: '#ec4899' },
    { icon: '📊', label: 'Investments', path: '/investments', color: '#06b6d4' },
    { icon: '🎫', label: 'Book Tickets', path: '/tickets', color: '#ef4444' },
    { icon: '🛡️', label: 'Insurance', path: '/insurance', color: '#14b8a6' }
  ];

  const recentTransactions = transactions.slice(0, showAllTransactions ? 10 : 5);

  const getTransactionIcon = (type, category) => {
    if (type === 'credit') {
      return (
        <div className={`${styles.txnIcon} ${styles.credit}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="19" x2="12" y2="5"/>
            <polyline points="5,12 12,5 19,12"/>
          </svg>
        </div>
      );
    }
    return (
      <div className={`${styles.txnIcon} ${styles.debit}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <polyline points="19,12 12,19 5,12"/>
        </svg>
      </div>
    );
  };

  return (
    <div className={styles.dashboardLayout}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={styles.mainContent}>
        <div className={styles.dashboardContainer}>
          {/* Welcome Section */}
          <section className={styles.welcomeSection}>
            <div className={styles.welcomeContent}>
              <div className={styles.welcomeText}>
                <span className={styles.greeting}>{greeting},</span>
                <h1 className={styles.userName}>{user?.firstName} {user?.lastName}</h1>
                <p className={styles.welcomeMessage}>Here's your financial overview</p>
              </div>
              <div className={styles.welcomeActions}>
                <button className={styles.notificationBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  <span className={styles.notifBadge}>3</span>
                </button>
              </div>
            </div>
          </section>

          {/* Balance Cards */}
          <section className={styles.balanceSection}>
            <div className={styles.mainBalanceCard}>
              <div className={styles.balanceHeader}>
                <div className={styles.balanceLabel}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M2 10h20"/>
                  </svg>
                  <span>Total Balance</span>
                </div>
                <button className={styles.eyeBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <div className={styles.balanceAmount}>
                {formatCurrency(totalBalance)}
              </div>
              <div className={styles.balanceChange}>
                <span className={styles.positive}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                    <polyline points="17,6 23,6 23,12"/>
                  </svg>
                  +12.5%
                </span>
                <span>vs last month</span>
              </div>
              <div className={styles.cardDecoration}>
                <div className={styles.decorCircle1}></div>
                <div className={styles.decorCircle2}></div>
              </div>
            </div>

            <div className={styles.accountCards}>
              {savingsAccount && (
                <div className={styles.accountCard}>
                  <div className={styles.accountIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z"/>
                      <path d="M2 9v1c0 1.1.9 2 2 2h1"/>
                    </svg>
                  </div>
                  <div className={styles.accountInfo}>
                    <span className={styles.accountType}>Savings Account</span>
                    <span className={styles.accountNumber}>••••{savingsAccount.accountNumber.slice(-4)}</span>
                  </div>
                  <div className={styles.accountBalance}>
                    {formatCurrency(savingsAccount.balance)}
                  </div>
                </div>
              )}

              {currentAccount && (
                <div className={styles.accountCard}>
                  <div className={styles.accountIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                  </div>
                  <div className={styles.accountInfo}>
                    <span className={styles.accountType}>Current Account</span>
                    <span className={styles.accountNumber}>••••{currentAccount.accountNumber.slice(-4)}</span>
                  </div>
                  <div className={styles.accountBalance}>
                    {formatCurrency(currentAccount.balance)}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className={styles.quickActionsSection}>
            <div className={styles.sectionHeader}>
              <h2>Quick Actions</h2>
              <Link to="/services" className={styles.viewAll}>View All</Link>
            </div>
            <div className={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <Link 
                  key={index} 
                  to={action.path} 
                  className={styles.quickActionCard}
                  style={{ '--action-color': action.color }}
                >
                  <div className={styles.actionIcon}>{action.icon}</div>
                  <span className={styles.actionLabel}>{action.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Stats Cards */}
          <section className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5,12 12,5 19,12"/>
                </svg>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Income</span>
                <span className={styles.statValue}>{formatCurrency(85000)}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19,12 12,19 5,12"/>
                </svg>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Expenses</span>
                <span className={styles.statValue}>{formatCurrency(42500)}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Savings</span>
                <span className={styles.statValue}>{formatCurrency(42500)}</span>
              </div>
            </div>
          </section>

          {/* Recent Transactions */}
          <section className={styles.transactionsSection}>
            <div className={styles.sectionHeader}>
              <h2>Recent Transactions</h2>
              <Link to="/transactions" className={styles.viewAll}>View All</Link>
            </div>
            <div className={styles.transactionsList}>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((txn) => (
                  <div key={txn.id} className={styles.transactionItem}>
                    {getTransactionIcon(txn.type, txn.category)}
                    <div className={styles.txnDetails}>
                      <span className={styles.txnDescription}>{txn.description}</span>
                      <span className={styles.txnDate}>
                        {formatDate(txn.date)} • {formatTime(txn.date)}
                      </span>
                    </div>
                    <div className={`${styles.txnAmount} ${txn.type === 'credit' ? styles.credit : styles.debit}`}>
                      {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                    <path d="M9 12h6M9 16h6"/>
                  </svg>
                  <p>No transactions yet</p>
                </div>
              )}
            </div>
            {transactions.length > 5 && (
              <button 
                className={styles.showMoreBtn}
                onClick={() => setShowAllTransactions(!showAllTransactions)}
              >
                {showAllTransactions ? 'Show Less' : 'Show More'}
              </button>
            )}
          </section>

          {/* Promo Cards */}
          <section className={styles.promoSection}>
            <div className={styles.promoCard}>
              <div className={styles.promoContent}>
                <span className={styles.promoBadge}>NEW</span>
                <h3>Get Instant Personal Loan</h3>
                <p>Pre-approved loans up to ₹10 Lakhs at 10.5% p.a.</p>
                <Link to="/loans" className={styles.promoBtn}>Apply Now</Link>
              </div>
              <div className={styles.promoVisual}>
                <div className={styles.promoIcon}>💰</div>
              </div>
            </div>
            <div className={styles.promoCard} style={{ '--promo-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}>
              <div className={styles.promoContent}>
                <span className={styles.promoBadge}>OFFER</span>
                <h3>Refer & Earn ₹500</h3>
                <p>Invite friends and earn rewards on each successful referral</p>
                <Link to="/refer" className={styles.promoBtn}>Invite Now</Link>
              </div>
              <div className={styles.promoVisual}>
                <div className={styles.promoIcon}>🎁</div>
              </div>
            </div>
          </section>

          {/* Spending Analytics */}
          <section className={styles.analyticsSection}>
            <div className={styles.sectionHeader}>
              <h2>Spending Analytics</h2>
              {/* ✅ FIX: Using value prop instead of selected attribute on option */}
              <select 
                className={styles.periodSelect}
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div className={styles.analyticsGrid}>
              <div className={styles.spendingChart}>
                <div className={styles.chartBars}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={day} className={styles.chartBar}>
                      <div 
                        className={styles.barFill} 
                        style={{ height: `${Math.random() * 60 + 20}%` }}
                      ></div>
                      <span>{day}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.categoryBreakdown}>
                <h4>Top Categories</h4>
                <div className={styles.categoryList}>
                  {[
                    { name: 'Food & Dining', amount: 8500, percent: 35, color: '#ef4444' },
                    { name: 'Shopping', amount: 6200, percent: 25, color: '#8b5cf6' },
                    { name: 'Transport', amount: 4500, percent: 18, color: '#3b82f6' },
                    { name: 'Entertainment', amount: 3200, percent: 13, color: '#10b981' },
                    { name: 'Others', amount: 2100, percent: 9, color: '#6b7280' }
                  ].map((cat, i) => (
                    <div key={i} className={styles.categoryItem}>
                      <div className={styles.categoryInfo}>
                        <div className={styles.categoryDot} style={{ background: cat.color }}></div>
                        <span>{cat.name}</span>
                      </div>
                      <div className={styles.categoryStats}>
                        <span className={styles.categoryAmount}>{formatCurrency(cat.amount)}</span>
                        <div className={styles.categoryBar}>
                          <div style={{ width: `${cat.percent}%`, background: cat.color }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;