const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Place a new order
router.post('/', async (req, res) => {
  try {
    let customerId = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'customer') customerId = decoded.id;
      } catch { }
    }

    const count = await Order.countDocuments();
    const orderNumber = `GBH-${1000 + count + 1}`;

    const order = new Order({ ...req.body, customer: customerId, orderNumber });
    const saved = await order.save().catch(err => {
      console.error('Order save error:', err.message);
      throw err;
    });

    const io = req.app.get('io');
    io.emit('new_order', saved);

    // Use discount code if applied
    if (req.body.discountCode) {
      try {
        await require('../models/DiscountCode').findOneAndUpdate(
          { code: req.body.discountCode.toUpperCase() },
          { $inc: { usedCount: 1 } }
        )
      } catch {}
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all orders (dashboard)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Track by order number — public
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    const io = req.app.get('io');
    io.emit('order_updated', updated);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    const io = req.app.get('io');
    io.emit('order_deleted', req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign rider to order
router.patch('/:id/assign-rider', async (req, res) => {
  try {
    const { riderId, riderName, riderPhone } = req.body;
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Out for Delivery',
        rider: {
          id:    riderId,
          name:  riderName,
          phone: riderPhone
        }
      },
      { new: true }
    );
    const io = req.app.get('io');
    io.emit('order_updated', updated);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;