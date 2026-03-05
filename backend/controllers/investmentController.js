const Investment = require('../models/Investment');

// @desc    Get all user investments
// @route   GET /api/investments
// @access  Private
const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id });
    
    // ✅ FIX: Always return array format
    res.json({ 
      success: true, 
      data: Array.isArray(investments) ? investments : [] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message,
      data: [] // ✅ Return empty array on error
    });
  }
};

// @desc    Create investment
// @route   POST /api/investments
// @access  Private
const createInvestment = async (req, res) => {
  try {
    const { investmentType, name, amount, maturityDate } = req.body;

    const investment = await Investment.create({
      user: req.user._id,
      investmentType,
      name,
      amount,
      currentValue: amount,
      maturityDate
    });

    res.status(201).json({ success: true, data: investment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update investment value
// @route   PUT /api/investments/:id
// @access  Private
const updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    if (investment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    investment.currentValue = req.body.currentValue;
    investment.returns = investment.currentValue - investment.amount;
    investment.returnPercentage = ((investment.returns / investment.amount) * 100).toFixed(2);

    await investment.save();

    res.json({ success: true, data: investment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInvestments,
  createInvestment,
  updateInvestment
};