const mongoose = require('mongoose');

const upiTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UPI',
    required: true
  },
  type: {
    type: String,
    enum: ['Send', 'Receive', 'Request'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  senderUpiId: {
    type: String,
    required: true
  },
  receiverUpiId: {
    type: String,
    required: true
  },
  receiverName: {
    type: String
  },
  remarks: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed', 'Expired'],
    default: 'Pending'
  },
  transactionId: {
    type: String,
    unique: true
  },
  rrn: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

upiTransactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'UPI' + Date.now() + Math.floor(Math.random() * 10000);
  }
  if (!this.rrn) {
    this.rrn = Math.floor(Math.random() * 900000000000) + 100000000000;
  }
  next();
});

module.exports = mongoose.model('UPITransaction', upiTransactionSchema);