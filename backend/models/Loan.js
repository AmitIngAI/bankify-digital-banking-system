const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanType: {
    type: String,
    enum: ['Personal', 'Home', 'Car', 'Education', 'Business'],
    required: true
  },
  amount: {
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
  emi: {
    type: Number,
    required: true
  },
  outstanding: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Closed'],
    default: 'Pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: Date,
  nextDueDate: Date
});

module.exports = mongoose.model('Loan', loanSchema);