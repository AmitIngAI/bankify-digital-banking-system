const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createBudget,
  deleteBudget,
  getAnalytics
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getBudgets)
  .post(protect, createBudget);

router.get('/analytics', protect, getAnalytics);
router.delete('/:id', protect, deleteBudget);

module.exports = router;