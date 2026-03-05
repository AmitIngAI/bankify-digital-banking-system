const Beneficiary = require('../models/Beneficiary');

// @desc    Get all beneficiaries
// @route   GET /api/beneficiaries
// @access  Private
const getBeneficiaries = async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({ user: req.user._id })
      .sort({ lastUsed: -1, addedOn: -1 });

    res.json({ success: true, data: beneficiaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent beneficiaries
// @route   GET /api/beneficiaries/recent
// @access  Private
const getRecentBeneficiaries = async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({ user: req.user._id })
      .sort({ lastUsed: -1 })
      .limit(5);

    res.json({ success: true, data: beneficiaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add beneficiary
// @route   POST /api/beneficiaries
// @access  Private
const addBeneficiary = async (req, res) => {
  try {
    const { beneficiaryName, accountNumber, ifscCode, bankName, nickname } = req.body;

    // Check if beneficiary already exists
    const existingBeneficiary = await Beneficiary.findOne({
      user: req.user._id,
      accountNumber
    });

    if (existingBeneficiary) {
      return res.status(400).json({ 
        success: false, 
        message: 'Beneficiary already exists' 
      });
    }

    const beneficiary = await Beneficiary.create({
      user: req.user._id,
      beneficiaryName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      bankName: bankName || '',
      nickname: nickname || beneficiaryName
    });

    res.status(201).json({ success: true, data: beneficiary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete beneficiary
// @route   DELETE /api/beneficiaries/:id
// @access  Private
const deleteBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);

    if (!beneficiary) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found' });
    }

    if (beneficiary.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await beneficiary.deleteOne();

    res.json({ success: true, message: 'Beneficiary deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update last used
// @route   PUT /api/beneficiaries/:id/use
// @access  Private
const updateLastUsed = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);

    if (!beneficiary) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found' });
    }

    beneficiary.lastUsed = Date.now();
    await beneficiary.save();

    res.json({ success: true, data: beneficiary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBeneficiaries,
  getRecentBeneficiaries,
  addBeneficiary,
  deleteBeneficiary,
  updateLastUsed
};