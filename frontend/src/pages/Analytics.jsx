import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { analyticsService, budgetService, transactionService } from '../utils/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from '../styles/Analytics.module.css';

const Analytics = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for data
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  
  // Budget Modal State
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });

  useEffect(() => {
    fetchAnalyticsData();
    fetchBudgets();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await analyticsService.getDashboardStats();
      setDashboardStats(statsResponse.data);

      // Fetch transactions based on period
      const txnResponse = await transactionService.getAllTransactions();
      setTransactions(txnResponse.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use demo data
      setTransactions(getDemoTransactions());
      setDashboardStats(getDemoStats());
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await budgetService.getAllBudgets();
      setBudgets(response.data || []);
    } catch (error) {
      console.log('Using demo budget data');
      setBudgets(getDemoBudgets());
    }
  };

  const handleCreateBudget = async () => {
    try {
      if (!budgetForm.category || !budgetForm.amount) {
        alert('Please fill all fields');
        return;
      }

      setLoading(true);

      await budgetService.createBudget({
        category: budgetForm.category,
        amount: parseFloat(budgetForm.amount),
        period: budgetForm.period
      });

      alert('Budget created successfully!');
      setShowBudgetModal(false);
      setBudgetForm({ category: '', amount: '', period: 'monthly' });
      fetchBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBudget = async (budgetId, newAmount) => {
    try {
      await budgetService.updateBudget(budgetId, { amount: newAmount });
      alert('Budget updated successfully!');
      fetchBudgets();
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Failed to update budget');
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await budgetService.deleteBudget(budgetId);
      alert('Budget deleted successfully!');
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget');
    }
  };

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filteredTxns = transactions.filter(t => new Date(t.createdAt || t.date) >= startDate);

    const income = filteredTxns.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTxns.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

    // Category breakdown
    const categories = {};
    filteredTxns.filter(t => t.type === 'debit').forEach(t => {
      const cat = t.category || 'Other';
      categories[cat] = (categories[cat] || 0) + t.amount;
    });

    const categoryData = Object.entries(categories)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: expenses > 0 ? ((amount / expenses) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly trend
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-IN', { month: 'short' });
      const monthTxns = transactions.filter(t => {
        const txnDate = new Date(t.createdAt || t.date);
        return txnDate.getMonth() === date.getMonth() && txnDate.getFullYear() === date.getFullYear();
      });
      monthlyTrend.push({
        month: monthName,
        income: monthTxns.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
        expenses: monthTxns.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
      });
    }

    return {
      income,
      expenses,
      savings,
      savingsRate,
      categoryData,
      monthlyTrend,
      transactionCount: filteredTxns.length,
      avgTransaction: filteredTxns.length > 0 ? expenses / filteredTxns.filter(t => t.type === 'debit').length : 0
    };
  }, [transactions, period]);

  // Calculate budget progress
  const budgetProgress = useMemo(() => {
    return budgets.map(budget => {
      const categoryExpenses = transactions
        .filter(t => 
          t.type === 'debit' && 
          t.category === budget.category &&
          new Date(t.createdAt || t.date).getMonth() === new Date().getMonth()
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (categoryExpenses / budget.amount) * 100;
      const isOverBudget = percentage > 100;

      return {
        ...budget,
        spent: categoryExpenses,
        percentage: Math.round(percentage),
        isOverBudget,
        remaining: budget.amount - categoryExpenses
      };
    });
  }, [budgets, transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const categoryColors = {
    'Food': '#ef4444',
    'Shopping': '#8b5cf6',
    'Transport': '#3b82f6',
    'Entertainment': '#ec4899',
    'Bills': '#f59e0b',
    'Health': '#10b981',
    'Education': '#6366f1',
    'Transfer': '#14b8a6',
    'Groceries': '#f97316',
    'Utilities': '#eab308',
    'Other': '#6b7280'
  };

  const categories = [
    'Food', 'Shopping', 'Transport', 'Entertainment', 
    'Bills', 'Health', 'Education', 'Groceries', 'Utilities', 'Other'
  ];

  // Demo data functions
  const getDemoTransactions = () => [
    { _id: '1', amount: 50000, type: 'credit', category: 'Salary', createdAt: new Date(), description: 'Monthly Salary' },
    { _id: '2', amount: 8500, type: 'debit', category: 'Food', createdAt: new Date(), description: 'Groceries' },
    { _id: '3', amount: 15000, type: 'debit', category: 'Shopping', createdAt: new Date(), description: 'Clothes' },
    { _id: '4', amount: 3500, type: 'debit', category: 'Transport', createdAt: new Date(), description: 'Uber' },
    { _id: '5', amount: 4000, type: 'debit', category: 'Entertainment', createdAt: new Date(), description: 'Movies' },
  ];

  const getDemoStats = () => ({
    totalIncome: 50000,
    totalExpenses: 31000,
    savings: 19000,
    transactionCount: 25
  });

  const getDemoBudgets = () => [
    { _id: '1', category: 'Food', amount: 10000, period: 'monthly' },
    { _id: '2', category: 'Shopping', amount: 12000, period: 'monthly' },
    { _id: '3', category: 'Transport', amount: 5000, period: 'monthly' },
    { _id: '4', category: 'Entertainment', amount: 5000, period: 'monthly' },
    { _id: '5', category: 'Bills', amount: 15000, period: 'monthly' }
  ];

  if (loading && transactions.length === 0) {
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
              <h1>📊 Analytics & Budget</h1>
              <p>Deep insights into your finances</p>
            </div>
            <div className={styles.periodSelector}>
              {['week', 'month', 'quarter', 'year'].map(p => (
                <button
                  key={p}
                  className={`${styles.periodBtn} ${period === p ? styles.active : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className={styles.summaryGrid}>
            <div className={`${styles.summaryCard} ${styles.income}`}>
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5,12 12,5 19,12"/>
                </svg>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>Total Income</span>
                <span className={styles.cardValue}>{formatCurrency(analyticsData.income)}</span>
                <span className={styles.cardChange}>
                  <span className={styles.positive}>+12.5%</span> vs last {period}
                </span>
              </div>
            </div>

            <div className={`${styles.summaryCard} ${styles.expenses}`}>
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19,12 12,19 5,12"/>
                </svg>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>Total Expenses</span>
                <span className={styles.cardValue}>{formatCurrency(analyticsData.expenses)}</span>
                <span className={styles.cardChange}>
                  <span className={styles.negative}>+8.3%</span> vs last {period}
                </span>
              </div>
            </div>

            <div className={`${styles.summaryCard} ${styles.savings}`}>
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z"/>
                </svg>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>Net Savings</span>
                <span className={styles.cardValue}>{formatCurrency(analyticsData.savings)}</span>
                <span className={styles.cardChange}>
                  <span className={styles.positive}>{analyticsData.savingsRate}%</span> savings rate
                </span>
              </div>
            </div>

            <div className={`${styles.summaryCard} ${styles.transactions}`}>
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 1l4 4-4 4"/>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                  <path d="M7 23l-4-4 4-4"/>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>Transactions</span>
                <span className={styles.cardValue}>{analyticsData.transactionCount}</span>
                <span className={styles.cardChange}>
                  Avg: {formatCurrency(analyticsData.avgTransaction)}
                </span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className={styles.chartsGrid}>
            {/* Income vs Expenses Trend Chart */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>📈 Income vs Expenses Trend</h3>
                <button className={styles.exportBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Export
                </button>
              </div>
              <div className={styles.chartBody}>
                <div className={styles.barChartContainer}>
                  {analyticsData.monthlyTrend.map((item, index) => {
                    const maxValue = Math.max(...analyticsData.monthlyTrend.map(m => Math.max(m.income, m.expenses)));
                    return (
                      <div key={index} className={styles.barGroup}>
                        <div className={styles.barsWrapper}>
                          <div 
                            className={`${styles.bar} ${styles.incomeBar}`}
                            style={{ 
                              height: maxValue > 0 ? `${(item.income / maxValue) * 150}px` : '0px'
                            }}
                          >
                            <span className={styles.barTooltip}>{formatCurrency(item.income)}</span>
                          </div>
                          <div 
                            className={`${styles.bar} ${styles.expenseBar}`}
                            style={{ 
                              height: maxValue > 0 ? `${(item.expenses / maxValue) * 150}px` : '0px'
                            }}
                          >
                            <span className={styles.barTooltip}>{formatCurrency(item.expenses)}</span>
                          </div>
                        </div>
                        <span className={styles.barLabel}>{item.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.chartLegend}>
                  <span><i className={styles.incomeIndicator}></i> Income</span>
                  <span><i className={styles.expenseIndicator}></i> Expenses</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>🎯 Spending by Category</h3>
              </div>
              <div className={styles.chartBody}>
                {analyticsData.categoryData.length > 0 ? (
                  <>
                    <div className={styles.donutContainer}>
                      <svg viewBox="0 0 100 100" className={styles.donutChart}>
                        {analyticsData.categoryData.reduce((acc, item, index) => {
                          const startAngle = acc.angle;
                          const sliceAngle = (item.amount / analyticsData.expenses) * 360;
                          const endAngle = startAngle + sliceAngle;

                          const startRad = (startAngle - 90) * Math.PI / 180;
                          const endRad = (endAngle - 90) * Math.PI / 180;

                          const x1 = 50 + 40 * Math.cos(startRad);
                          const y1 = 50 + 40 * Math.sin(startRad);
                          const x2 = 50 + 40 * Math.cos(endRad);
                          const y2 = 50 + 40 * Math.sin(endRad);

                          const largeArc = sliceAngle > 180 ? 1 : 0;

                          acc.paths.push(
                            <path
                              key={index}
                              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={categoryColors[item.name] || '#6b7280'}
                              className={`${styles.donutSlice} ${selectedCategory === item.name ? styles.selected : ''}`}
                              onClick={() => setSelectedCategory(selectedCategory === item.name ? null : item.name)}
                            />
                          );
                          acc.angle = endAngle;
                          return acc;
                        }, { paths: [], angle: 0 }).paths}
                        <circle cx="50" cy="50" r="25" fill="white" />
                      </svg>
                      <div className={styles.donutCenter}>
                        <span className={styles.donutTotal}>
                          {formatCurrency(selectedCategory 
                            ? analyticsData.categoryData.find(c => c.name === selectedCategory)?.amount || 0
                            : analyticsData.expenses
                          )}
                        </span>
                        <span className={styles.donutLabel}>
                          {selectedCategory || 'Total'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.categoryList}>
                      {analyticsData.categoryData.map((cat, index) => (
                        <div 
                          key={index} 
                          className={`${styles.categoryItem} ${selectedCategory === cat.name ? styles.selected : ''}`}
                          onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                        >
                          <div className={styles.categoryInfo}>
                            <span 
                              className={styles.categoryDot} 
                              style={{ background: categoryColors[cat.name] || '#6b7280' }}
                            ></span>
                            <span className={styles.categoryName}>{cat.name}</span>
                          </div>
                          <div className={styles.categoryStats}>
                            <span className={styles.categoryAmount}>{formatCurrency(cat.amount)}</span>
                            <span className={styles.categoryPercent}>{cat.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={styles.noData}>
                    <p>No expense data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Budget Overview */}
          <div className={styles.budgetSection}>
            <div className={styles.sectionHeader}>
              <h3>💰 Budget Planner</h3>
              <button 
                className={styles.setBudgetBtn}
                onClick={() => setShowBudgetModal(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Budget
              </button>
            </div>
            
            {budgetProgress.length > 0 ? (
              <div className={styles.budgetGrid}>
                {budgetProgress.map((item) => (
                  <div key={item._id} className={styles.budgetCard}>
                    <div className={styles.budgetHeader}>
                      <span className={styles.budgetCategory}>
                        {item.category}
                      </span>
                      <div className={styles.budgetActions}>
                        <button 
                          className={styles.budgetEditBtn}
                          onClick={() => {
                            const newAmount = prompt('Enter new budget amount:', item.amount);
                            if (newAmount) handleUpdateBudget(item._id, parseFloat(newAmount));
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button 
                          className={styles.budgetDeleteBtn}
                          onClick={() => handleDeleteBudget(item._id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className={styles.budgetProgress}>
                      <div 
                        className={`${styles.budgetFill} ${item.isOverBudget ? styles.over : ''}`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className={styles.budgetInfo}>
                      <span>{formatCurrency(item.spent)} spent</span>
                      <span>of {formatCurrency(item.amount)}</span>
                    </div>
                    <div className={styles.budgetStatus}>
                      {item.isOverBudget ? (
                        <span className={styles.overBudget}>
                          ⚠️ Over by {formatCurrency(Math.abs(item.remaining))}
                        </span>
                      ) : (
                        <span className={styles.remaining}>
                          ✓ {formatCurrency(item.remaining)} remaining
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noBudgets}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h4>No budgets set</h4>
                <p>Create budgets to track and control your spending</p>
                <button 
                  className={styles.primaryBtn}
                  onClick={() => setShowBudgetModal(true)}
                >
                  Create Your First Budget
                </button>
              </div>
            )}
          </div>

          {/* Insights Section */}
          <div className={styles.insightsSection}>
            <h3>💡 Smart Insights</h3>
            <div className={styles.insightsGrid}>
              {budgetProgress.filter(b => b.isOverBudget).length > 0 && (
                <div className={`${styles.insightCard} ${styles.warning}`}>
                  <div className={styles.insightIcon}>⚠️</div>
                  <div className={styles.insightContent}>
                    <h4>Budget Alert</h4>
                    <p>You've exceeded {budgetProgress.filter(b => b.isOverBudget).length} budget(s). Review your spending!</p>
                  </div>
                </div>
              )}
              
              {analyticsData.savingsRate > 20 && (
                <div className={`${styles.insightCard} ${styles.success}`}>
                  <div className={styles.insightIcon}>🎯</div>
                  <div className={styles.insightContent}>
                    <h4>Great Savings!</h4>
                    <p>You're saving {analyticsData.savingsRate}% of your income. Keep it up!</p>
                  </div>
                </div>
              )}

              <div className={styles.insightCard}>
                <div className={styles.insightIcon}>📊</div>
                <div className={styles.insightContent}>
                  <h4>Top Spending Category</h4>
                  <p>
                    {analyticsData.categoryData[0]?.name || 'N/A'} - {formatCurrency(analyticsData.categoryData[0]?.amount || 0)}
                  </p>
                </div>
              </div>

              <div className={styles.insightCard}>
                <div className={styles.insightIcon}>🏆</div>
                <div className={styles.insightContent}>
                  <h4>Monthly Progress</h4>
                  <p>You've completed {analyticsData.transactionCount} transactions this {period}.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
      <BottomNav />

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBudgetModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>💰 Create Budget</h3>
              <button className={styles.closeBtn} onClick={() => setShowBudgetModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Budget Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={budgetForm.amount}
                  onChange={(e) => setBudgetForm({...budgetForm, amount: e.target.value})}
                  min="100"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Period</label>
                <select
                  value={budgetForm.period}
                  onChange={(e) => setBudgetForm({...budgetForm, period: e.target.value})}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setShowBudgetModal(false)}>
                Cancel
              </button>
              <button className={styles.primaryBtn} onClick={handleCreateBudget}>
                Create Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;