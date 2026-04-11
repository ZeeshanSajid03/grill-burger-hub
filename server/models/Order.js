const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  customerName:    { type: String, required: true },
  customerPhone:   { type: String },
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
      name:     { type: String },
      price:    { type: Number },
      quantity: { type: Number, default: 1 }
    }
  ],
  total:    { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Ready', 'Out for Delivery', 'Completed'],
    default: 'Pending'
  },
  orderType: {
    type: String,
    enum: ['Takeaway', 'Dine-in', 'Delivery'],
    default: 'Takeaway'
  },
  deliveryAddress: { type: String },
  createdAt:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);