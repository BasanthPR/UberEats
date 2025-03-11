// routes/dishRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

function restaurantAuth(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'restaurant') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Add a dish
router.post('/', restaurantAuth, async (req, res) => {
  try {
    const { dish_name, ingredients, image_url, price, description, category } = req.body;
    await db.execute(
      `INSERT INTO dishes (dish_name, ingredients, image_url, price, description, category)
       VALUES (?,?,?,?,?,?)`,
      [req.session.user.id, dish_name, ingredients, image_url, price, description, category]
    );
    res.json({ message: 'Dish added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit dish
router.put('/:dish_id', restaurantAuth, async (req, res) => {
  try {
    const { dish_id } = req.params;
    const { dish_name, ingredients, image_url, price, description, category } = req.body;
    await db.execute(
      `UPDATE dishes
       SET dish_name=?, ingredients=?, image_url=?, price=?, description=?, category=?
       WHERE dish_id=? AND restaurant_id=?`,
      [dish_name, ingredients, image_url, price, description, category, dish_id, req.session.user.id]
    );
    res.json({ message: 'Dish updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all dishes by this restaurant
router.get('/my-dishes', restaurantAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM dishes WHERE restaurant_id=?`,
      [req.session.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public route to view a restaurant's dishes
router.get('/restaurant/:restaurant_id', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const [rows] = await db.execute(
      `SELECT * FROM dishes WHERE restaurant_id=?`,
      [restaurant_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
