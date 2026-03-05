// Demo Accounts
export const demoAccounts = [
  {
    id: 1,
    type: 'SAVINGS',
    number: '1234567890123456',
    balance: 125000,
    available: 124500,
    ifsc: 'BNKF0001234',
    branch: 'Mumbai Main Branch',
    status: 'ACTIVE',
  },
  {
    id: 2,
    type: 'CURRENT',
    number: '1234567890123457',
    balance: 450000,
    available: 450000,
    ifsc: 'BNKF0001234',
    branch: 'Mumbai Main Branch',
    status: 'ACTIVE',
  },
  {
    id: 3,
    type: 'SALARY',
    number: '1234567890123458',
    balance: 89000,
    available: 89000,
    ifsc: 'BNKF0001235',
    branch: 'Tech Park Branch',
    status: 'ACTIVE',
  },
];

// Demo Transactions
export const demoTransactions = [
  { id: 1, date: '2024-02-10', desc: 'Salary Credit - TCS', amount: 75000, type: 'CREDIT', category: 'SALARY', ref: 'SAL240210001', status: 'SUCCESS' },
  { id: 2, date: '2024-02-09', desc: 'Electricity Bill - MSEB', amount: 2500, type: 'DEBIT', category: 'BILLS', ref: 'BILL240209001', status: 'SUCCESS' },
  { id: 3, date: '2024-02-08', desc: 'Amazon Shopping', amount: 5600, type: 'DEBIT', category: 'SHOPPING', ref: 'SHP240208001', status: 'SUCCESS' },
  { id: 4, date: '2024-02-07', desc: 'FD Interest Credit', amount: 3500, type: 'CREDIT', category: 'INTEREST', ref: 'INT240207001', status: 'SUCCESS' },
  { id: 5, date: '2024-02-06', desc: 'Fund Transfer to Priya', amount: 15000, type: 'DEBIT', category: 'TRANSFER', ref: 'TRF240206001', status: 'SUCCESS' },
  { id: 6, date: '2024-02-05', desc: 'Mobile Recharge - Jio', amount: 599, type: 'DEBIT', category: 'RECHARGE', ref: 'RCH240205001', status: 'SUCCESS' },
  { id: 7, date: '2024-02-04', desc: 'Refund - Flipkart', amount: 1200, type: 'CREDIT', category: 'REFUND', ref: 'REF240204001', status: 'SUCCESS' },
  { id: 8, date: '2024-02-03', desc: 'EMI - Car Loan', amount: 18500, type: 'DEBIT', category: 'EMI', ref: 'EMI240203001', status: 'SUCCESS' },
  { id: 9, date: '2024-02-02', desc: 'Swiggy Order', amount: 450, type: 'DEBIT', category: 'FOOD', ref: 'SWG240202001', status: 'SUCCESS' },
  { id: 10, date: '2024-02-01', desc: 'Cashback Credited', amount: 150, type: 'CREDIT', category: 'CASHBACK', ref: 'CSH240201001', status: 'SUCCESS' },
];

// Demo Fixed Deposits
export const demoFDs = [
  { id: 1, fdNo: 'FD2024010001', principal: 100000, rate: 7.5, tenure: 12, maturity: 107500, startDate: '2024-01-01', maturityDate: '2025-01-01', status: 'ACTIVE' },
  { id: 2, fdNo: 'FD2023060001', principal: 250000, rate: 7.25, tenure: 24, maturity: 286250, startDate: '2023-06-15', maturityDate: '2025-06-15', status: 'ACTIVE' },
  { id: 3, fdNo: 'FD2023010001', principal: 50000, rate: 6.5, tenure: 12, maturity: 53250, startDate: '2023-01-01', maturityDate: '2024-01-01', status: 'MATURED' },
];

// Demo Loans
export const demoLoans = [
  { id: 1, loanNo: 'HL2024010001', type: 'HOME', label: 'Home Loan', amount: 5000000, emi: 48251, rate: 8.5, tenure: 240, disbursed: '2024-01-15', outstanding: 4850000, paidEmis: 6, totalEmis: 240, nextDue: '2024-03-05', status: 'ACTIVE' },
  { id: 2, loanNo: 'PL2023060001', type: 'PERSONAL', label: 'Personal Loan', amount: 500000, emi: 11122, rate: 12.0, tenure: 60, disbursed: '2023-06-01', outstanding: 350000, paidEmis: 14, totalEmis: 60, nextDue: '2024-03-01', status: 'ACTIVE' },
];

