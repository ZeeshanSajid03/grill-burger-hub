const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

// Public — get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.find();
    const result = {}
    settings.forEach(s => result[s.key] = s.value)
    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

// Protected — upsert a setting
router.post('/', auth, async (req, res) => {
  try {
    const { key, value } = req.body
    const setting = await Settings.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    )
    res.json(setting)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
});

module.exports = router;