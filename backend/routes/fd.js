const express = require('express');
const router = express.Router();
const {
  getRates,
  calculateFD,
  createFD,
  getFDs,
  getFD,
  withdrawFD
} = require('../controllers/fdController');
const { protect } = require('../middleware/auth');

router.get('/rates', protect, getRates);
router.post('/calculate', protect, calculateFD);
router.route('/')
  .get(protect, getFDs)
  .post(protect, createFD);
router.get('/:id', protect, getFD);
router.post('/:id/withdraw', protect, withdrawFD);

module.exports = router;