const express = require('express');
const router = express.Router();
const { getLoans, applyLoan, updateLoanStatus } = require('../controllers/loanController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getLoans)
  .post(protect, applyLoan);

router.put('/:id/status', protect, updateLoanStatus);

module.exports = router;