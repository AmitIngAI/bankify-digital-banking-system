const UPI = require('../models/UPI');
const UPITransaction = require('../models/UPITransaction');
const Account = require('../models/Account');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// @desc    Create UPI ID
// @route   POST /api/upi/create
// @access  Private
const createUPI = async (req, res) => {
  try {
    const { accountId, upiId, pin } = req.body;

    // Check if account exists
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Generate UPI ID if not provided
    const finalUpiId = upiId || `${req.user.phone}@bankify`;

    // Check if UPI ID already exists
    const existingUPI = await UPI.findOne({ upiId: finalUpiId.toLowerCase() });
    if (existingUPI) {
      return res.status(400).json({ success: false, message: 'UPI ID already exists' });
    }

    // Hash PIN
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    // Check if user has default UPI
    const hasDefaultUPI = await UPI.findOne({ user: req.user._id, isDefault: true });

    // Create UPI
    const upi = await UPI.create({
      user: req.user._id,
      account: accountId,
      upiId: finalUpiId.toLowerCase(),
      pin: hashedPin,
      isDefault: !hasDefaultUPI
    });

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: 'UPI ID Created',
      message: `Your UPI ID ${finalUpiId} has been created successfully`,
      type: 'General',
      icon: '✅'
    });

    res.status(201).json({ 
      success: true, 
      data: {
        _id: upi._id,
        upiId: upi.upiId,
        isDefault: upi.isDefault,
        isActive: upi.isActive,
        dailyLimit: upi.dailyLimit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's UPI IDs
// @route   GET /api/upi
// @access  Private
const getUPIs = async (req, res) => {
  try {
    const upis = await UPI.find({ user: req.user._id })
      .populate('account', 'accountNumber accountType balance')
      .select('-pin');

    // ✅ FIX: Always return array
    res.json({ 
      success: true, 
      data: Array.isArray(upis) ? upis : [] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message,
      data: [] // ✅ Return empty array on error
    });
  }
};

// @desc    Send money via UPI
// @route   POST /api/upi/send
// @access  Private
const sendMoney = async (req, res) => {
  try {
    const { fromUpiId, toUpiId, amount, pin, remarks } = req.body;

    // Get sender's UPI (if fromUpiId not provided, use default)
    let senderUPI;
    if (fromUpiId) {
      senderUPI = await UPI.findOne({ 
        user: req.user._id, 
        upiId: fromUpiId.toLowerCase() 
      }).populate('account');
    } else {
      senderUPI = await UPI.findOne({ 
        user: req.user._id, 
        isDefault: true 
      }).populate('account');
    }

    if (!senderUPI) {
      return res.status(404).json({ success: false, message: 'UPI ID not found' });
    }

    if (!senderUPI.isActive) {
      return res.status(400).json({ success: false, message: 'UPI ID is not active' });
    }

    // Verify PIN
    const isPinValid = await bcrypt.compare(pin, senderUPI.pin);
    if (!isPinValid) {
      return res.status(400).json({ success: false, message: 'Invalid UPI PIN' });
    }

    // Check limits
    if (amount > senderUPI.perTransactionLimit) {
      return res.status(400).json({ 
        success: false, 
        message: `Amount exceeds per transaction limit of ₹${senderUPI.perTransactionLimit}` 
      });
    }

    // Check balance
    if (senderUPI.account.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Deduct from sender
    senderUPI.account.balance -= amount;
    await senderUPI.account.save();

    // Check if receiver UPI exists in our system
    const receiverUPI = await UPI.findOne({ upiId: toUpiId.toLowerCase() }).populate('account');
    let receiverName = 'User';
    
    if (receiverUPI) {
      // Credit to receiver
      receiverUPI.account.balance += amount;
      await receiverUPI.account.save();
      receiverName = receiverUPI.account.accountType + ' User';

      // Create notification for receiver
      await Notification.create({
        user: receiverUPI.user,
        title: 'Money Received',
        message: `₹${amount} received from ${senderUPI.upiId}`,
        type: 'Transaction',
        icon: '💰'
      });
    }

    // Create UPI transaction
    const transaction = await UPITransaction.create({
      user: req.user._id,
      upi: senderUPI._id,
      type: 'Send',
      amount,
      senderUpiId: senderUPI.upiId,
      receiverUpiId: toUpiId.toLowerCase(),
      receiverName,
      remarks,
      status: 'Success'
    });

    // Create notification for sender
    await Notification.create({
      user: req.user._id,
      title: 'Money Sent',
      message: `₹${amount} sent to ${toUpiId}`,
      type: 'Transaction',
      icon: '💸'
    });

    res.status(201).json({ 
      success: true, 
      data: transaction,
      newBalance: senderUPI.account.balance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check UPI ID validity
// @route   POST /api/upi/verify
// @access  Private
const verifyUPI = async (req, res) => {
  try {
    const { upiId } = req.body;

    if (!upiId || !upiId.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid UPI ID format' 
      });
    }

    const upi = await UPI.findOne({ upiId: upiId.toLowerCase() })
      .populate('account', 'accountType');

    if (upi) {
      res.json({ 
        success: true, 
        data: {
          valid: true,
          name: upi.account.accountType + ' User',
          upiId: upi.upiId
        }
      });
    } else {
      // Simulate external UPI verification
      const names = ['Rahul Kumar', 'Priya Sharma', 'Amit Singh', 'External User'];
      res.json({ 
        success: true, 
        data: {
          valid: true,
          name: names[Math.floor(Math.random() * names.length)],
          upiId: upiId.toLowerCase()
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get UPI transaction history
// @route   GET /api/upi/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const transactions = await UPITransaction.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(50);

    // ✅ FIX: Always return array
    res.json({ 
      success: true, 
      data: Array.isArray(transactions) ? transactions : [] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message,
      data: [] // ✅ Return empty array on error
    });
  }
};

// @desc    Set UPI PIN
// @route   PUT /api/upi/:id/pin
// @access  Private
const setPin = async (req, res) => {
  try {
    const { oldPin, newPin } = req.body;

    const upi = await UPI.findById(req.params.id);
    
    if (!upi) {
      return res.status(404).json({ success: false, message: 'UPI not found' });
    }

    if (upi.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Verify old PIN
    const isPinValid = await bcrypt.compare(oldPin, upi.pin);
    if (!isPinValid) {
      return res.status(400).json({ success: false, message: 'Current PIN is incorrect' });
    }

    // Hash new PIN
    const salt = await bcrypt.genSalt(10);
    upi.pin = await bcrypt.hash(newPin, salt);
    await upi.save();

    res.json({ success: true, message: 'UPI PIN changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block/Unblock UPI
// @route   PUT /api/upi/:id/status
// @access  Private
const updateStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const upi = await UPI.findById(req.params.id);
    
    if (!upi) {
      return res.status(404).json({ success: false, message: 'UPI not found' });
    }

    if (upi.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    upi.isActive = isActive;
    await upi.save();

    res.json({ 
      success: true, 
      message: isActive ? 'UPI activated' : 'UPI deactivated',
      data: { isActive: upi.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createUPI,
  getUPIs,
  sendMoney,
  verifyUPI,
  getTransactions,
  setPin,
  updateStatus
};