const express = require('express');
const router = express.Router();
const { 
  getBeneficiaries,
  getRecentBeneficiaries,
  addBeneficiary,
  deleteBeneficiary,
  updateLastUsed
} = require('../controllers/beneficiaryController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getBeneficiaries)
  .post(protect, addBeneficiary);

router.get('/recent', protect, getRecentBeneficiaries);
router.delete('/:id', protect, deleteBeneficiary);
router.put('/:id/use', protect, updateLastUsed);

module.exports = router;