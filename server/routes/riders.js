const express = require('express');
const router  = express.Router();
const Rider   = require('../models/Rider');
const auth    = require('../middleware/auth');

// Public — get all available riders
router.get('/', async (req, res) => {
  try {
    const riders = await Rider.find().sort({ createdAt: -1 });
    res.json(riders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected — add rider
router.post('/', auth, async (req, res) => {
  try {
    const rider = await Rider.create(req.body);
    res.status(201).json(rider);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Protected — delete rider
router.delete('/:id', auth, async (req, res) => {
  try {
    await Rider.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rider deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected — toggle availability
router.patch('/:id/availability', auth, async (req, res) => {
  try {
    const rider    = await Rider.findById(req.params.id);
    rider.available = !rider.available;
    await rider.save();
    res.json(rider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;