// Loan Types
export const loanTypes = [
  { type: 'HOME', label: 'Home Loan', rate: 8.5, maxAmount: 10000000, maxTenure: 360, icon: 'Home' },
  { type: 'CAR', label: 'Car Loan', rate: 9.5, maxAmount: 2500000, maxTenure: 84, icon: 'DirectionsCar' },
  { type: 'PERSONAL', label: 'Personal Loan', rate: 12.0, maxAmount: 1000000, maxTenure: 60, icon: 'Person' },
  { type: 'EDUCATION', label: 'Education Loan', rate: 10.5, maxAmount: 5000000, maxTenure: 180, icon: 'School' },
  { type: 'BUSINESS', label: 'Business Loan', rate: 11.0, maxAmount: 5000000, maxTenure: 120, icon: 'Business' },
];

// Chart Data
export const chartData = [
  { month: 'Jan', income: 75000, expense: 45000 },
  { month: 'Feb', income: 80000, expense: 52000 },
  { month: 'Mar', income: 75000, expense: 48000 },
  { month: 'Apr', income: 90000, expense: 55000 },
  { month: 'May', income: 85000, expense: 50000 },
  { month: 'Jun', income: 95000, expense: 58000 },
];

// Expense Data
export const expenseData = [
  { name: 'Food', value: 15000, color: '#FF6384' },
  { name: 'Shopping', value: 12000, color: '#36A2EB' },
  { name: 'Bills', value: 8000, color: '#FFCE56' },
  { name: 'Transport', value: 5000, color: '#4BC0C0' },
  { name: 'Entertainment', value: 6000, color: '#9966FF' },
  { name: 'Others', value: 4000, color: '#FF9F40' },
];

// Admin - Fraud Alerts
export const fraudAlerts = [
  { id: 1, user: 'Amit Kumar', email: 'amit@email.com', type: 'UNUSUAL_TRANSACTION', amount: 500000, desc: 'Large transaction from new device', severity: 'HIGH', status: 'PENDING', time: '2 hours ago' },
  { id: 2, user: 'Vikram Reddy', email: 'vikram@email.com', type: 'MULTIPLE_FAILED_LOGIN', amount: null, desc: '10 failed login attempts', severity: 'MEDIUM', status: 'INVESTIGATING', time: '4 hours ago' },
  { id: 3, user: 'Sanjay Gupta', email: 'sanjay@email.com', type: 'VELOCITY_BREACH', amount: 150000, desc: '5 transactions in 2 minutes', severity: 'HIGH', status: 'PENDING', time: '5 hours ago' },
  { id: 4, user: 'Meera Joshi', email: 'meera@email.com', type: 'GEO_ANOMALY', amount: 25000, desc: 'Transaction from different country', severity: 'MEDIUM', status: 'RESOLVED', time: '1 day ago' },
];

// Admin - Users
export const adminUsers = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', phone: '9876543210', status: 'ACTIVE', kyc: 'VERIFIED', accountType: 'SAVINGS', balance: 125000, joinDate: '2024-01-15', risk: 'LOW' },
  { id: 2, name: 'Priya Patel', email: 'priya@email.com', phone: '9876543211', status: 'ACTIVE', kyc: 'VERIFIED', accountType: 'CURRENT', balance: 450000, joinDate: '2024-01-10', risk: 'LOW' },
  { id: 3, name: 'Amit Kumar', email: 'amit@email.com', phone: '9876543212', status: 'SUSPENDED', kyc: 'PENDING', accountType: 'SAVINGS', balance: 25000, joinDate: '2024-02-01', risk: 'HIGH' },
  { id: 4, name: 'Neha Singh', email: 'neha@email.com', phone: '9876543213', status: 'ACTIVE', kyc: 'VERIFIED', accountType: 'SALARY', balance: 89000, joinDate: '2024-01-20', risk: 'MEDIUM' },
];