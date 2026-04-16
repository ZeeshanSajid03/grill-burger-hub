const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../config/cloudinary');

// Public — get all available menu items
router.get('/', async (req, res) => {
    try {
        const items = await MenuItem.find({ available: true });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Protected — add menu item with image
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        let imageUrl = '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }
        const item = new MenuItem({
            ...req.body,
            price: Number(req.body.price),
            image: imageUrl,
            addons: req.body.addons ? JSON.parse(req.body.addons) : []
        });
        const saved = await item.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Protected — update menu item
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const updates = {
            ...req.body,
            price: Number(req.body.price),
            addons: req.body.addons ? JSON.parse(req.body.addons) : []
        };
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            updates.image = result.secure_url;
        }
        const updated = await MenuItem.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Protected — delete menu item
router.delete('/:id', auth, async (req, res) => {
    try {
        await MenuItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Protected — toggle availability
router.patch('/:id/availability', auth, async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        item.available = !item.available;
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle sold out
router.patch('/:id/soldout', auth, async (req, res) => {
  try {
    const item    = await MenuItem.findById(req.params.id)
    item.soldOut  = !item.soldOut
    await item.save()
    res.json(item)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

module.exports = router;