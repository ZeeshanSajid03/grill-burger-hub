const express      = require('express');
const router       = express.Router();
const DiscountCode = require('../models/DiscountCode');
const auth         = require('../middleware/auth');

// Public — validate a code
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body
    const discount = await DiscountCode.findOne({
      code: code.toUpperCase(),
      active: true
    })

    if (!discount) return res.status(404).json({ message: 'Invalid discount code' })
    if (discount.expiresAt && new Date() > discount.expiresAt)
      return res.status(400).json({ message: 'This code has expired' })
    if (discount.maxUses && discount.usedCount >= discount.maxUses)
      return res.status(400).json({ message: 'This code has reached its usage limit' })
    if (orderTotal < discount.minOrder)
      return res.status(400).json({ message: `Minimum order of Rs. ${discount.minOrder} required` })

    const discountAmount = discount.type === 'percentage'
      ? Math.round(orderTotal * discount.value / 100)
      : discount.value

    res.json({
      valid:          true,
      code:           discount.code,
      type:           discount.type,
      value:          discount.value,
      discountAmount: Math.min(discountAmount, orderTotal),
      message:        discount.type === 'percentage'
        ? `${discount.value}% off applied`
        : `Rs. ${discount.value} off applied`
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

// Protected — get all codes
router.get('/', auth, async (req, res) => {
  try {
    const codes = await DiscountCode.find().sort({ createdAt: -1 })
    res.json(codes)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

// Protected — create code
router.post('/', auth, async (req, res) => {
  try {
    const code = await DiscountCode.create({
      ...req.body,
      code: req.body.code.toUpperCase()
    })
    res.status(201).json(code)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
});

// Protected — toggle active
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const code  = await DiscountCode.findById(req.params.id)
    code.active = !code.active
    await code.save()
    res.json(code)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

// Protected — delete code
router.delete('/:id', auth, async (req, res) => {
  try {
    await DiscountCode.findByIdAndDelete(req.params.id)
    res.json({ message: 'Code deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

// Internal — increment usage (called when order is placed)
router.patch('/use/:code', async (req, res) => {
  try {
    await DiscountCode.findOneAndUpdate(
      { code: req.params.code.toUpperCase() },
      { $inc: { usedCount: 1 } }
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

module.exports = router;