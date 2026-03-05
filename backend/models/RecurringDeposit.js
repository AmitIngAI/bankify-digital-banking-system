const mongoose = require('mongoose');

const recurringDepositSchema = new mongoose.Schema({
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
  rdNumber: {
    type: String,
    unique: true
  },
  monthlyAmount: {
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
  totalDeposited: {
    type: Number,
    default: 0
  },
  maturityAmount: {
    type: Number,
    required: true
  },
  installmentsPaid: {
    type: Number,
    default: 0
  },
  nextInstallmentDate: {
    type: Date
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  maturityDate: {
    type: Date,
    required: true
  },
  autoDebit: {
    type: Boolean,
    default: true
  },
  nominee: {
    name: String,
    relationship: String
  },
  status: {
    type: String,
    enum: ['Active', 'Matured', 'Closed', 'Defaulted'],
    default: 'Active'
  }
});

recurringDepositSchema.pre('save', function(next) {
  if (!this.rdNumber) {
    this.rdNumber = 'RD' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('RecurringDeposit', recurringDepositSchema);