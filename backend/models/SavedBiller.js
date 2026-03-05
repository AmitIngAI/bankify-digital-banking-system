const mongoose = require('mongoose');

const savedBillerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  billType: {
    type: String,
    enum: ['Mobile Recharge', 'DTH', 'Electricity', 'Gas', 'Water', 'Broadband', 'Landline', 'Insurance', 'Credit Card', 'Fastag'],
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  consumerId: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    default: ''
  },
  consumerName: {
    type: String,
    default: ''
  },
  isAutoPay: {
    type: Boolean,
    default: false
  },
  autoPayAmount: {
    type: Number,
    default: 0
  },
  autoPayDate: {
    type: Number, // Day of month
    default: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SavedBiller', savedBillerSchema);