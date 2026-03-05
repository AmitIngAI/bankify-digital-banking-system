import React, { useState, useEffect } from 'react';
import styles from '../styles/Components.module.css';

const CurrencyConverter = ({ onClose }) => {
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rates, setRates] = useState({});

  // Mock exchange rates (In production, use real API)
  const exchangeRates = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    AED: 0.044,
    SGD: 0.016,
    AUD: 0.018,
    CAD: 0.016,
    JPY: 1.79,
    CNY: 0.087
  };

  const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' }
  ];

  const convert = () => {
    setIsLoading(true);
    setTimeout(() => {
      const fromRate = exchangeRates[fromCurrency];
      const toRate = exchangeRates[toCurrency];
      const converted = (parseFloat(amount) / fromRate) * toRate;
      setResult({
        from: parseFloat(amount),
        to: converted,
        rate: toRate / fromRate
      });
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      convert();
    }
  }, [amount, fromCurrency, toCurrency]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrency = (code) => currencies.find(c => c.code === code);

  const formatNumber = (num, currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className={styles.converterOverlay}>
      <div className={styles.converterModal}>
        <div className={styles.converterHeader}>
          <h2>💱 Currency Converter</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.converterBody}>
          {/* Amount Input */}
          <div className={styles.amountSection}>
            <label>Amount</label>
            <div className={styles.amountInput}>
              <span className={styles.currencySymbol}>
                {getCurrency(fromCurrency)?.symbol}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          </div>

          {/* Currency Selectors */}
          <div className={styles.currencySelectors}>
            <div className={styles.currencySelect}>
              <label>From</label>
              <select 
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>

            <button className={styles.swapBtn} onClick={swapCurrencies}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 16V4M7 4L3 8M7 4L11 8"/>
                <path d="M17 8V20M17 20L21 16M17 20L13 16"/>
              </svg>
            </button>

            <div className={styles.currencySelect}>
              <label>To</label>
              <select 
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className={styles.resultSection}>
              <div className={styles.resultMain}>
                <span className={styles.resultFrom}>
                  {getCurrency(fromCurrency)?.flag} {formatNumber(result.from, fromCurrency)}
                </span>
                <span className={styles.resultEquals}>=</span>
                <span className={styles.resultTo}>
                  {getCurrency(toCurrency)?.flag} {formatNumber(result.to, toCurrency)}
                </span>
              </div>
              <div className={styles.resultRate}>
                1 {fromCurrency} = {result.rate.toFixed(4)} {toCurrency}
              </div>
            </div>
          )}

          {/* Quick Amounts */}
          <div className={styles.quickAmounts}>
            <span>Quick convert:</span>
            <div className={styles.quickBtns}>
              {[1000, 5000, 10000, 50000, 100000].map(amt => (
                <button 
                  key={amt} 
                  onClick={() => setAmount(amt.toString())}
                  className={amount === amt.toString() ? styles.active : ''}
                >
                  ₹{(amt/1000)}K
                </button>
              ))}
            </div>
          </div>

          {/* Popular Rates */}
          <div className={styles.popularRates}>
            <h4>Today's Popular Rates</h4>
            <div className={styles.ratesList}>
              {['USD', 'EUR', 'GBP', 'AED'].map(curr => (
                <div key={curr} className={styles.rateItem}>
                  <span>{getCurrency(curr)?.flag} {curr}</span>
                  <span>₹{(1/exchangeRates[curr]).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.converterFooter}>
          <p>💡 Rates are indicative and updated every hour</p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;