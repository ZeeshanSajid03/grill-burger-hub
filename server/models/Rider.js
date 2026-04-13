const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  phone:     { type: String, required: true },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rider', riderSchema);