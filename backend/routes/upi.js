const express = require('express');
const router = express.Router();
const {
  createUPI,
  getUPIs,
  sendMoney,
  verifyUPI,
  getTransactions,
  setPin,
  updateStatus
} = require('../controllers/upiController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getUPIs)
  .post(protect, createUPI);

router.post('/send', protect, sendMoney);
router.post('/verify', protect, verifyUPI);
router.get('/transactions', protect, getTransactions);
router.put('/:id/pin', protect, setPin);
router.put('/:id/status', protect, updateStatus);

module.exports = router;