const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['Credit', 'Debit', 'Transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other', 'Salary', 'Transfer'],
    default: 'Other'
  },
  description: {
    type: String,
    default: ''
  },
  recipient: {
    name: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  transferType: {
    type: String,
    enum: ['IMPS', 'NEFT', 'RTGS', 'UPI'],
    default: 'IMPS'
  },
  transactionFee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Completed'
  },
  transactionId: {
    type: String,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Generate transaction ID before saving
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);