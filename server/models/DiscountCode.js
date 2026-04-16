const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true },
  type:        { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  value:       { type: Number, required: true },
  minOrder:    { type: Number, default: 0 },
  maxUses:     { type: Number, default: null },
  usedCount:   { type: Number, default: 0 },
  active:      { type: Boolean, default: true },
  expiresAt:   { type: Date, default: null },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('DiscountCode', discountCodeSchema);