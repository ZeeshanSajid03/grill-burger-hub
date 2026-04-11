const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  price:       { type: Number, required: true },
  category: {
    type: String,
    enum: ['Burger', 'Fries', 'Drink', 'Deal'],
    required: true
  },
  image:     { type: String },
  available: { type: Boolean, default: true },
  addons: [
    {
      name:  { type: String, required: true },
      price: { type: Number, required: true }
    }
  ]
});

module.exports = mongoose.model('MenuItem', menuItemSchema);