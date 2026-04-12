const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema({
  city:        { type: String, required: true },
  area:        { type: String, required: true },
  deliveryFee: { type: Number, required: true, min: 0 },
  available:   { type: Boolean, default: true }
});

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);