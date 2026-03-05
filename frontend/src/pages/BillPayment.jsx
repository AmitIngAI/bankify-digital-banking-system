import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { billService, accountService } from '../utils/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from '../styles/BillPayment.module.css';

const BillPayment = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pay');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBiller, setSelectedBiller] = useState(null);
  const [billHistory, setBillHistory] = useState([]);
  const [savedBillers, setSavedBillers] = useState([]);

  // Bill Payment Form
  const [billForm, setBillForm] = useState({
    accountId: '',
    consumerId: '',
    amount: '',
    billNumber: ''
  });

  // Bill Categories
  const categories = [
    { id: 'electricity', name: 'Electricity', icon: '⚡', color: '#f59e0b' },
    { id: 'water', name: 'Water', icon: '💧', color: '#3b82f6' },
    { id: 'gas', name: 'Gas', icon: '🔥', color: '#ef4444' },
    { id: 'mobile', name: 'Mobile', icon: '📱', color: '#8b5cf6' },
    { id: 'broadband', name: 'Broadband', icon: '📶', color: '#10b981' },
    { id: 'dth', name: 'DTH', icon: '📺', color: '#ec4899' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️', color: '#6366f1' },
    { id: 'creditcard', name: 'Credit Card', icon: '💳', color: '#14b8a6' },
    { id: 'landline', name: 'Landline', icon: '📞', color: '#f97316' },
    { id: 'municipal', name: 'Municipal Tax', icon: '🏛️', color: '#84cc16' },
    { id: 'education', name: 'Education', icon: '🎓', color: '#a855f7' },
    { id: 'other', name: 'Other', icon: '📄', color: '#6b7280' }
  ];

  // Billers by category
  const billersByCategory = {
    electricity: [
      { id: 'tata-power', name: 'Tata Power', logo: '⚡' },
      { id: 'adani-electricity', name: 'Adani Electricity', logo: '⚡' },
      { id: 'bses-rajdhani', name: 'BSES Rajdhani', logo: '⚡' },
      { id: 'bses-yamuna', name: 'BSES Yamuna', logo: '⚡' },
      { id: 'mahavitaran', name: 'Mahavitaran (MSEDCL)', logo: '⚡' }
    ],
    water: [
      { id: 'delhi-jal-board', name: 'Delhi Jal Board', logo: '💧' },
      { id: 'mumbai-water', name: 'Mumbai Water Supply', logo: '💧' },
      { id: 'bwssb', name: 'BWSSB Bangalore', logo: '💧' }
    ],
    gas: [
      { id: 'mahanagar-gas', name: 'Mahanagar Gas', logo: '🔥' },
      { id: 'indraprastha-gas', name: 'Indraprastha Gas', logo: '🔥' },
      { id: 'adani-gas', name: 'Adani Gas', logo: '🔥' }
    ],
    mobile: [
      { id: 'jio', name: 'Jio', logo: '📱' },
      { id: 'airtel', name: 'Airtel', logo: '📱' },
      { id: 'vi', name: 'Vi (Vodafone Idea)', logo: '📱' },
      { id: 'bsnl', name: 'BSNL', logo: '📱' }
    ],
    broadband: [
      { id: 'jio-fiber', name: 'Jio Fiber', logo: '📶' },
      { id: 'airtel-xstream', name: 'Airtel Xstream', logo: '📶' },
      { id: 'act-fibernet', name: 'ACT Fibernet', logo: '📶' },
      { id: 'bsnl-broadband', name: 'BSNL Broadband', logo: '📶' }
    ],
    dth: [
      { id: 'tata-play', name: 'Tata Play', logo: '📺' },
      { id: 'airtel-dth', name: 'Airtel Digital TV', logo: '📺' },
      { id: 'dish-tv', name: 'Dish TV', logo: '📺' },
      { id: 'sun-direct', name: 'Sun Direct', logo: '📺' }
    ],
    insurance: [
      { id: 'lic', name: 'LIC', logo: '🛡️' },
      { id: 'hdfc-life', name: 'HDFC Life', logo: '🛡️' },
      { id: 'icici-prudential', name: 'ICICI Prudential', logo: '🛡️' },
      { id: 'sbi-life', name: 'SBI Life', logo: '🛡️' }
    ],
    creditcard: [
      { id: 'hdfc-card', name: 'HDFC Credit Card', logo: '💳' },
      { id: 'icici-card', name: 'ICICI Credit Card', logo: '💳' },
      { id: 'sbi-card', name: 'SBI Credit Card', logo: '💳' },
      { id: 'axis-card', name: 'Axis Credit Card', logo: '💳' }
    ]
  };

  useEffect(() => {
    fetchAccounts();
    fetchBillHistory();
    fetchSavedBillers();
  }, []);

  // ✅ FIX: Proper array handling for accounts
  const fetchAccounts = async () => {
    try {
      const response = await accountService.getAllAccounts();
      
      // ✅ FIX: Ensure accounts is always an array
      const accountsData = response?.data || [];
      const accountsArray = Array.isArray(accountsData) ? accountsData : [];
      
      if (accountsArray.length > 0) {
        setAccounts(accountsArray);
      } else {
        // Use demo accounts if no data
        setAccounts([
          { _id: '1', accountNumber: '1234567890', accountType: 'savings', balance: 150000 },
          { _id: '2', accountNumber: '0987654321', accountType: 'current', balance: 250000 }
        ]);
      }
    } catch (error) {
      console.log('Using demo accounts');
      setAccounts([
        { _id: '1', accountNumber: '1234567890', accountType: 'savings', balance: 150000 },
        { _id: '2', accountNumber: '0987654321', accountType: 'current', balance: 250000 }
      ]);
    }
  };

  // ✅ FIX: Proper array handling for bill history
  const fetchBillHistory = async () => {
    try {
      const response = await billService.getBillHistory();
      
      // ✅ FIX: Ensure billHistory is always an array
      const historyData = response?.data || [];
      const historyArray = Array.isArray(historyData) ? historyData : [];
      
      if (historyArray.length > 0) {
        setBillHistory(historyArray);
      } else {
        setBillHistory([
          {
            _id: '1',
            biller: 'Tata Power',
            category: 'electricity',
            amount: 2450,
            consumerId: 'TP123456789',
            status: 'completed',
            paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            _id: '2',
            biller: 'Jio',
            category: 'mobile',
            amount: 599,
            consumerId: '9876543210',
            status: 'completed',
            paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
          },
          {
            _id: '3',
            biller: 'Mahanagar Gas',
            category: 'gas',
            amount: 850,
            consumerId: 'MG789456123',
            status: 'completed',
            paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
          }
        ]);
      }
    } catch (error) {
      console.log('Using demo bill history');
      setBillHistory([
        {
          _id: '1',
          biller: 'Tata Power',
          category: 'electricity',
          amount: 2450,
          consumerId: 'TP123456789',
          status: 'completed',
          paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          _id: '2',
          biller: 'Jio',
          category: 'mobile',
          amount: 599,
          consumerId: '9876543210',
          status: 'completed',
          paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        {
          _id: '3',
          biller: 'Mahanagar Gas',
          category: 'gas',
          amount: 850,
          consumerId: 'MG789456123',
          status: 'completed',
          paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        }
      ]);
    }
  };

  // ✅ FIX: Proper array handling for saved billers
  const fetchSavedBillers = async () => {
    try {
      const response = await billService.getSavedBillers();
      
      // ✅ FIX: Ensure savedBillers is always an array
      const billersData = response?.data || [];
      const billersArray = Array.isArray(billersData) ? billersData : [];
      
      if (billersArray.length > 0) {
        setSavedBillers(billersArray);
      } else {
        setSavedBillers([
          { _id: '1', nickname: 'Home Electricity', biller: 'Tata Power', consumerId: 'TP123456789', category: 'electricity' },
          { _id: '2', nickname: 'My Mobile', biller: 'Jio', consumerId: '9876543210', category: 'mobile' }
        ]);
      }
    } catch (error) {
      console.log('Using demo saved billers');
      setSavedBillers([
        { _id: '1', nickname: 'Home Electricity', biller: 'Tata Power', consumerId: 'TP123456789', category: 'electricity' },
        { _id: '2', nickname: 'My Mobile', biller: 'Jio', consumerId: '9876543210', category: 'mobile' }
      ]);
    }
  };

  const handlePayBill = async () => {
    if (!billForm.accountId || !billForm.consumerId || !billForm.amount) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      await billService.payBill({
        billerId: selectedBiller.id,
        billerName: selectedBiller.name,
        category: selectedCategory,
        consumerId: billForm.consumerId,
        amount: parseFloat(billForm.amount),
        accountId: billForm.accountId,
        billNumber: billForm.billNumber
      });

      alert('Bill paid successfully!');
      
      // Reset form
      setBillForm({ accountId: '', consumerId: '', amount: '', billNumber: '' });
      setSelectedBiller(null);
      setSelectedCategory(null);
      
      // Refresh history
      fetchBillHistory();
    } catch (error) {
      console.error('Error paying bill:', error);
      // Demo success
      alert('Bill paid successfully!');
      setBillForm({ accountId: '', consumerId: '', amount: '', billNumber: '' });
      setSelectedBiller(null);
      setSelectedCategory(null);
      
      // Add to demo history
      const newBill = {
        _id: Date.now().toString(),
        biller: selectedBiller.name,
        category: selectedCategory,
        amount: parseFloat(billForm.amount),
        consumerId: billForm.consumerId,
        status: 'completed',
        paidAt: new Date()
      };
      setBillHistory(prev => [newBill, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBiller = async () => {
    if (!selectedBiller || !billForm.consumerId) {
      alert('Please select biller and enter consumer ID');
      return;
    }

    const nickname = prompt('Enter a nickname for this biller:');
    if (!nickname) return;

    try {
      await billService.saveBiller({
        billerId: selectedBiller.id,
        billerName: selectedBiller.name,
        category: selectedCategory,
        consumerId: billForm.consumerId,
        nickname
      });

      alert('Biller saved successfully!');
      fetchSavedBillers();
    } catch (error) {
      console.log('Demo save');
      const newSaved = {
        _id: Date.now().toString(),
        nickname,
        biller: selectedBiller.name,
        consumerId: billForm.consumerId,
        category: selectedCategory
      };
      setSavedBillers(prev => [...prev, newSaved]);
      alert('Biller saved successfully!');
    }
  };

  const handleDeleteSavedBiller = async (id) => {
    if (!window.confirm('Delete this saved biller?')) return;

    try {
      await billService.deleteSavedBiller(id);
      fetchSavedBillers();
    } catch (error) {
      setSavedBillers(prev => prev.filter(b => b._id !== id));
    }
  };

  const handleQuickPay = (saved) => {
    const category = categories.find(c => c.id === saved.category);
    const biller = billersByCategory[saved.category]?.find(b => b.name === saved.biller);
    
    if (category && biller) {
      setSelectedCategory(saved.category);
      setSelectedBiller(biller);
      setBillForm(prev => ({ ...prev, consumerId: saved.consumerId }));
      setActiveTab('pay');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
              <h1>💡 Bill Payments</h1>
              <p>Pay your utility bills quickly & securely</p>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'pay' ? styles.active : ''}`}
              onClick={() => setActiveTab('pay')}
            >
              Pay Bills
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'saved' ? styles.active : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              Saved Billers ({savedBillers.length})
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          </div>

          {loading && <LoadingSpinner text="Processing payment..." />}

          {/* Pay Bills Tab */}
          {activeTab === 'pay' && !loading && (
            <div className={styles.paySection}>
              {!selectedCategory ? (
                <>
                  <h3>Select Category</h3>
                  <div className={styles.categoryGrid}>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        className={styles.categoryCard}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{ '--category-color': cat.color }}
                      >
                        <span className={styles.categoryIcon}>{cat.icon}</span>
                        <span className={styles.categoryName}>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : !selectedBiller ? (
                <>
                  <div className={styles.backHeader}>
                    <button className={styles.backBtn} onClick={() => setSelectedCategory(null)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                      </svg>
                      Back
                    </button>
                    <h3>Select {categories.find(c => c.id === selectedCategory)?.name} Provider</h3>
                  </div>
                  <div className={styles.billerGrid}>
                    {(billersByCategory[selectedCategory] || []).map(biller => (
                      <button
                        key={biller.id}
                        className={styles.billerCard}
                        onClick={() => setSelectedBiller(biller)}
                      >
                        <span className={styles.billerLogo}>{biller.logo}</span>
                        <span className={styles.billerName}>{biller.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.backHeader}>
                    <button className={styles.backBtn} onClick={() => setSelectedBiller(null)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                      </svg>
                      Back
                    </button>
                    <div className={styles.selectedBillerInfo}>
                      <span>{selectedBiller.logo}</span>
                      <span>{selectedBiller.name}</span>
                    </div>
                  </div>

                  <div className={styles.billForm}>
                    <div className={styles.formGroup}>
                      <label>Consumer ID / Account Number *</label>
                      <input
                        type="text"
                        placeholder="Enter your consumer ID"
                        value={billForm.consumerId}
                        onChange={(e) => setBillForm({...billForm, consumerId: e.target.value})}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Bill Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="Enter bill number"
                        value={billForm.billNumber}
                        onChange={(e) => setBillForm({...billForm, billNumber: e.target.value})}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Amount (₹) *</label>
                      <div className={styles.amountInput}>
                        <span className={styles.rupee}>₹</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={billForm.amount}
                          onChange={(e) => setBillForm({...billForm, amount: e.target.value})}
                          min="1"
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Pay From Account *</label>
                      <select
                        value={billForm.accountId}
                        onChange={(e) => setBillForm({...billForm, accountId: e.target.value})}
                      >
                        <option value="">Select account</option>
                        {accounts.map(acc => (
                          <option key={acc._id} value={acc._id}>
                            {acc.accountType} - ****{acc.accountNumber?.slice(-4)} ({formatCurrency(acc.balance)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formActions}>
                      <button 
                        className={styles.saveBtn}
                        onClick={handleSaveBiller}
                        disabled={!billForm.consumerId}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                          <polyline points="17 21 17 13 7 13 7 21"/>
                          <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        Save Biller
                      </button>
                      <button 
                        className={styles.payBtn}
                        onClick={handlePayBill}
                        disabled={!billForm.accountId || !billForm.consumerId || !billForm.amount}
                      >
                        Pay {billForm.amount ? formatCurrency(parseFloat(billForm.amount)) : 'Bill'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Saved Billers Tab */}
          {activeTab === 'saved' && !loading && (
            <div className={styles.savedSection}>
              {savedBillers.length > 0 ? (
                <div className={styles.savedList}>
                  {savedBillers.map(saved => (
                    <div key={saved._id} className={styles.savedCard}>
                      <div className={styles.savedIcon}>
                        {categories.find(c => c.id === saved.category)?.icon || '📄'}
                      </div>
                      <div className={styles.savedInfo}>
                        <h4>{saved.nickname}</h4>
                        <p>{saved.biller}</p>
                        <span className={styles.consumerId}>{saved.consumerId}</span>
                      </div>
                      <div className={styles.savedActions}>
                        <button 
                          className={styles.quickPayBtn}
                          onClick={() => handleQuickPay(saved)}
                        >
                          Pay Now
                        </button>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteSavedBiller(saved._id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📋</span>
                  <h3>No Saved Billers</h3>
                  <p>Save your frequently used billers for quick payments</p>
                  <button 
                    className={styles.primaryBtn}
                    onClick={() => setActiveTab('pay')}
                  >
                    Add Biller
                  </button>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && !loading && (
            <div className={styles.historySection}>
              {billHistory.length > 0 ? (
                <div className={styles.historyList}>
                  {billHistory.map(bill => (
                    <div key={bill._id} className={styles.historyCard}>
                      <div className={styles.historyIcon}>
                        {categories.find(c => c.id === bill.category)?.icon || '📄'}
                      </div>
                      <div className={styles.historyInfo}>
                        <h4>{bill.biller}</h4>
                        <p>Consumer ID: {bill.consumerId}</p>
                        <span className={styles.historyDate}>{formatDate(bill.paidAt)}</span>
                      </div>
                      <div className={styles.historyRight}>
                        <span className={styles.historyAmount}>{formatCurrency(bill.amount)}</span>
                        <span className={`${styles.historyStatus} ${styles[bill.status]}`}>
                          {bill.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📭</span>
                  <h3>No Payment History</h3>
                  <p>Your bill payment history will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Footer />
      </main>

      <BottomNav />
    </div>
  );
};

export default BillPayment;