const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  beneficiaryName: {
    type: String,
    required: true,
    trim: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  ifscCode: {
    type: String,
    required: true,
    uppercase: true
  },
  bankName: {
    type: String,
    default: ''
  },
  nickname: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  addedOn: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date
  }
});

// Create index for faster queries
beneficiarySchema.index({ user: 1, accountNumber: 1 });

module.exports = mongoose.model('Beneficiary', beneficiarySchema);