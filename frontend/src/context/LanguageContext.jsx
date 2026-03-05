import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

// Translations
const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    accounts: 'Accounts',
    transfer: 'Transfer',
    transactions: 'Transactions',
    cards: 'Cards',
    loans: 'Loans',
    profile: 'Profile',
    settings: 'Settings',
    
    // Common
    welcome: 'Welcome',
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    balance: 'Balance',
    totalBalance: 'Total Balance',
    availableBalance: 'Available Balance',
    
    // Actions
    sendMoney: 'Send Money',
    addMoney: 'Add Money',
    payBills: 'Pay Bills',
    mobileRecharge: 'Mobile Recharge',
    viewAll: 'View All',
    
    // Transactions
    recentTransactions: 'Recent Transactions',
    income: 'Income',
    expenses: 'Expenses',
    savings: 'Savings',
    credited: 'Credited',
    debited: 'Debited',
    
    // Forms
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone Number',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    
    // Messages
    loginSuccess: 'Login successful!',
    loginError: 'Invalid credentials',
    transferSuccess: 'Transfer successful!',
    transferError: 'Transfer failed',
    
    // Settings
    language: 'Language',
    notifications: 'Notifications',
    darkMode: 'Dark Mode',
    security: 'Security',
    help: 'Help & Support',
    
    // Misc
    noData: 'No data available',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success!',
    rupees: '₹'
  },
  
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    accounts: 'खाते',
    transfer: 'ट्रांसफर',
    transactions: 'लेनदेन',
    cards: 'कार्ड्स',
    loans: 'ऋण',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्स',
    
    // Common
    welcome: 'स्वागत है',
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'नमस्कार',
    goodEvening: 'शुभ संध्या',
    balance: 'बैलेंस',
    totalBalance: 'कुल बैलेंस',
    availableBalance: 'उपलब्ध बैलेंस',
    
    // Actions
    sendMoney: 'पैसे भेजें',
    addMoney: 'पैसे जोड़ें',
    payBills: 'बिल भुगतान',
    mobileRecharge: 'मोबाइल रिचार्ज',
    viewAll: 'सभी देखें',
    
    // Transactions
    recentTransactions: 'हाल के लेनदेन',
    income: 'आय',
    expenses: 'खर्च',
    savings: 'बचत',
    credited: 'जमा',
    debited: 'निकासी',
    
    // Forms
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    firstName: 'पहला नाम',
    lastName: 'उपनाम',
    phone: 'फोन नंबर',
    login: 'लॉग इन',
    register: 'पंजीकरण',
    logout: 'लॉग आउट',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    save: 'सेव करें',
    
    // Messages
    loginSuccess: 'लॉगिन सफल!',
    loginError: 'गलत क्रेडेंशियल',
    transferSuccess: 'ट्रांसफर सफल!',
    transferError: 'ट्रांसफर विफल',
    
    // Settings
    language: 'भाषा',
    notifications: 'सूचनाएं',
    darkMode: 'डार्क मोड',
    security: 'सुरक्षा',
    help: 'सहायता',
    
    // Misc
    noData: 'कोई डेटा नहीं',
    loading: 'लोड हो रहा है...',
    error: 'एक त्रुटि हुई',
    success: 'सफल!',
    rupees: '₹'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('bankify_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('bankify_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' }
  ];

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: changeLanguage, 
      t, 
      availableLanguages 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};