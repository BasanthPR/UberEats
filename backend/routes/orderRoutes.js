// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middlewares
function customerAuth(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'customer') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function restaurantAuth(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'restaurant') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Place an order (customer)
router.post('/', customerAuth, async (req, res) => {
  try {
    const { restaurant_id, items } = req.body; 
    // items = array of { dish_id, quantity, price }

    // 1) Insert a new row in orders
    const [orderResult] = await db.execute(
      `INSERT INTO orders (customer_id, restaurant_id) VALUES (?,?)`,
      [req.session.user.id, restaurant_id]
    );
    const order_id = orderResult.insertId;

    // 2) Insert each item in order_items
    // **IMPORTANT**: now we also insert restaurant_id to satisfy
    // the composite FK (restaurant_id, dish_id) => dishes(restaurant_id, dish_id)
    for (const item of items) {
      await db.execute(
        `INSERT INTO order_items (order_id, restaurant_id, dish_id, quantity, price_each)
         VALUES (?,?,?,?,?)`,
        [order_id, restaurant_id, item.dish_id, item.quantity, item.price]
      );
    }

    res.json({ message: 'Order placed', order_id });
  } catch (err) {
    console.error(err); // see the real MySQL error in your server logs
    res.status(500).json({ error: err.message });
  }
});

// Get orders for the logged-in customer
router.get('/my-orders', customerAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM orders WHERE customer_id=?`,
      [req.session.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restaurant sees orders (filter by status)
router.get('/restaurant-orders', restaurantAuth, async (req, res) => {
  try {
    const { status } = req.query; // e.g. ?status=New
    let query = `SELECT * FROM orders WHERE restaurant_id=?`;
    let params = [req.session.user.id];
    if (status) {
      query += ` AND order_status=?`;
      params.push(status);
    }
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (restaurant)
router.put('/:order_id/status', restaurantAuth, async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body; 
    await db.execute(
      `UPDATE orders SET order_status=? WHERE order_id=? AND restaurant_id=?`,
      [status, order_id, req.session.user.id]
    );
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// (Optional) get order details (customer or restaurant can see)
router.get('/:order_id/details', async (req, res) => {
  try {
    const { order_id } = req.params;
    // join order_items to get dish details
    const [items] = await db.execute(
      `SELECT oi.*, d.dish_name 
       FROM order_items oi
       JOIN dishes d ON oi.dish_id = d.dish_id
       WHERE order_id=?`,
      [order_id]
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
