const express = require('express');
const router = express.Router();
const {
  calculateRD,
  createRD,
  getRDs,
  payInstallment
} = require('../controllers/rdController');
const { protect } = require('../middleware/auth');

router.post('/calculate', protect, calculateRD);
router.route('/')
  .get(protect, getRDs)
  .post(protect, createRD);
router.post('/:id/pay', protect, payInstallment);

module.exports = router;