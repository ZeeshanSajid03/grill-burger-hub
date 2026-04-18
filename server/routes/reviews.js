const express = require('express');
const router  = express.Router();
const Review  = require('../models/Review');
const jwt     = require('jsonwebtoken');
const auth    = require('../middleware/auth');

// Get review for a specific order
router.get('/order/:orderId', async (req, res) => {
  try {
    const review = await Review.findOne({ order: req.params.orderId })
    res.json(review || null)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

// Get all reviews (admin)
router.get('/all', auth, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('order', 'orderNumber customerName total')
      .sort({ createdAt: -1 })
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

// Submit a review for an order
router.post('/', async (req, res) => {
  try {
    const { orderId, customerName, rating, comment } = req.body

    if (!orderId || !rating) {
      return res.status(400).json({ message: 'orderId and rating are required' })
    }

    // Check if already reviewed
    const existing = await Review.findOne({ order: orderId })
    if (existing) {
      return res.status(400).json({ message: 'This order has already been reviewed' })
    }

    let customerId = null
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (decoded.role === 'customer') customerId = decoded.id
      } catch {}
    }

    const review = await Review.create({
      order:        orderId,
      customer:     customerId,
      customerName: customerName || 'Guest',
      rating:       Number(rating),
      comment:      comment || ''
    })
    res.status(201).json(review)
  } catch (err) {
    console.error('Review save error:', err.message)
    res.status(400).json({ message: err.message })
  }
});

// Delete a review (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id)
    res.json({ message: 'Review deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

module.exports = router;