const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Beneficiary = require('../models/Beneficiary');

// Calculate transfer fee
const calculateTransferFee = (transferType, amount) => {
  switch (transferType) {
    case 'IMPS':
      return amount > 1000 ? 5 : 0;
    case 'NEFT':
      return 0; // Free
    case 'RTGS':
      return amount >= 200000 ? 25 : 0;
    default:
      return 0;
  }
};

// Validate transfer limits
const validateTransferLimits = (transferType, amount) => {
  const limits = {
    IMPS: { min: 1, max: 200000 },
    NEFT: { min: 1, max: 10000000 },
    RTGS: { min: 200000, max: 10000000 }
  };

  const limit = limits[transferType];
  if (!limit) return { valid: true };

  if (amount < limit.min) {
    return { 
      valid: false, 
      message: `Minimum amount for ${transferType} is ₹${limit.min.toLocaleString()}` 
    };
  }

  if (amount > limit.max) {
    return { 
      valid: false, 
      message: `Maximum amount for ${transferType} is ₹${limit.max.toLocaleString()}` 
    };
  }

  return { valid: true };
};

// @desc    Get all user transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('account', 'accountNumber accountType')
      .sort({ date: -1 });

    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transactions by account
// @route   GET /api/transactions/account/:accountId
// @access  Private
const getTransactionsByAccount = async (req, res) => {
  try {
    const transactions = await Transaction.find({ 
      user: req.user._id,
      account: req.params.accountId 
    }).sort({ date: -1 });

    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create transfer transaction
// @route   POST /api/transactions/transfer
// @access  Private
const createTransfer = async (req, res) => {
  try {
    const { 
      fromAccountId, 
      toAccountNumber, 
      beneficiaryName,
      ifscCode,
      bankName,
      amount, 
      transferType,
      remarks,
      saveBeneficiary
    } = req.body;

    // Validate transfer limits
    const limitCheck = validateTransferLimits(transferType, amount);
    if (!limitCheck.valid) {
      return res.status(400).json({ success: false, message: limitCheck.message });
    }

    // Get sender account
    const fromAccount = await Account.findById(fromAccountId);
    if (!fromAccount) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (fromAccount.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Calculate fee
    const transferFee = calculateTransferFee(transferType, amount);
    const totalAmount = amount + transferFee;

    // Check balance
    if (fromAccount.balance < totalAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance (including transfer fee)' 
      });
    }

    // Deduct from sender
    fromAccount.balance -= totalAmount;
    await fromAccount.save();

    // Create transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      account: fromAccountId,
      type: 'Transfer',
      amount,
      category: 'Transfer',
      description: remarks || `Transfer to ${beneficiaryName}`,
      recipient: {
        name: beneficiaryName,
        accountNumber: toAccountNumber,
        ifscCode: ifscCode.toUpperCase(),
        bankName: bankName || ''
      },
      transferType,
      transactionFee: transferFee,
      status: 'Completed'
    });

    // Save beneficiary if requested
    if (saveBeneficiary) {
      const existingBeneficiary = await Beneficiary.findOne({
        user: req.user._id,
        accountNumber: toAccountNumber
      });

      if (!existingBeneficiary) {
        await Beneficiary.create({
          user: req.user._id,
          beneficiaryName,
          accountNumber: toAccountNumber,
          ifscCode: ifscCode.toUpperCase(),
          bankName: bankName || '',
          lastUsed: Date.now()
        });
      } else {
        existingBeneficiary.lastUsed = Date.now();
        await existingBeneficiary.save();
      }
    }

    res.status(201).json({ 
      success: true, 
      data: transaction,
      newBalance: fromAccount.balance 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { accountId, type, amount, category, description, recipient } = req.body;

    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Update account balance
    if (type === 'Credit') {
      account.balance += amount;
    } else if (type === 'Debit') {
      if (account.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance' });
      }
      account.balance -= amount;
    }

    await account.save();

    const transaction = await Transaction.create({
      user: req.user._id,
      account: accountId,
      type,
      amount,
      category,
      description,
      recipient,
      status: 'Completed'
    });

    res.status(201).json({ 
      success: true, 
      data: transaction,
      newBalance: account.balance 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTransactions,
  getTransactionsByAccount,
  createTransfer,
  createTransaction
};