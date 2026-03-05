const FixedDeposit = require('../models/FixedDeposit');
const Account = require('../models/Account');
const Notification = require('../models/Notification');

// FD Interest Rates (as per tenure)
const getInterestRate = (tenure, isSeniorCitizen = false) => {
  let rate;
  if (tenure <= 6) rate = 5.5;
  else if (tenure <= 12) rate = 6.5;
  else if (tenure <= 24) rate = 7.0;
  else if (tenure <= 36) rate = 7.25;
  else rate = 7.5;

  return isSeniorCitizen ? rate + 0.5 : rate;
};

// Calculate maturity amount
const calculateMaturity = (principal, rate, tenure) => {
  const n = 4; // Quarterly compounding
  const t = tenure / 12; // Convert months to years
  const maturityAmount = principal * Math.pow((1 + rate / (100 * n)), n * t);
  return Math.round(maturityAmount * 100) / 100;
};

// @desc    Get FD rates
// @route   GET /api/fd/rates
// @access  Private
const getRates = async (req, res) => {
  try {
    const rates = [
      { tenure: '7 Days - 6 Months', rate: '5.50%', seniorRate: '6.00%' },
      { tenure: '6 Months - 1 Year', rate: '6.50%', seniorRate: '7.00%' },
      { tenure: '1 Year - 2 Years', rate: '7.00%', seniorRate: '7.50%' },
      { tenure: '2 Years - 3 Years', rate: '7.25%', seniorRate: '7.75%' },
      { tenure: '3 Years - 5 Years', rate: '7.50%', seniorRate: '8.00%' }
    ];

    res.json({ success: true, data: rates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Calculate FD maturity
// @route   POST /api/fd/calculate
// @access  Private
const calculateFD = async (req, res) => {
  try {
    const { amount, tenure, isSeniorCitizen } = req.body;

    const interestRate = getInterestRate(tenure, isSeniorCitizen);
    const maturityAmount = calculateMaturity(amount, interestRate, tenure);
    const interestEarned = maturityAmount - amount;

    res.json({ 
      success: true, 
      data: {
        principalAmount: amount,
        tenure,
        interestRate,
        maturityAmount: Math.round(maturityAmount),
        interestEarned: Math.round(interestEarned),
        maturityDate: new Date(Date.now() + tenure * 30 * 24 * 60 * 60 * 1000)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create FD
// @route   POST /api/fd
// @access  Private
const createFD = async (req, res) => {
  try {
    const { accountId, amount, tenure, interestPayout, nominee, autoRenew, isSeniorCitizen } = req.body;

    // Check account
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Check balance
    if (account.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Calculate FD details
    const interestRate = getInterestRate(tenure, isSeniorCitizen);
    const maturityAmount = calculateMaturity(amount, interestRate, tenure);
    const interestEarned = maturityAmount - amount;
    const maturityDate = new Date(Date.now() + tenure * 30 * 24 * 60 * 60 * 1000);

    // Deduct from account
    account.balance -= amount;
    await account.save();

    // Create FD
    const fd = await FixedDeposit.create({
      user: req.user._id,
      account: accountId,
      principalAmount: amount,
      interestRate,
      tenure,
      maturityAmount: Math.round(maturityAmount),
      interestEarned: Math.round(interestEarned),
      interestPayout,
      maturityDate,
      nominee,
      autoRenew
    });

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: 'Fixed Deposit Created',
      message: `FD of ₹${amount} created successfully. Maturity: ₹${Math.round(maturityAmount)}`,
      type: 'Transaction',
      icon: '🏦'
    });

    res.status(201).json({ 
      success: true, 
      data: fd,
      newBalance: account.balance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all FDs
// @route   GET /api/fd
// @access  Private
const getFDs = async (req, res) => {
  try {
    const fds = await FixedDeposit.find({ user: req.user._id })
      .populate('account', 'accountNumber accountType')
      .sort({ startDate: -1 });

    // ✅ FIX: Always return array format
    res.json({ 
      success: true, 
      data: Array.isArray(fds) ? fds : [] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message,
      data: [] // ✅ Return empty array on error
    });
  }
};

// @desc    Get FD by ID
// @route   GET /api/fd/:id
// @access  Private
const getFD = async (req, res) => {
  try {
    const fd = await FixedDeposit.findById(req.params.id)
      .populate('account', 'accountNumber accountType');

    if (!fd) {
      return res.status(404).json({ success: false, message: 'FD not found' });
    }

    if (fd.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: fd });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Premature withdrawal
// @route   POST /api/fd/:id/withdraw
// @access  Private
const withdrawFD = async (req, res) => {
  try {
    const fd = await FixedDeposit.findById(req.params.id).populate('account');

    if (!fd) {
      return res.status(404).json({ success: false, message: 'FD not found' });
    }

    if (fd.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (fd.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'FD is not active' });
    }

    // Calculate premature withdrawal amount (1% penalty)
    const daysCompleted = Math.floor((Date.now() - fd.startDate) / (1000 * 60 * 60 * 24));
    const monthsCompleted = Math.floor(daysCompleted / 30);
    
    const penaltyRate = 1; // 1% penalty
    const adjustedRate = fd.interestRate - penaltyRate;
    const withdrawalAmount = calculateMaturity(fd.principalAmount, adjustedRate, monthsCompleted);

    // Credit to account
    fd.account.balance += Math.round(withdrawalAmount);
    await fd.account.save();

    // Update FD status
    fd.status = 'Premature Withdrawal';
    await fd.save();

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: 'FD Withdrawn',
      message: `FD ${fd.fdNumber} withdrawn. ₹${Math.round(withdrawalAmount)} credited to your account`,
      type: 'Transaction',
      icon: '💰'
    });

    res.json({ 
      success: true, 
      data: {
        withdrawalAmount: Math.round(withdrawalAmount),
        penalty: fd.principalAmount - Math.round(withdrawalAmount),
        newBalance: fd.account.balance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRates,
  calculateFD,
  createFD,
  getFDs,
  getFD,
  withdrawFD
};