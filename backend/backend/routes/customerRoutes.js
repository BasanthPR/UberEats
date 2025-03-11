// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check if user is logged in as customer
function customerAuth(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'customer') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Get customer profile
router.get('/profile', customerAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM customers WHERE customer_id=?`,
      [req.session.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update customer profile
router.put('/profile', customerAuth, async (req, res) => {
  try {
    const { name, country, state, city, street, zip_code } = req.body;
    await db.execute(
      `UPDATE customers 
       SET name=?, country=?, state=?, city=?, street=?, zip_code=? 
       WHERE customer_id=?`,
      [name, country, state, city, street, zip_code, req.session.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Favorites
router.post('/favorites', customerAuth, async (req, res) => {
  try {
    const { restaurant_id } = req.body;
    await db.execute(
      `INSERT INTO favorites (customer_id, restaurant_id) VALUES (?,?)`,
      [req.session.user.id, restaurant_id]
    );
    res.json({ message: 'Restaurant added to favorites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/favorites', customerAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT r.* 
       FROM favorites f
       JOIN restaurants r ON f.restaurant_id = r.restaurant_id
       WHERE f.customer_id=?`,
      [req.session.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /customer/cart
router.get('/cart', customerAuth, async (req, res) => {
  try {
    // Fetch items from cart_items table for this customer
    const [rows] = await db.execute(
      `SELECT c.cart_item_id, c.quantity, c.price_each, c.restaurant_id, d.dish_id, d.dish_name
       FROM cart_items c
       JOIN dishes d ON c.dish_id = d.dish_id
       WHERE c.customer_id=?`,
      [req.session.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /customer/cart - to add an item
router.post('/cart', customerAuth, async (req, res) => {
  try {
    const { restaurant_id, dish_id, quantity, price_each } = req.body;
    await db.execute(
      `INSERT INTO cart_items (customer_id, restaurant_id, dish_id, quantity, price_each)
       VALUES (?,?,?,?,?)`,
      [req.session.user.id, restaurant_id, dish_id, quantity, price_each]
    );
    res.json({ message: 'Item added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// DELETE /customer/cart - to clear the cart
router.delete('/cart', customerAuth, async (req, res) => {
  try {
    await db.execute(
      `DELETE FROM cart_items WHERE customer_id=?`,
      [req.session.user.id]
    );
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});


module.exports = router;
