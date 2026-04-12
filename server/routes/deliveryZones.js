const express = require('express');
const router  = express.Router();
const DeliveryZone = require('../models/DeliveryZone');
const auth = require('../middleware/auth');

// Public — get all available zones
router.get('/', async (req, res) => {
  try {
    const zones = await DeliveryZone.find({ available: true }).sort({ city: 1, area: 1 });
    res.json(zones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected — add a zone
router.post('/', auth, async (req, res) => {
  try {
    const zone = await DeliveryZone.create(req.body);
    res.status(201).json(zone);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Protected — update a zone
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await DeliveryZone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Protected — delete a zone
router.delete('/:id', auth, async (req, res) => {
  try {
    await DeliveryZone.findByIdAndDelete(req.params.id);
    res.json({ message: 'Zone deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected — toggle availability
router.patch('/:id/availability', auth, async (req, res) => {
  try {
    const zone = await DeliveryZone.findById(req.params.id);
    zone.available = !zone.available;
    await zone.save();
    res.json(zone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;