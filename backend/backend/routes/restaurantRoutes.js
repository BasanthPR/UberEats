// routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check if the user is logged in as a restaurant
function restaurantAuth(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'restaurant') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Get restaurant profile
router.get('/restaurant-orders', restaurantAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM restaurants WHERE restaurant_id=?`,
      [req.session.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update restaurant profile
router.put('/restaurant-orders', restaurantAuth, async (req, res) => {
  try {
    const { name, location, description, contact_info, image_url, timings } = req.body;
    await db.execute(
      `UPDATE restaurants SET name=?, location=?, description=?, contact_info=?, image_url=?, timings=? WHERE restaurant_id=?`,
      [name, location, description, contact_info, image_url, timings, req.session.user.id]
    );
    res.json({ message: 'Restaurant profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
