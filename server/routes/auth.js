const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Single hardcoded restaurant admin account
// Password is hashed — this is "grill2024" bcrypt hashed
const ADMIN = {
  username: 'admin',
  passwordHash: '$2b$10$SIMORH2n/li4JC80mdSj1uez4PAh0pEKGHvtE.0BwNoGxMywGeWd6'
};
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN.username) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, ADMIN.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({ token });
});

module.exports = router;