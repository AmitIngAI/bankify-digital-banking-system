import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { cardService, accountService } from '../utils/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from '../styles/Pages.module.css';

const Cards = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [newLimit, setNewLimit] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  // ✅ NEW: Add Apply Card Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    cardType: 'debit',
    accountId: '',
    cardNetwork: 'Visa'
  });
  const [accounts, setAccounts] = useState([]);

  // Fetch cards on component mount
  useEffect(() => {
    fetchCards();
    fetchAccounts();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await cardService.getAllCards();
      
      const cardsData = response?.data || [];
      const cardsArray = Array.isArray(cardsData) ? cardsData : [];
      
      setCards(cardsArray);
      
      if (cardsArray.length > 0) {
        fetchCardTransactions(cardsArray[0]._id);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch Accounts
  const fetchAccounts = async () => {
    try {
      const response = await accountService.getAllAccounts();
      const accountsData = response?.data || [];
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (error) {
      console.log('Demo accounts');
      setAccounts([
        { _id: '1', accountNumber: '1234567890', accountType: 'savings', balance: 150000 }
      ]);
    }
  };

  const fetchCardTransactions = async (cardId) => {
    try {
      const response = await cardService.getCardTransactions(cardId);
      const txnData = response?.data || [];
      setRecentTransactions(Array.isArray(txnData) ? txnData : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setRecentTransactions([]);
    }
  };

  // ✅ NEW: Apply for Card Handler
  const handleApplyCard = async () => {
    if (!applyForm.accountId) {
      alert('Please select an account');
      return;
    }

    try {
      setLoading(true);
      await cardService.createCard({
        accountId: applyForm.accountId,
        cardType: applyForm.cardType,
        cardNetwork: applyForm.cardNetwork
      });

      alert('Card application submitted successfully!');
      setShowApplyModal(false);
      setApplyForm({ cardType: 'debit', accountId: '', cardNetwork: 'Visa' });
      fetchCards();
    } catch (error) {
      console.error('Error applying for card:', error);
      alert('Failed to apply for card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Block/Unblock Card
  const handleBlockCard = async () => {
    try {
      const currentCard = cards[activeCard];
      const newStatus = currentCard.status === 'active' ? 'blocked' : 'active';
      
      await cardService.updateCardStatus(currentCard._id, {
        status: newStatus,
        reason: blockReason || 'User requested'
      });

      const updatedCards = [...cards];
      updatedCards[activeCard] = { ...currentCard, status: newStatus };
      setCards(updatedCards);

      setShowBlockModal(false);
      setBlockReason('');
      
      alert(`Card ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully!`);
    } catch (error) {
      console.error('Error updating card status:', error);
      alert('Failed to update card status');
    }
  };

  // Set Card Limit
  const handleSetLimit = async () => {
    try {
      const currentCard = cards[activeCard];
      
      if (!newLimit || isNaN(newLimit) || parseFloat(newLimit) <= 0) {
        alert('Please enter a valid limit amount');
        return;
      }

      await cardService.updateCardLimit(currentCard._id, {
        transactionLimit: parseFloat(newLimit)
      });

      const updatedCards = [...cards];
      updatedCards[activeCard] = { 
        ...currentCard, 
        transactionLimit: parseFloat(newLimit) 
      };
      setCards(updatedCards);

      setShowLimitModal(false);
      setNewLimit('');
      
      alert('Card limit updated successfully!');
    } catch (error) {
      console.error('Error updating card limit:', error);
      alert('Failed to update card limit');
    }
  };

  const formatCardNumber = (number, show) => {
    if (!number) return '•••• •••• •••• ••••';
    if (show) {
      return number.replace(/(\d{4})/g, '$1 ').trim();
    }
    return `•••• •••• •••• ${number.slice(-4)}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (cards.length === 0) {
    return (
      <div className={styles.pageLayout}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className={styles.mainContent}>
          <div className={styles.emptyState}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <h2>No Cards Found</h2>
            <p>You don't have any cards yet. Apply for a card to get started!</p>
            {/* ✅ FIXED: Added onClick handler */}
            <button 
              className={styles.primaryBtn}
              onClick={() => setShowApplyModal(true)}
            >
              Apply for Card
            </button>
          </div>
        </main>

        <BottomNav />
        
        {/* ✅ NEW: Apply Card Modal */}
        {showApplyModal && (
          <div className={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Apply for New Card</h3>
                <button onClick={() => setShowApplyModal(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Card Type</label>
                  <select
                    value={applyForm.cardType}
                    onChange={(e) => setApplyForm({...applyForm, cardType: e.target.value})}
                  >
                    <option value="debit">Debit Card</option>
                    <option value="credit">Credit Card</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Select Account</label>
                  <select
                    value={applyForm.accountId}
                    onChange={(e) => setApplyForm({...applyForm, accountId: e.target.value})}
                  >
                    <option value="">Choose account...</option>
                    {accounts.map(acc => (
                      <option key={acc._id} value={acc._id}>
                        {acc.accountType} - ****{acc.accountNumber?.slice(-4)} ({formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Card Network</label>
                  <select
                    value={applyForm.cardNetwork}
                    onChange={(e) => setApplyForm({...applyForm, cardNetwork: e.target.value})}
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="RuPay">RuPay</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.secondaryBtn} onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
                <button 
                  className={styles.primaryBtn} 
                  onClick={handleApplyCard}
                  disabled={!applyForm.accountId}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentCard = cards[activeCard];

  return (
    <div className={styles.pageLayout}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={styles.mainContent}>
        <div className={styles.pageContainer}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              <h1>My Cards</h1>
              <p>Manage your debit and credit cards</p>
            </div>
            {/* ✅ FIXED: Added onClick handler */}
            <button 
              className={styles.primaryBtn}
              onClick={() => setShowApplyModal(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Apply for New Card
            </button>
          </div>

          {/* Card Display */}
          <div className={styles.cardShowcase}>
            <div className={styles.cardCarousel}>
              {cards.map((card, index) => {
                const cardGradients = {
                  debit: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  credit: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  prepaid: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                };

                return (
                  <div 
                    key={card._id}
                    className={`${styles.creditCard} ${activeCard === index ? styles.active : ''} ${card.status === 'blocked' ? styles.blockedCard : ''}`}
                    style={{ background: cardGradients[card.cardType] || cardGradients.debit }}
                    onClick={() => {
                      setActiveCard(index);
                      fetchCardTransactions(card._id);
                    }}
                  >
                    {card.status === 'blocked' && (
                      <div className={styles.cardBlockedOverlay}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <span>BLOCKED</span>
                      </div>
                    )}

                    <div className={styles.cardTop}>
                      <div className={styles.cardChip}>
                        <svg viewBox="0 0 50 40" fill="none">
                          <rect x="5" y="5" width="40" height="30" rx="3" fill="#FFD700"/>
                          <rect x="10" y="10" width="10" height="20" rx="1" fill="#DAA520"/>
                          <rect x="22" y="10" width="10" height="20" rx="1" fill="#DAA520"/>
                        </svg>
                      </div>
                      <div className={styles.cardContactless}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                          <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                          <line x1="12" y1="20" x2="12.01" y2="20"/>
                        </svg>
                      </div>
                    </div>
                    
                    <div className={styles.cardNumber}>
                      {formatCardNumber(card.cardNumber, showCardNumber && activeCard === index)}
                    </div>
                    
                    <div className={styles.cardBottom}>
                      <div className={styles.cardHolder}>
                        <span>Card Holder</span>
                        <p>{card.cardHolderName || `${user?.firstName} ${user?.lastName}`}</p>
                      </div>
                      <div className={styles.cardExpiry}>
                        <span>Expires</span>
                        <p>{new Date(card.expiryDate).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace(/\//g, '/')}</p>
                      </div>
                      <div className={styles.cardBrand}>
                        {card.cardNumber?.startsWith('4') ? (
                          <svg viewBox="0 0 50 20" fill="white">
                            <text x="0" y="15" fontSize="14" fontWeight="bold" fontStyle="italic">VISA</text>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 50 30" fill="none">
                            <circle cx="18" cy="15" r="12" fill="#EB001B" fillOpacity="0.9"/>
                            <circle cx="32" cy="15" r="12" fill="#F79E1B" fillOpacity="0.9"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Card Dots */}
            <div className={styles.cardDots}>
              {cards.map((_, index) => (
                <button 
                  key={index}
                  className={`${styles.cardDot} ${activeCard === index ? styles.active : ''}`}
                  onClick={() => setActiveCard(index)}
                />
              ))}
            </div>
          </div>

          {/* Card Actions */}
          <div className={styles.cardActions}>
            <button 
              className={styles.cardActionBtn}
              onClick={() => setShowCardNumber(!showCardNumber)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {showCardNumber ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </>
                )}
              </svg>
              {showCardNumber ? 'Hide' : 'Show'} Details
            </button>

            <button 
              className={`${styles.cardActionBtn} ${currentCard.status === 'blocked' ? styles.unblockBtn : styles.blockBtn}`}
              onClick={() => setShowBlockModal(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {currentCard.status === 'blocked' ? (
                  <>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                  </>
                ) : (
                  <>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </>
                )}
              </svg>
              {currentCard.status === 'blocked' ? 'Unblock' : 'Block'} Card
            </button>

            <button 
              className={styles.cardActionBtn}
              onClick={() => setShowLimitModal(true)}
              disabled={currentCard.status === 'blocked'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              Set Limit
            </button>

            <button className={styles.cardActionBtn}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Settings
            </button>
          </div>

          {/* Card Details */}
          <div className={styles.cardDetailsSection}>
            <div className={styles.cardInfoCard}>
              <h3>Card Information</h3>
              <div className={styles.cardInfoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Card Type</span>
                  <span className={styles.infoValue}>
                    {currentCard.cardType?.charAt(0).toUpperCase() + currentCard.cardType?.slice(1)} Card
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Card Name</span>
                  <span className={styles.infoValue}>{currentCard.cardName || 'Premium Card'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Status</span>
                  <span className={`${styles.statusBadge} ${currentCard.status === 'active' ? styles.active : styles.blocked}`}>
                    {currentCard.status?.toUpperCase()}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Transaction Limit</span>
                  <span className={styles.infoValue}>
                    {formatCurrency(currentCard.transactionLimit || 100000)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Daily Limit</span>
                  <span className={styles.infoValue}>
                    {formatCurrency(currentCard.dailyLimit || 50000)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>CVV</span>
                  <span className={styles.infoValue}>
                    {showCardNumber ? currentCard.cvv : '•••'}
                  </span>
                </div>
              </div>

              {currentCard.cardType === 'credit' && (
                <div className={styles.creditUsageBar}>
                  <div className={styles.usageHeader}>
                    <span>Credit Usage</span>
                    <span>{Math.round((currentCard.usedLimit / currentCard.creditLimit) * 100)}%</span>
                  </div>
                  <div className={styles.usageTrack}>
                    <div 
                      className={styles.usageFill} 
                      style={{ width: `${(currentCard.usedLimit / currentCard.creditLimit) * 100}%` }}
                    />
                  </div>
                  <div className={styles.creditLimitInfo}>
                    <span>Used: {formatCurrency(currentCard.usedLimit || 0)}</span>
                    <span>Available: {formatCurrency((currentCard.creditLimit || 0) - (currentCard.usedLimit || 0))}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Card Transactions */}
            <div className={styles.cardTransactions}>
              <div className={styles.sectionHeader}>
                <h3>Recent Card Transactions</h3>
                <button className={styles.viewAllBtn}>View All</button>
              </div>
              <div className={styles.txnList}>
                {recentTransactions.length > 0 ? (
                  recentTransactions.slice(0, 5).map((txn, i) => (
                    <div key={i} className={styles.txnItem}>
                      <div className={styles.txnMerchant}>
                        <div className={styles.merchantIcon}>
                          {txn.description?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <span className={styles.merchantName}>{txn.description || 'Transaction'}</span>
                          <span className={styles.txnDate}>
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={styles.txnRight}>
                        <span className={styles.txnCategory}>{txn.category || 'Purchase'}</span>
                        <span className={styles.txnAmount}>
                          {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.amount)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noTransactions}>
                    <p>No recent transactions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>

      <BottomNav />

      {/* Set Limit Modal */}
      {showLimitModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLimitModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Set Transaction Limit</h3>
              <button onClick={() => setShowLimitModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Current Limit</label>
                <input 
                  type="text" 
                  value={formatCurrency(currentCard.transactionLimit || 100000)} 
                  disabled 
                />
              </div>
              <div className={styles.formGroup}>
                <label>New Transaction Limit (₹)</label>
                <input 
                  type="number" 
                  placeholder="Enter new limit"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  min="1000"
                  max="1000000"
                />
                <small>Minimum: ₹1,000 | Maximum: ₹10,00,000</small>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setShowLimitModal(false)}>
                Cancel
              </button>
              <button className={styles.primaryBtn} onClick={handleSetLimit}>
                Update Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block/Unblock Modal */}
      {showBlockModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBlockModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{currentCard.status === 'blocked' ? 'Unblock' : 'Block'} Card</h3>
              <button onClick={() => setShowBlockModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                {currentCard.status === 'blocked' 
                  ? 'Are you sure you want to unblock this card? The card will be active immediately.'
                  : 'Are you sure you want to block this card? You won\'t be able to make any transactions.'}
              </p>
              {currentCard.status === 'active' && (
                <div className={styles.formGroup}>
                  <label>Reason for blocking (optional)</label>
                  <select 
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  >
                    <option value="">Select reason</option>
                    <option value="lost">Card Lost</option>
                    <option value="stolen">Card Stolen</option>
                    <option value="suspicious">Suspicious Activity</option>
                    <option value="temporary">Temporary Block</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setShowBlockModal(false)}>
                Cancel
              </button>
              <button 
                className={currentCard.status === 'blocked' ? styles.successBtn : styles.dangerBtn} 
                onClick={handleBlockCard}
              >
                {currentCard.status === 'blocked' ? 'Unblock Card' : 'Block Card'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Apply Card Modal */}
      {showApplyModal && (
        <div className={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Apply for New Card</h3>
              <button onClick={() => setShowApplyModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Card Type</label>
                <select
                  value={applyForm.cardType}
                  onChange={(e) => setApplyForm({...applyForm, cardType: e.target.value})}
                >
                  <option value="debit">Debit Card</option>
                  <option value="credit">Credit Card</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Select Account</label>
                <select
                  value={applyForm.accountId}
                  onChange={(e) => setApplyForm({...applyForm, accountId: e.target.value})}
                >
                  <option value="">Choose account...</option>
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>
                      {acc.accountType} - ****{acc.accountNumber?.slice(-4)} ({formatCurrency(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Card Network</label>
                <select
                  value={applyForm.cardNetwork}
                  onChange={(e) => setApplyForm({...applyForm, cardNetwork: e.target.value})}
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="RuPay">RuPay</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setShowApplyModal(false)}>
                Cancel
              </button>
              <button 
                className={styles.primaryBtn} 
                onClick={handleApplyCard}
                disabled={!applyForm.accountId}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cards;