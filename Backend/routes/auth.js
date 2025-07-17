const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Missing fields');

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Invalid credentials');

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// POST /auth/add-user (temporary admin user)
router.post('/add-user', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('admin', 10);
    const existing = await User.findOne({ username: 'admin' });
    if (existing) return res.status(400).send('Admin user already exists');

    const user = new User({ username: 'admin', password: hashedPassword });
    await user.save();
    res.send('Admin user added');
  } catch (err) {
    res.status(500).send('Error adding user');
  }
});

module.exports = router;
