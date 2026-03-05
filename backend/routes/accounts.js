const express = require('express');
const router = express.Router();
const { getAccounts, getAccount, createAccount } = require('../controllers/accountController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getAccounts)
  .post(protect, createAccount);

router.get('/:id', protect, getAccount);

module.exports = router;