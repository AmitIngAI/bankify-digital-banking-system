import api from './api';

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Account APIs
export const accountAPI = {
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
};

// Transaction APIs
export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  getByAccount: (accountId) => api.get(`/transactions/account/${accountId}`),
  create: (data) => api.post('/transactions', data),
  transfer: (data) => api.post('/transactions/transfer', data),
};

// Beneficiary APIs
export const beneficiaryAPI = {
  getAll: () => api.get('/beneficiaries'),
  getRecent: () => api.get('/beneficiaries/recent'),
  add: (data) => api.post('/beneficiaries', data),
  delete: (id) => api.delete(`/beneficiaries/${id}`),
  updateLastUsed: (id) => api.put(`/beneficiaries/${id}/use`),
};

// Card APIs
export const cardAPI = {
  getAll: () => api.get('/cards'),
  getById: (id) => api.get(`/cards/${id}`),
  create: (data) => api.post('/cards', data),
  updateStatus: (id, data) => api.put(`/cards/${id}/status`, data),
  updateLimits: (id, limits) => api.put(`/cards/${id}/limits`, { limits }),
  updateSettings: (id, settings) => api.put(`/cards/${id}/settings`, { settings }),
  setPin: (id, pin) => api.put(`/cards/${id}/pin`, { pin }),
};

// Loan APIs
export const loanAPI = {
  getAll: () => api.get('/loans'),
  apply: (data) => api.post('/loans', data),
  updateStatus: (id, status) => api.put(`/loans/${id}/status`, { status }),
};

// Investment APIs
export const investmentAPI = {
  getAll: () => api.get('/investments'),
  create: (data) => api.post('/investments', data),
  update: (id, data) => api.put(`/investments/${id}`, data),
};

// Bill Payment APIs (NEW)
export const billAPI = {
  getProviders: () => api.get('/bills/providers'),
  getProvidersByCategory: (category) => api.get(`/bills/providers/${encodeURIComponent(category)}`),
  fetchBill: (data) => api.post('/bills/fetch', data),
  payBill: (data) => api.post('/bills/pay', data),
  getHistory: () => api.get('/bills/history'),
  getSavedBillers: () => api.get('/bills/saved'),
  deleteSavedBiller: (id) => api.delete(`/bills/saved/${id}`),
};

// UPI APIs (NEW)
export const upiAPI = {
  getAll: () => api.get('/upi'),
  create: (data) => api.post('/upi', data),
  sendMoney: (data) => api.post('/upi/send', data),
  verify: (upiId) => api.post('/upi/verify', { upiId }),
  getTransactions: () => api.get('/upi/transactions'),
  setPin: (id, data) => api.put(`/upi/${id}/pin`, data),
  updateStatus: (id, isActive) => api.put(`/upi/${id}/status`, { isActive }),
};

// Fixed Deposit APIs (NEW)
export const fdAPI = {
  getRates: () => api.get('/fd/rates'),
  calculate: (data) => api.post('/fd/calculate', data),
  getAll: () => api.get('/fd'),
  getById: (id) => api.get(`/fd/${id}`),
  create: (data) => api.post('/fd', data),
  withdraw: (id) => api.post(`/fd/${id}/withdraw`),
};

// Recurring Deposit APIs (NEW)
export const rdAPI = {
  calculate: (data) => api.post('/rd/calculate', data),
  getAll: () => api.get('/rd'),
  create: (data) => api.post('/rd', data),
  payInstallment: (id) => api.post(`/rd/${id}/pay`),
};

// Budget APIs (NEW)
export const budgetAPI = {
  getAll: () => api.get('/budget'),
  create: (data) => api.post('/budget', data),
  delete: (id) => api.delete(`/budget/${id}`),
  getAnalytics: (period) => api.get(`/budget/analytics?period=${period || 'month'}`),
};

// Notification APIs (NEW)
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications'),
};