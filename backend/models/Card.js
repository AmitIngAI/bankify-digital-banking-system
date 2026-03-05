const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true
  },
  cardType: {
    type: String,
    enum: ['Debit', 'Credit'],
    required: true
  },
  cardNetwork: {
    type: String,
    enum: ['Visa', 'Mastercard', 'RuPay', 'Amex'],
    default: 'Visa'
  },
  cardHolderName: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  cvv: {
    type: String,
    required: true
  },
  pin: {
    type: String,
    default: ''
  },
  // Credit Card specific
  creditLimit: {
    type: Number,
    default: 0
  },
  availableCredit: {
    type: Number,
    default: 0
  },
  outstandingAmount: {
    type: Number,
    default: 0
  },
  minimumDue: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date
  },
  // Limits
  limits: {
    atm: {
      daily: { type: Number, default: 50000 },
      perTransaction: { type: Number, default: 25000 }
    },
    pos: {
      daily: { type: Number, default: 100000 },
      perTransaction: { type: Number, default: 50000 }
    },
    online: {
      daily: { type: Number, default: 100000 },
      perTransaction: { type: Number, default: 50000 }
    },
    international: {
      daily: { type: Number, default: 50000 },
      perTransaction: { type: Number, default: 25000 }
    }
  },
  // Toggles
  settings: {
    atmEnabled: { type: Boolean, default: true },
    posEnabled: { type: Boolean, default: true },
    onlineEnabled: { type: Boolean, default: true },
    internationalEnabled: { type: Boolean, default: false },
    contactlessEnabled: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ['Active', 'Blocked', 'Expired', 'Locked'],
    default: 'Active'
  },
  blockedReason: {
    type: String,
    default: ''
  },
  blockedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Card', cardSchema);