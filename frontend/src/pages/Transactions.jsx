import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionAPI, accountAPI } from '../utils/apiService';
import { generateTransactionPDF, exportToCSV } from '../utils/pdfGenerator';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import styles from '../styles/Transactions.module.css';

const Transactions = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    type: 'All',
    category: 'All',
    account: 'All',
    startDate: '',
    endDate: ''
  });

  // Sorting
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalCredit: 0,
    totalDebit: 0,
    totalTransactions: 0
  });

  const categories = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Salary', 'Transfer', 'Other'];
  const types = ['All', 'Credit', 'Debit', 'Transfer'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allTransactions, sortBy, sortOrder]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [txnResponse, accResponse] = await Promise.all([
        transactionAPI.getAll(),
        accountAPI.getAll()
      ]);

      if (txnResponse.data.success) {
        setAllTransactions(txnResponse.data.data);
      }

      if (accResponse.data.success) {
        setAccounts(accResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...allTransactions];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(txn =>
        txn.description?.toLowerCase().includes(searchLower) ||
        txn.category?.toLowerCase().includes(searchLower) ||
        txn.recipient?.name?.toLowerCase().includes(searchLower) ||
        txn.transactionId?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type !== 'All') {
      result = result.filter(txn => txn.type === filters.type);
    }

    // Category filter
    if (filters.category !== 'All') {
      result = result.filter(txn => txn.category === filters.category);
    }

    // Account filter
    if (filters.account !== 'All') {
      result = result.filter(txn => txn.account?._id === filters.account || txn.account === filters.account);
    }

    // Date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(txn => new Date(txn.date) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(txn => new Date(txn.date) <= endDate);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        default:
          comparison = new Date(a.date) - new Date(b.date);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Calculate stats
    const totalCredit = result.filter(t => t.type === 'Credit').reduce((sum, t) => sum + t.amount, 0);
    const totalDebit = result.filter(t => t.type === 'Debit' || t.type === 'Transfer').reduce((sum, t) => sum + t.amount, 0);

    setStats({
      totalCredit,
      totalDebit,
      totalTransactions: result.length
    });

    setFilteredTransactions(result);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'All',
      category: 'All',
      account: 'All',
      startDate: '',
      endDate: ''
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExportPDF = () => {
    generateTransactionPDF(filteredTransactions, user, filters);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredTransactions, 'bankify_transactions');
  };

  const openTransactionDetail = (txn) => {
    setSelectedTransaction(txn);
    setShowDetailModal(true);
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

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryIcon = (category) => {
    const icons = {
      Food: '🍔',
      Transport: '🚗',
      Shopping: '🛍️',
      Bills: '📄',
      Entertainment: '🎬',
      Salary: '💼',
      Transfer: '💸',
      Other: '📌'
    };
    return icons[category] || '📌';
  };

  if (isLoading) {
    return (
      <div className={styles.pageLayout}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading transactions...</p>
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
              <h1>Transactions</h1>
              <p>View and manage your transaction history</p>
            </div>
            <div className={styles.exportButtons}>
              <button className={styles.exportBtn} onClick={handleExportCSV}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                CSV
              </button>
              <button className={styles.exportBtn} onClick={handleExportPDF}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                PDF
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.credit}`}>
              <div className={styles.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5,12 12,5 19,12"/>
                </svg>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Credit</span>
                <span className={styles.statValue}>{formatCurrency(stats.totalCredit)}</span>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.debit}`}>
              <div className={styles.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19,12 12,19 5,12"/>
                </svg>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Debit</span>
                <span className={styles.statValue}>{formatCurrency(stats.totalDebit)}</span>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.total}`}>
              <div className={styles.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Transactions</span>
                <span className={styles.statValue}>{stats.totalTransactions}</span>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className={styles.filtersSection}>
            {/* Search */}
            <div className={styles.searchBox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              {filters.search && (
                <button 
                  className={styles.clearSearchBtn}
                  onClick={() => handleFilterChange('search', '')}
                >
                  ×
                </button>
              )}
            </div>

            {/* Filter Row */}
            <div className={styles.filterRow}>
              {/* Type Filter */}
              <div className={styles.filterGroup}>
                <label>Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className={styles.filterGroup}>
                <label>Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Account Filter */}
              <div className={styles.filterGroup}>
                <label>Account</label>
                <select
                  value={filters.account}
                  onChange={(e) => handleFilterChange('account', e.target.value)}
                >
                  <option value="All">All Accounts</option>
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>
                      {acc.accountType} ••••{acc.accountNumber?.slice(-4)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className={styles.filterGroup}>
                <label>From</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div className={styles.filterGroup}>
                <label>To</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              {/* Clear Filters */}
              <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                Clear All
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.type !== 'All' || filters.category !== 'All' || filters.account !== 'All' || filters.startDate || filters.endDate) && (
            <div className={styles.activeFilters}>
              <span>Active Filters:</span>
              {filters.type !== 'All' && (
                <span className={styles.filterTag}>
                  Type: {filters.type}
                  <button onClick={() => handleFilterChange('type', 'All')}>×</button>
                </span>
              )}
              {filters.category !== 'All' && (
                <span className={styles.filterTag}>
                  Category: {filters.category}
                  <button onClick={() => handleFilterChange('category', 'All')}>×</button>
                </span>
              )}
              {filters.account !== 'All' && (
                <span className={styles.filterTag}>
                  Account: ••••{accounts.find(a => a._id === filters.account)?.accountNumber?.slice(-4)}
                  <button onClick={() => handleFilterChange('account', 'All')}>×</button>
                </span>
              )}
              {filters.startDate && (
                <span className={styles.filterTag}>
                  From: {formatDate(filters.startDate)}
                  <button onClick={() => handleFilterChange('startDate', '')}>×</button>
                </span>
              )}
              {filters.endDate && (
                <span className={styles.filterTag}>
                  To: {formatDate(filters.endDate)}
                  <button onClick={() => handleFilterChange('endDate', '')}>×</button>
                </span>
              )}
            </div>
          )}

          {/* Sort Options */}
          <div className={styles.sortSection}>
            <span>Sort by:</span>
            <button 
              className={`${styles.sortBtn} ${sortBy === 'date' ? styles.active : ''}`}
              onClick={() => handleSort('date')}
            >
              Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={`${styles.sortBtn} ${sortBy === 'amount' ? styles.active : ''}`}
              onClick={() => handleSort('amount')}
            >
              Amount {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={`${styles.sortBtn} ${sortBy === 'category' ? styles.active : ''}`}
              onClick={() => handleSort('category')}
            >
              Category {sortBy === 'category' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>

          {/* Transactions List */}
          <div className={styles.transactionsContainer}>
            {filteredTransactions.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📭</div>
                <h3>No Transactions Found</h3>
                <p>Try adjusting your filters or search criteria</p>
                <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className={styles.transactionsList}>
                  {paginatedTransactions.map((txn) => (
                    <div 
                      key={txn._id} 
                      className={styles.transactionCard}
                      onClick={() => openTransactionDetail(txn)}
                    >
                      <div className={`${styles.txnIcon} ${styles[txn.type.toLowerCase()]}`}>
                        {getCategoryIcon(txn.category)}
                      </div>
                      
                      <div className={styles.txnInfo}>
                        <span className={styles.txnDescription}>
                          {txn.description || txn.recipient?.name || txn.category || 'Transaction'}
                        </span>
                        <span className={styles.txnMeta}>
                          {formatDateTime(txn.date)} • {txn.category}
                        </span>
                        <span className={styles.txnId}>
                          {txn.transactionId || `TXN${txn._id?.slice(-8)}`}
                        </span>
                      </div>

                      <div className={styles.txnAmountSection}>
                        <span className={`${styles.txnAmount} ${styles[txn.type.toLowerCase()]}`}>
                          {txn.type === 'Credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                        </span>
                        <span className={`${styles.txnStatus} ${styles[txn.status?.toLowerCase() || 'completed']}`}>
                          {txn.status || 'Completed'}
                        </span>
                      </div>

                      <div className={styles.txnArrow}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9,18 15,12 9,6"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button 
                      className={styles.pageBtn}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </button>
                    
                    <div className={styles.pageNumbers}>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            className={`${styles.pageNum} ${currentPage === pageNum ? styles.active : ''}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button 
                      className={styles.pageBtn}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}

                <div className={styles.resultsInfo}>
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
              </>
            )}
          </div>
        </div>

        <Footer />
      </main>

      <BottomNav />

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Transaction Details</h2>
              <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={`${styles.txnDetailHeader} ${styles[selectedTransaction.type.toLowerCase()]}`}>
                <div className={styles.txnDetailIcon}>
                  {getCategoryIcon(selectedTransaction.category)}
                </div>
                <div className={styles.txnDetailAmount}>
                  {selectedTransaction.type === 'Credit' ? '+' : '-'}
                  {formatCurrency(selectedTransaction.amount)}
                </div>
                <div className={`${styles.txnDetailStatus} ${styles[selectedTransaction.status?.toLowerCase() || 'completed']}`}>
                  {selectedTransaction.status || 'Completed'}
                </div>
              </div>

              <div className={styles.txnDetailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Transaction ID</span>
                  <span className={styles.detailValue}>
                    {selectedTransaction.transactionId || `TXN${selectedTransaction._id?.slice(-8)}`}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Date & Time</span>
                  <span className={styles.detailValue}>{formatDateTime(selectedTransaction.date)}</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Type</span>
                  <span className={styles.detailValue}>{selectedTransaction.type}</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Category</span>
                  <span className={styles.detailValue}>{selectedTransaction.category || 'Other'}</span>
                </div>

                {selectedTransaction.description && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Description</span>
                    <span className={styles.detailValue}>{selectedTransaction.description}</span>
                  </div>
                )}

                {selectedTransaction.recipient?.name && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Recipient</span>
                    <span className={styles.detailValue}>{selectedTransaction.recipient.name}</span>
                  </div>
                )}

                {selectedTransaction.recipient?.accountNumber && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Account</span>
                    <span className={styles.detailValue}>
                      ••••{selectedTransaction.recipient.accountNumber.slice(-4)}
                    </span>
                  </div>
                )}

                {selectedTransaction.transferType && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Transfer Mode</span>
                    <span className={styles.detailValue}>{selectedTransaction.transferType}</span>
                  </div>
                )}

                {selectedTransaction.transactionFee > 0 && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Fee</span>
                    <span className={styles.detailValue}>₹{selectedTransaction.transactionFee}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setShowDetailModal(false)}>
                Close
              </button>
              <button 
                className={styles.primaryBtn}
                onClick={() => {
                  generateTransactionPDF([selectedTransaction], user, {});
                }}
              >
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;