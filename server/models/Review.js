const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order:        { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  customerName: { type: String, required: true },
  rating:       { type: Number, required: true, min: 1, max: 5 },
  comment:      { type: String, default: '' },
  createdAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);