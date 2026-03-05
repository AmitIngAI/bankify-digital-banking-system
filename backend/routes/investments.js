const express = require('express');
const router = express.Router();
const { getInvestments, createInvestment, updateInvestment } = require('../controllers/investmentController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getInvestments)
  .post(protect, createInvestment);

router.put('/:id', protect, updateInvestment);

module.exports = router;