const RecurringDeposit = require('../models/RecurringDeposit');
const Account = require('../models/Account');
const Notification = require('../models/Notification');

// RD Interest Rates
const getInterestRate = (tenure) => {
  if (tenure <= 12) return 6.5;
  else if (tenure <= 24) return 7.0;
  else if (tenure <= 36) return 7.25;
  else return 7.5;
};

// Calculate RD maturity
const calculateRDMaturity = (monthlyAmount, rate, tenure) => {
  const r = rate / (12 * 100); // Monthly rate
  const n = tenure;
  // Formula: M * [(1+r)^n - 1] * (1+r) / r
  const maturityAmount = monthlyAmount * ((Math.pow(1 + r, n) - 1) * (1 + r)) / r;
  return Math.round(maturityAmount);
};

// @desc    Calculate RD maturity
// @route   POST /api/rd/calculate
// @access  Private
const calculateRD = async (req, res) => {
  try {
    const { monthlyAmount, tenure } = req.body;

    const interestRate = getInterestRate(tenure);
    const maturityAmount = calculateRDMaturity(monthlyAmount, interestRate, tenure);
    const totalDeposit = monthlyAmount * tenure;
    const interestEarned = maturityAmount - totalDeposit;

    res.json({ 
      success: true, 
      data: {
        monthlyAmount,
        tenure,
        interestRate,
        totalDeposit,
        maturityAmount,
        interestEarned,
        maturityDate: new Date(Date.now() + tenure * 30 * 24 * 60 * 60 * 1000)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create RD
// @route   POST /api/rd
// @access  Private
const createRD = async (req, res) => {
  try {
    const { accountId, monthlyAmount, tenure, nominee, autoDebit } = req.body;

    // Check account
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Check balance for first installment
    if (account.balance < monthlyAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance for first installment' });
    }

    // Calculate RD details
    const interestRate = getInterestRate(tenure);
    const maturityAmount = calculateRDMaturity(monthlyAmount, interestRate, tenure);
    const maturityDate = new Date(Date.now() + tenure * 30 * 24 * 60 * 60 * 1000);
    const nextInstallmentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Deduct first installment
    account.balance -= monthlyAmount;
    await account.save();

    // Create RD
    const rd = await RecurringDeposit.create({
      user: req.user._id,
      account: accountId,
      monthlyAmount,
      interestRate,
      tenure,
      totalDeposited: monthlyAmount,
      maturityAmount,
      installmentsPaid: 1,
      nextInstallmentDate,
      maturityDate,
      autoDebit,
      nominee
    });

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: 'Recurring Deposit Created',
      message: `RD of ₹${monthlyAmount}/month created. First installment debited.`,
      type: 'Transaction',
      icon: '🏦'
    });

    res.status(201).json({ 
      success: true, 
      data: rd,
      newBalance: account.balance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all RDs
// @route   GET /api/rd
// @access  Private
const getRDs = async (req, res) => {
  try {
    const rds = await RecurringDeposit.find({ user: req.user._id })
      .populate('account', 'accountNumber accountType')
      .sort({ startDate: -1 });

    res.json({ success: true, data: rds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Pay RD installment
// @route   POST /api/rd/:id/pay
// @access  Private
const payInstallment = async (req, res) => {
  try {
    const rd = await RecurringDeposit.findById(req.params.id).populate('account');

    if (!rd) {
      return res.status(404).json({ success: false, message: 'RD not found' });
    }

    if (rd.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (rd.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'RD is not active' });
    }

    if (rd.installmentsPaid >= rd.tenure) {
      return res.status(400).json({ success: false, message: 'All installments already paid' });
    }

    // Check balance
    if (rd.account.balance < rd.monthlyAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Deduct installment
    rd.account.balance -= rd.monthlyAmount;
    await rd.account.save();

    // Update RD
    rd.installmentsPaid += 1;
    rd.totalDeposited += rd.monthlyAmount;
    rd.nextInstallmentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (rd.installmentsPaid >= rd.tenure) {
      rd.status = 'Matured';
    }

    await rd.save();

    res.json({ 
      success: true, 
      data: rd,
      newBalance: rd.account.balance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  calculateRD,
  createRD,
  getRDs,
  payInstallment
};