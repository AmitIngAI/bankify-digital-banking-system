import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import { ThemeProvider } from './components/ThemeProvider';

// Simple inline loading fallback (optional)
const Loading = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    background: '#f8fafc',
    gap: '1rem'
  }}>
    <div style={{ 
      width: '50px', 
      height: '50px', 
      border: '4px solid #e5e7eb', 
      borderTopColor: '#667eea', 
      borderRadius: '50%', 
      animation: 'spin 0.8s linear infinite' 
    }} />
    <p style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>Loading Bankify...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ========================================
// LAZY LOADED PAGES
// ========================================

// Public Pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Protected Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Accounts = lazy(() => import('./pages/Accounts'));
const Transfer = lazy(() => import('./pages/Transfer'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Cards = lazy(() => import('./pages/Cards'));
const Loans = lazy(() => import('./pages/Loans'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Investments = lazy(() => import('./pages/Investments'));

// New Features Added in Updates
const BillPayment = lazy(() => import('./pages/BillPayment'));
const UPIPayment = lazy(() => import('./pages/UPIPayment'));

// ========================================
// PROTECTED ROUTE WRAPPER
// ========================================

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// ========================================
// PUBLIC ROUTE WRAPPER (redirects authenticated users)
// ========================================

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// ========================================
// MAIN APP COMPONENT
// ========================================

function App() {
  const { isLoading } = useAuth();

  // Show loading on initial auth check
  if (isLoading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* ========================================
            PUBLIC ROUTES
            ======================================== */}
        
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* ========================================
            PROTECTED ROUTES
            ======================================== */}
        
        {/* Dashboard - Main Overview */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Accounts - View & Manage Bank Accounts */}
        <Route 
          path="/accounts" 
          element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          } 
        />

        {/* Transfer - Send Money (Internal & External) */}
        <Route 
          path="/transfer" 
          element={
            <ProtectedRoute>
              <Transfer />
            </ProtectedRoute>
          } 
        />

        {/* Transactions - View Transaction History with Filters & PDF Export */}
        <Route 
          path="/transactions" 
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } 
        />

        {/* Cards - Manage Debit/Credit Cards (Block/Unblock/Set Limits) */}
        <Route 
          path="/cards" 
          element={
            <ProtectedRoute>
              <Cards />
            </ProtectedRoute>
          } 
        />

        {/* Bill Payment - Pay Utility Bills (Electricity, Water, Gas, etc.) */}
        <Route 
          path="/bills" 
          element={
            <ProtectedRoute>
              <BillPayment />
            </ProtectedRoute>
          } 
        />

        {/* UPI Payment - Send/Receive Money via UPI */}
        <Route 
          path="/upi" 
          element={
            <ProtectedRoute>
              <UPIPayment />
            </ProtectedRoute>
          } 
        />

        {/* Loans - Apply for Loans, View Active Loans, EMI Calculator */}
        <Route 
          path="/loans" 
          element={
            <ProtectedRoute>
              <Loans />
            </ProtectedRoute>
          } 
        />

        {/* Investments - Mutual Funds, Fixed Deposits, Recurring Deposits */}
        <Route 
          path="/investments" 
          element={
            <ProtectedRoute>
              <Investments />
            </ProtectedRoute>
          } 
        />

        {/* Analytics - Financial Analytics & Budget Planner */}
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } 
        />

        {/* Profile - User Profile & KYC Details */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Settings - App Settings, Security, Preferences */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />

        {/* ========================================
            FALLBACK ROUTES
            ======================================== */}
        
        {/* 404 - Not Found (Redirect to Dashboard or Landing) */}
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </Suspense>
  );
}

export default App;