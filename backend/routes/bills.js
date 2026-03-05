const express = require('express');
const router = express.Router();
const {
  getProviders,
  getProvidersByCategory,
  fetchBill,
  payBill,
  getBillHistory,
  getSavedBillers,
  deleteSavedBiller
} = require('../controllers/billController');
const { protect } = require('../middleware/auth');

router.get('/providers', protect, getProviders);
router.get('/providers/:category', protect, getProvidersByCategory);
router.post('/fetch', protect, fetchBill);
router.post('/pay', protect, payBill);
router.get('/history', protect, getBillHistory);
router.get('/saved', protect, getSavedBillers);
router.delete('/saved/:id', protect, deleteSavedBiller);

module.exports = router;