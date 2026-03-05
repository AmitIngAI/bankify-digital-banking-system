const BillPayment = require('../models/BillPayment');
const SavedBiller = require('../models/SavedBiller');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// Bill Providers Data
const billProviders = {
  'Mobile Recharge': [
    { name: 'Jio', icon: '📱' },
    { name: 'Airtel', icon: '📱' },
    { name: 'Vi (Vodafone Idea)', icon: '📱' },
    { name: 'BSNL', icon: '📱' }
  ],
  'DTH': [
    { name: 'Tata Play', icon: '📺' },
    { name: 'Airtel Digital TV', icon: '📺' },
    { name: 'Dish TV', icon: '📺' },
    { name: 'Sun Direct', icon: '📺' },
    { name: 'Videocon D2H', icon: '📺' }
  ],
  'Electricity': [
    { name: 'Adani Electricity', icon: '⚡' },
    { name: 'Tata Power', icon: '⚡' },
    { name: 'BSES Rajdhani', icon: '⚡' },
    { name: 'BSES Yamuna', icon: '⚡' },
    { name: 'MSEDCL', icon: '⚡' },
    { name: 'UPPCL', icon: '⚡' }
  ],
  'Gas': [
    { name: 'Indraprastha Gas', icon: '🔥' },
    { name: 'Mahanagar Gas', icon: '🔥' },
    { name: 'Adani Gas', icon: '🔥' },
    { name: 'Gujarat Gas', icon: '🔥' }
  ],
  'Water': [
    { name: 'Delhi Jal Board', icon: '💧' },
    { name: 'MCGM Water', icon: '💧' },
    { name: 'Bangalore Water', icon: '💧' }
  ],
  'Broadband': [
    { name: 'Jio Fiber', icon: '🌐' },
    { name: 'Airtel Xstream', icon: '🌐' },
    { name: 'ACT Fibernet', icon: '🌐' },
    { name: 'BSNL Fiber', icon: '🌐' },
    { name: 'Hathway', icon: '🌐' }
  ],
  'Landline': [
    { name: 'BSNL', icon: '📞' },
    { name: 'Airtel Landline', icon: '📞' },
    { name: 'MTNL', icon: '📞' }
  ],
  'Insurance': [
    { name: 'LIC', icon: '🛡️' },
    { name: 'HDFC Life', icon: '🛡️' },
    { name: 'ICICI Prudential', icon: '🛡️' },
    { name: 'SBI Life', icon: '🛡️' },
    { name: 'Max Life', icon: '🛡️' }
  ],
  'Credit Card': [
    { name: 'HDFC Credit Card', icon: '💳' },
    { name: 'ICICI Credit Card', icon: '💳' },
    { name: 'SBI Credit Card', icon: '💳' },
    { name: 'Axis Credit Card', icon: '💳' },
    { name: 'Kotak Credit Card', icon: '💳' }
  ],
  'Fastag': [
    { name: 'Paytm Fastag', icon: '🚗' },
    { name: 'ICICI Fastag', icon: '🚗' },
    { name: 'HDFC Fastag', icon: '🚗' },
    { name: 'Axis Fastag', icon: '🚗' },
    { name: 'SBI Fastag', icon: '🚗' }
  ]
};

// @desc    Get bill categories and providers
// @route   GET /api/bills/providers
// @access  Private
const getProviders = async (req, res) => {
  try {
    res.json({ success: true, data: billProviders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get providers by category
// @route   GET /api/bills/providers/:category
// @access  Private
const getProvidersByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const providers = billProviders[category] || [];
    res.json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch bill details (simulate)
// @route   POST /api/bills/fetch
// @access  Private
const fetchBill = async (req, res) => {
  try {
    const { billType, provider, consumerId } = req.body;

    // Simulate bill fetch - In real app, this would call provider API
    const billDetails = {
      consumerId,
      consumerName: 'User ' + consumerId.slice(-4),
      billNumber: 'BILL' + Date.now(),
      billDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      amount: Math.floor(Math.random() * 2000) + 500,
      provider,
      billType
    };

    res.json({ success: true, data: billDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Pay bill
// @route   POST /api/bills/pay
// @access  Private
const payBill = async (req, res) => {
  try {
    const { 
      accountId, 
      billType, 
      provider, 
      consumerId, 
      consumerName,
      amount, 
      billNumber,
      dueDate,
      saveBiller 
    } = req.body;

    // Get account
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Check balance
    const convenienceFee = billType === 'Mobile Recharge' ? 0 : 3;
    const totalAmount = amount + convenienceFee;

    if (account.balance < totalAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Deduct amount
    account.balance -= totalAmount;
    await account.save();

    // Create bill payment record
    const billPayment = await BillPayment.create({
      user: req.user._id,
      account: accountId,
      billType,
      provider,
      consumerId,
      consumerName,
      amount,
      convenienceFee,
      billNumber,
      dueDate,
      status: 'Success'
    });

    // Create transaction record
    await Transaction.create({
      user: req.user._id,
      account: accountId,
      type: 'Debit',
      amount: totalAmount,
      category: 'Bills',
      description: `${billType} - ${provider}`,
      status: 'Completed'
    });

    // Save biller if requested
    if (saveBiller) {
      const existingBiller = await SavedBiller.findOne({
        user: req.user._id,
        billType,
        consumerId
      });

      if (!existingBiller) {
        await SavedBiller.create({
          user: req.user._id,
          billType,
          provider,
          consumerId,
          consumerName,
          nickname: consumerName
        });
      }
    }

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: 'Bill Payment Successful',
      message: `₹${amount} paid for ${billType} - ${provider}`,
      type: 'Transaction',
      icon: '✅'
    });

    res.status(201).json({ 
      success: true, 
      data: billPayment,
      newBalance: account.balance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get bill payment history
// @route   GET /api/bills/history
// @access  Private
const getBillHistory = async (req, res) => {
  try {
    const bills = await BillPayment.find({ user: req.user._id })
      .sort({ paidAt: -1 })
      .limit(50);

    res.json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get saved billers
// @route   GET /api/bills/saved
// @access  Private
const getSavedBillers = async (req, res) => {
  try {
    const billers = await SavedBiller.find({ user: req.user._id })
      .sort({ addedAt: -1 });

    res.json({ success: true, data: billers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete saved biller
// @route   DELETE /api/bills/saved/:id
// @access  Private
const deleteSavedBiller = async (req, res) => {
  try {
    const biller = await SavedBiller.findById(req.params.id);

    if (!biller) {
      return res.status(404).json({ success: false, message: 'Biller not found' });
    }

    if (biller.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await biller.deleteOne();

    res.json({ success: true, message: 'Biller deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProviders,
  getProvidersByCategory,
  fetchBill,
  payBill,
  getBillHistory,
  getSavedBillers,
  deleteSavedBiller
};