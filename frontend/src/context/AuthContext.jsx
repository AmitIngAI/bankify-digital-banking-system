import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/apiService';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const generateAccountNumber = () => {
  return '1234' + Math.floor(Math.random() * 90000000 + 10000000).toString();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('bankify_users');
      const storedUser = localStorage.getItem('bankify_current_user');
      const storedAccounts = localStorage.getItem('bankify_accounts');
      const storedTransactions = localStorage.getItem('bankify_transactions');
      const storedToken = localStorage.getItem('token');

      if (storedUsers) setUsers(JSON.parse(storedUsers));
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      if (storedToken) setToken(storedToken);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (users.length) localStorage.setItem('bankify_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (accounts.length) localStorage.setItem('bankify_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (transactions.length) localStorage.setItem('bankify_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const checkEmailExists = useCallback((email) => {
    return users.some(u => u.email.toLowerCase() === email.toLowerCase());
  }, [users]);

  // ✅ API BASED REGISTER
  const register = useCallback(async (userData) => {
    try {
      const response = await authAPI.register(userData);

      if (response.data.success) {
        const { token, ...userDataFromAPI } = response.data.data;

        setToken(token);
        setUser(userDataFromAPI);

        localStorage.setItem('token', token);
        localStorage.setItem('bankify_current_user', JSON.stringify(userDataFromAPI));

        return userDataFromAPI;
      }
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }, []);

  // ✅ API BASED LOGIN
  const login = useCallback(async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });

      if (response.data.success) {
        const { token, ...userDataFromAPI } = response.data.data;

        setToken(token);
        setUser(userDataFromAPI);

        localStorage.setItem('token', token);
        localStorage.setItem('bankify_current_user', JSON.stringify(userDataFromAPI));

        return userDataFromAPI;
      }
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bankify_current_user');
    localStorage.removeItem('token');
  }, []);

  const getUserAccounts = useCallback(() => {
    if (!user) return [];
    return accounts.filter(acc => acc.userId === user.id);
  }, [user, accounts]);

  const getUserTransactions = useCallback(() => {
    if (!user) return [];
    return transactions
      .filter(txn => txn.userId === user.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [user, transactions]);

  const transferMoney = useCallback((fromAccountId, toAccountNumber, amount, description) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const fromAccount = accounts.find(acc => acc.id === fromAccountId);
        if (!fromAccount) { reject({ message: 'Account not found' }); return; }
        if (fromAccount.balance < amount) { reject({ message: 'Insufficient balance' }); return; }

        const updatedAccounts = accounts.map(acc => {
          if (acc.id === fromAccountId) return { ...acc, balance: acc.balance - amount };
          if (acc.accountNumber === toAccountNumber) return { ...acc, balance: acc.balance + amount };
          return acc;
        });

        const txn = {
          id: `TXN${Date.now()}`,
          userId: user.id,
          accountId: fromAccountId,
          type: 'debit',
          category: 'transfer',
          amount,
          description: description || `Transfer to ${toAccountNumber}`,
          status: 'completed',
          date: new Date().toISOString(),
          balance: fromAccount.balance - amount
        };

        setAccounts(updatedAccounts);
        setTransactions(prev => [txn, ...prev]);
        resolve(txn);
      }, 1500);
    });
  }, [accounts, user]);

  const updateProfile = useCallback(async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);

      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('bankify_current_user', JSON.stringify(response.data.data));
        return response.data.data;
      }
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Update failed'
      };
    }
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    checkEmailExists,
    register,
    login,
    logout,
    transferMoney,
    updateProfile,
    accounts: getUserAccounts(),
    transactions: getUserTransactions()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};