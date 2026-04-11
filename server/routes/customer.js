const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Order    = require('../models/Order');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password)
      return res.status(400).json({ message: 'All fields required' });

    const exists = await Customer.findOne({ phone });
    if (exists)
      return res.status(400).json({ message: 'Phone number already registered' });

    const hashed  = await bcrypt.hash(password, 10);
    const customer = await Customer.create({ name, phone, password: hashed });

    const token = jwt.sign(
      { id: customer._id, name: customer.name, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, name: customer.name, id: customer._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const customer = await Customer.findOne({ phone });
    if (!customer)
      return res.status(401).json({ message: 'Invalid phone or password' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid phone or password' });

    const token = jwt.sign(
      { id: customer._id, name: customer.name, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, name: customer.name, id: customer._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get order history for logged-in customer
router.get('/orders', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const orders  = await Order.find({ customer: decoded.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;