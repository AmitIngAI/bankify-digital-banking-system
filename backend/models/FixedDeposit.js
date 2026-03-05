const mongoose = require('mongoose');

const fixedDepositSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  fdNumber: {
    type: String,
    unique: true
  },
  principalAmount: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  tenure: {
    type: Number, // in months
    required: true
  },
  maturityAmount: {
    type: Number,
    required: true
  },
  interestEarned: {
    type: Number,
    default: 0
  },
  interestPayout: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'At Maturity'],
    default: 'At Maturity'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  maturityDate: {
    type: Date,
    required: true
  },
  nominee: {
    name: String,
    relationship: String
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Matured', 'Closed', 'Premature Withdrawal'],
    default: 'Active'
  }
});

fixedDepositSchema.pre('save', function(next) {
  if (!this.fdNumber) {
    this.fdNumber = 'FD' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('FixedDeposit', fixedDepositSchema);