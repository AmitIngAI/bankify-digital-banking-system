const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investmentType: {
    type: String,
    enum: ['Mutual Fund', 'Stocks', 'Fixed Deposit', 'Bonds', 'Gold'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    required: true
  },
  returns: {
    type: Number,
    default: 0
  },
  returnPercentage: {
    type: Number,
    default: 0
  },
  investmentDate: {
    type: Date,
    default: Date.now
  },
  maturityDate: Date,
  status: {
    type: String,
    enum: ['Active', 'Matured', 'Redeemed'],
    default: 'Active'
  }
});

module.exports = mongoose.model('Investment', investmentSchema);