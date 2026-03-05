import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH SERVICES ====================
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyOTP: (otpData) => api.post('/auth/verify-otp', otpData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// ==================== ACCOUNT SERVICES ====================
export const accountService = {
  getAllAccounts: () => api.get('/accounts'),
  getAccountById: (id) => api.get(`/accounts/${id}`),
  createAccount: (accountData) => api.post('/accounts', accountData),
  updateAccount: (id, accountData) => api.put(`/accounts/${id}`, accountData),
  deleteAccount: (id) => api.delete(`/accounts/${id}`),
  getBalance: (id) => api.get(`/accounts/${id}/balance`),
};

// ==================== CARD SERVICES ====================
export const cardService = {
  getAllCards: () => api.get('/cards'),
  getCardById: (id) => api.get(`/cards/${id}`),
  createCard: (cardData) => api.post('/cards', cardData),
  updateCardStatus: (id, statusData) => api.put(`/cards/${id}/status`, statusData),
  updateCardLimit: (id, limitData) => api.put(`/cards/${id}/limit`, limitData),
  blockCard: (id, reason) => api.put(`/cards/${id}/block`, { reason }),
  unblockCard: (id) => api.put(`/cards/${id}/unblock`),
  getCardTransactions: (id) => api.get(`/cards/${id}/transactions`),
  setDailyLimit: (id, limit) => api.put(`/cards/${id}/daily-limit`, { dailyLimit: limit }),
  setTransactionLimit: (id, limit) => api.put(`/cards/${id}/transaction-limit`, { transactionLimit: limit }),
};

// ==================== TRANSACTION SERVICES ====================
export const transactionService = {
  getAllTransactions: () => api.get('/transactions'),
  getTransactionById: (id) => api.get(`/transactions/${id}`),
  createTransaction: (transactionData) => api.post('/transactions', transactionData),
  getTransactionsByAccount: (accountId) => api.get(`/transactions/account/${accountId}`),
  getTransactionsByDateRange: (startDate, endDate) => api.get('/transactions/date-range', {
    params: { startDate, endDate }
  }),
  filterTransactions: (filters) => api.post('/transactions/filter', filters),
  downloadStatement: (accountId, format, dateRange) => api.post('/transactions/statement', 
    { accountId, format, dateRange },
    { responseType: 'blob' }
  ),
};

// ==================== TRANSFER SERVICES ====================
export const transferService = {
  internalTransfer: (transferData) => api.post('/transactions/transfer', transferData),
  externalTransfer: (transferData) => api.post('/transactions/external-transfer', transferData),
  getBeneficiaries: () => api.get('/beneficiaries'),
  addBeneficiary: (beneficiaryData) => api.post('/beneficiaries', beneficiaryData),
  deleteBeneficiary: (id) => api.delete(`/beneficiaries/${id}`),
};

// ==================== UPI SERVICES ====================
export const upiService = {
  getAllUPIs: () => api.get('/upi'),
  createUPI: (upiData) => api.post('/upi', upiData),
  verifyUPI: (upiId) => api.get(`/upi/verify/${upiId}`),
  sendMoney: (paymentData) => api.post('/upi/send', paymentData),
  requestMoney: (requestData) => api.post('/upi/request', requestData),
  getUPITransactions: () => api.get('/upi/transactions'),
  scanQR: (qrData) => api.post('/upi/scan-qr', qrData),
  generateQR: (amount, note) => api.post('/upi/generate-qr', { amount, note }),
};

// ==================== BILL PAYMENT SERVICES ====================
export const billService = {
  getAllBillers: () => api.get('/bills/billers'),
  getBillerById: (id) => api.get(`/bills/billers/${id}`),
  payBill: (billData) => api.post('/bills/pay', billData),
  getBillHistory: () => api.get('/bills/history'),
  getSavedBillers: () => api.get('/bills/saved'),
  saveBiller: (billerData) => api.post('/bills/saved', billerData),
  deleteSavedBiller: (id) => api.delete(`/bills/saved/${id}`),
  schedulePayment: (scheduleData) => api.post('/bills/schedule', scheduleData),
  getScheduledPayments: () => api.get('/bills/scheduled'),
  cancelScheduledPayment: (id) => api.delete(`/bills/scheduled/${id}`),
};

// ==================== INVESTMENT SERVICES ====================
export const investmentService = {
  getAllInvestments: () => api.get('/investments'),
  getInvestmentById: (id) => api.get(`/investments/${id}`),
  createInvestment: (investmentData) => api.post('/investments', investmentData),
  updateInvestment: (id, investmentData) => api.put(`/investments/${id}`, investmentData),
  deleteInvestment: (id) => api.delete(`/investments/${id}`),
  getPortfolioSummary: () => api.get('/investments/portfolio'),
};

// ==================== FIXED DEPOSIT SERVICES ====================
export const fdService = {
  getAllFDs: () => api.get('/fd'),
  getFDById: (id) => api.get(`/fd/${id}`),
  createFD: (fdData) => api.post('/fd', fdData),
  breakFD: (id) => api.post(`/fd/${id}/break`),
  getFDCalculator: (amount, tenure, rate) => api.post('/fd/calculate', { amount, tenure, rate }),
  renewFD: (id) => api.post(`/fd/${id}/renew`),
};

// ==================== RECURRING DEPOSIT SERVICES ====================
export const rdService = {
  getAllRDs: () => api.get('/rd'),
  getRDById: (id) => api.get(`/rd/${id}`),
  createRD: (rdData) => api.post('/rd', rdData),
  payInstallment: (id, amount) => api.post(`/rd/${id}/pay`, { amount }),
  breakRD: (id) => api.post(`/rd/${id}/break`),
  getRDCalculator: (monthlyAmount, tenure, rate) => api.post('/rd/calculate', { monthlyAmount, tenure, rate }),
};

// ==================== LOAN SERVICES ====================
export const loanService = {
  getAllLoans: () => api.get('/loans'),
  getLoanById: (id) => api.get(`/loans/${id}`),
  applyLoan: (loanData) => api.post('/loans/apply', loanData),
  payEMI: (loanId, amount) => api.post(`/loans/${loanId}/pay-emi`, { amount }),
  getEMISchedule: (loanId) => api.get(`/loans/${loanId}/emi-schedule`),
  calculateEMI: (principal, rate, tenure) => api.post('/loans/calculate-emi', { principal, rate, tenure }),
  foreclose: (loanId) => api.post(`/loans/${loanId}/foreclose`),
};

// ==================== BUDGET SERVICES ====================
export const budgetService = {
  getAllBudgets: () => api.get('/budget'),
  getBudgetById: (id) => api.get(`/budget/${id}`),
  createBudget: (budgetData) => api.post('/budget', budgetData),
  updateBudget: (id, budgetData) => api.put(`/budget/${id}`, budgetData),
  deleteBudget: (id) => api.delete(`/budget/${id}`),
  getBudgetAnalysis: () => api.get('/budget/analysis'),
  getCategorySpending: (category, month) => api.get('/budget/category-spending', {
    params: { category, month }
  }),
};

// ==================== NOTIFICATION SERVICES ====================
export const notificationService = {
  getAllNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// ==================== ANALYTICS SERVICES ====================
export const analyticsService = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getSpendingAnalysis: (period) => api.get('/analytics/spending', { params: { period } }),
  getIncomeVsExpense: (months) => api.get('/analytics/income-expense', { params: { months } }),
  getCategoryBreakdown: () => api.get('/analytics/category-breakdown'),
  getMonthlyTrends: () => api.get('/analytics/monthly-trends'),
  exportData: (format, dateRange) => api.post('/analytics/export', 
    { format, dateRange },
    { responseType: 'blob' }
  ),
};

export default api;