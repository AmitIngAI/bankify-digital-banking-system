const express = require('express');
const router = express.Router();
const { 
  getTransactions, 
  getTransactionsByAccount, 
  createTransaction,
  createTransfer
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getTransactions)
  .post(protect, createTransaction);

router.post('/transfer', protect, createTransfer);
router.get('/account/:accountId', protect, getTransactionsByAccount);

module.exports = router;