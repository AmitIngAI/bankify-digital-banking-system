const express = require('express');
const router = express.Router();
const {
  getCards,
  getCard,
  createCard,
  updateCardStatus,
  updateLimits,
  updateSettings,
  setPin
} = require('../controllers/cardController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getCards)
  .post(protect, createCard);

router.get('/:id', protect, getCard);
router.put('/:id/status', protect, updateCardStatus);
router.put('/:id/limits', protect, updateLimits);
router.put('/:id/settings', protect, updateSettings);
router.put('/:id/pin', protect, setPin);

module.exports = router;