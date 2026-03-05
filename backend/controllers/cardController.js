const Card = require('../models/Card');
const Notification = require('../models/Notification');

// Generate random card number
const generateCardNumber = (network) => {
  const prefixes = {
    'Visa': '4',
    'Mastercard': '5',
    'RuPay': '6',
    'Amex': '3'
  };
  const prefix = prefixes[network] || '4';
  return prefix + Math.floor(Math.random() * 10000000000000000).toString().padStart(15, '0').slice(0, 15);
};

// @desc    Get all user cards
// @route   GET /api/cards
// @access  Private
const getCards = async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user._id })
      .populate('account', 'accountNumber accountType balance')
      .select('-cvv -pin');

    // ✅ FIX: Always return array format
    res.json({ 
      success: true, 
      data: Array.isArray(cards) ? cards : [] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message,
      data: [] // ✅ Return empty array on error
    });
  }
};

// @desc    Get card by ID
// @route   GET /api/cards/:id
// @access  Private
const getCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id)
      .populate('account', 'accountNumber accountType balance')
      .select('-cvv -pin');

    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new card
// @route   POST /api/cards
// @access  Private
const createCard = async (req, res) => {
  try {
    const { accountId, cardType, cardNetwork, creditLimit } = req.body;

    const cardNumber = generateCardNumber(cardNetwork);
    const cvv = Math.floor(Math.random() * 900 + 100).toString();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    const expiryString = `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear().toString().slice(-2)}`;

    const card = await Card.create({
      user: req.user._id,
      account: accountId,
      cardNumber,
      cardType,
      cardNetwork: cardNetwork || 'Visa',
      cardHolderName: req.user.fullName,
      expiryDate: expiryString,
      cvv,
      creditLimit: cardType === 'Credit' ? creditLimit : 0,
      availableCredit: cardType === 'Credit' ? creditLimit : 0
    });

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: 'New Card Created',
      message: `Your new ${cardType} card ending ****${cardNumber.slice(-4)} is ready`,
      type: 'General',
      icon: '💳'
    });

    res.status(201).json({ 
      success: true, 
      data: {
        ...card.toObject(),
        cvv: undefined,
        pin: undefined
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block/Unblock card
// @route   PUT /api/cards/:id/status
// @access  Private
const updateCardStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    card.status = status;
    if (status === 'Blocked') {
      card.blockedReason = reason || 'Blocked by user';
      card.blockedAt = Date.now();
    } else {
      card.blockedReason = '';
      card.blockedAt = null;
    }

    await card.save();

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: status === 'Blocked' ? 'Card Blocked' : 'Card Unblocked',
      message: `Your card ****${card.cardNumber.slice(-4)} has been ${status.toLowerCase()}`,
      type: 'Security',
      icon: status === 'Blocked' ? '🔒' : '🔓'
    });

    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update card limits
// @route   PUT /api/cards/:id/limits
// @access  Private
const updateLimits = async (req, res) => {
  try {
    const { limits } = req.body;

    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    card.limits = { ...card.limits, ...limits };
    await card.save();

    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update card settings (toggles)
// @route   PUT /api/cards/:id/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    card.settings = { ...card.settings, ...settings };
    await card.save();

    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set card PIN
// @route   PUT /api/cards/:id/pin
// @access  Private
const setPin = async (req, res) => {
  try {
    const { pin } = req.body;

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ success: false, message: 'PIN must be 4 digits' });
    }

    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    card.pin = pin;
    await card.save();

    res.json({ success: true, message: 'PIN set successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCards,
  getCard,
  createCard,
  updateCardStatus,
  updateLimits,
  updateSettings,
  setPin
};