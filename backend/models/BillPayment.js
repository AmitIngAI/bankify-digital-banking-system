const mongoose = require('mongoose');

const billPaymentSchema = new mongoose.Schema({
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
  consumerName: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true
  },
  convenienceFee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending'
  },
  transactionId: {
    type: String,
    unique: true
  },
  billNumber: {
    type: String
  },
  dueDate: {
    type: Date
  },
  paidAt: {
    type: Date,
    default: Date.now
  }
});

billPaymentSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'BILL' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('BillPayment', billPaymentSchema);