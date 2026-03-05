const Loan = require('../models/Loan');

// Calculate EMI
const calculateEMI = (principal, rate, tenure) => {
  const monthlyRate = rate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
              (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi);
};

// @desc    Get all user loans
// @route   GET /api/loans
// @access  Private
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user._id });
    res.json({ success: true, data: loans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply for loan
// @route   POST /api/loans
// @access  Private
const applyLoan = async (req, res) => {
  try {
    const { loanType, amount, interestRate, tenure } = req.body;

    const emi = calculateEMI(amount, interestRate, tenure);

    const loan = await Loan.create({
      user: req.user._id,
      loanType,
      amount,
      interestRate,
      tenure,
      emi,
      outstanding: amount,
      status: 'Pending'
    });

    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update loan status (Admin)
// @route   PUT /api/loans/:id/status
// @access  Private
const updateLoanStatus = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    loan.status = req.body.status;
    if (req.body.status === 'Approved') {
      loan.approvalDate = Date.now();
      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + 1);
      loan.nextDueDate = nextDue;
    }

    await loan.save();

    res.json({ success: true, data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLoans,
  applyLoan,
  updateLoanStatus
};