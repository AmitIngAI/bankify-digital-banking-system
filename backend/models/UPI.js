const mongoose = require('mongoose');

const upiSchema = new mongoose.Schema({
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
  upiId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  pin: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  dailyLimit: {
    type: Number,
    default: 100000
  },
  perTransactionLimit: {
    type: Number,
    default: 100000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UPI', upiSchema);