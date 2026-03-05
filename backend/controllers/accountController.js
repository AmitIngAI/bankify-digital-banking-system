const Account = require('../models/Account');

// @desc    Get all user accounts
// @route   GET /api/accounts
// @access  Private
const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    
    // ✅ FIX: Always return array format
    res.json({ 
      success: true, 
      data: Array.isArray(accounts) ? accounts : [] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message,
      data: [] // ✅ Return empty array on error
    });
  }
};

// @desc    Get single account
// @route   GET /api/accounts/:id
// @access  Private
const getAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Check if account belongs to user
    if (account.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new account
// @route   POST /api/accounts
// @access  Private
const createAccount = async (req, res) => {
  try {
    const { accountType } = req.body;

    const accountNumber = 'ACC' + Date.now() + Math.floor(Math.random() * 1000);

    const account = await Account.create({
      user: req.user._id,
      accountNumber,
      accountType,
      balance: 0
    });

    res.status(201).json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAccounts,
  getAccount,
  createAccount
};