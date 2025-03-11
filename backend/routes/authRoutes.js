// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// Customer signup
router.post('/customer-signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      `INSERT INTO customers (name, email, password) VALUES (?,?,?)`,
      [name, email, hashedPassword]
    );
    res.status(201).json({ message: 'Customer created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Restaurant signup
router.post('/restaurant-signup', async (req, res) => {
  try {
    // If you still want the option to include location, do:
    const { name, email, password, location } = req.body;

    // But if you’re removing it entirely from the form, do:
    // const { name, email, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);

    // If you want to store location if it’s provided, do:
    await db.execute(
      `INSERT INTO restaurants (name, email, password, location) VALUES (?,?,?,?)`,
      [name, email, hashedPassword, location || null]
    );

    // Or if you are dropping location entirely, do:
    // await db.execute(
    //   `INSERT INTO restaurants (name, email, password) VALUES (?,?,?)`,
    //   [name, email, hashedPassword]
    // );

    res.status(201).json({ message: 'Restaurant created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Customer login
router.post('/customer-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.execute(
      `SELECT * FROM customers WHERE email=?`,
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'No user found' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // set session
    req.session.user = {
      id: user.customer_id,
      email: user.email,
      role: 'customer'
    };
    res.json({ message: 'Customer login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Restaurant login
router.post('/restaurant-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.execute(
      `SELECT * FROM restaurants WHERE email=?`,
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'No user found' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // set session
    req.session.user = {
      id: user.restaurant_id,
      email: user.email,
      role: 'restaurant'
    };
    res.json({ message: 'Restaurant login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
