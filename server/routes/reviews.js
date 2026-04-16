const express = require('express');
const router  = express.Router();
const Review  = require('../models/Review');
const jwt     = require('jsonwebtoken');

// Get reviews for a menu item
router.get('/item/:menuItemId', async (req, res) => {
  try {
    const reviews = await Review.find({ menuItem: req.params.menuItemId })
      .sort({ createdAt: -1 })
      .limit(20)
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

// Get average rating for all items
router.get('/averages', async (req, res) => {
  try {
    const averages = await Review.aggregate([
      { $group: {
        _id: '$menuItem',
        avgRating: { $avg: '$rating' },
        count:     { $sum: 1 }
      }}
    ])
    res.json(averages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

// Submit a review
router.post('/', async (req, res) => {
  try {
    const { menuItem, customerName, rating, comment, orderId } = req.body

    let customerId = null
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (decoded.role === 'customer') customerId = decoded.id
      } catch {}
    }

    const review = await Review.create({
      menuItem,
      customer: customerId,
      customerName,
      rating,
      comment,
      orderId
    })
    res.status(201).json(review)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
});

module.exports = router;