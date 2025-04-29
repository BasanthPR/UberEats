// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { User, Customer, Restaurant } = require('../models/User');
const Order = require('../models/Order');
const Dish = require('../models/Dish');
const orderController = require('../controllers/orderController');
const { sendMessage, TOPICS } = require('../config/kafka');

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

// Place an order (customer) - modified to use controller
router.post('/', customerAuth, async (req, res) => {
  try {
    const { restaurant_id, items, delivery_address, payment_method, order_notes } = req.body; 
    // items = array of { dish_id, quantity, price }

    // Find the customer
    const customer = await Customer.findOne({ user: req.session.user.id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get restaurant details for delivery fee and time
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    // Validate and prepare items
    for (const item of items) {
      const dish = await Dish.findById(item.dish_id);
      if (!dish) {
        return res.status(404).json({ error: `Dish with ID ${item.dish_id} not found` });
      }

      orderItems.push({
        dish_id: dish._id,
        name: dish.name,
        quantity: item.quantity,
        price: dish.price
      });

      totalAmount += dish.price * item.quantity;
    }

    // Add delivery fee
    totalAmount += restaurant.delivery_fee || 0;

    // Create new order
    const newOrder = new Order({
      customer_id: customer._id,
      restaurant_id: restaurant._id,
      items: orderItems,
      status: 'placed',
      total_amount: totalAmount,
      delivery_fee: restaurant.delivery_fee || 0,
      delivery_address: delivery_address || customer.address,
      payment_method: payment_method || 'card',
      delivery_time_estimate: restaurant.delivery_time,
      order_notes: order_notes
    });

    await newOrder.save();

    // Clear customer cart
    await Customer.findByIdAndUpdate(customer._id, { $set: { cart: [] } });

    // Send Kafka messages for the new order
    await sendMessage(TOPICS.ORDER_CREATED, {
      order_id: newOrder._id,
      restaurant_id: newOrder.restaurant_id,
      customer_id: newOrder.customer_id,
      status: newOrder.status,
      timestamp: new Date().toISOString()
    });

    // Notify restaurant about new order
    await sendMessage(TOPICS.RESTAURANT_NOTIFICATION, {
      type: 'NEW_ORDER',
      order_id: newOrder._id,
      restaurant_id: newOrder.restaurant_id,
      timestamp: new Date().toISOString()
    });

    res.json({ message: 'Order placed', order_id: newOrder._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get orders for the logged-in customer
router.get('/my-orders', customerAuth, async (req, res) => {
  try {
    // Find the customer
    const customer = await Customer.findOne({ user: req.session.user.id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const orders = await Order.find({ customer_id: customer._id })
      .populate({
        path: 'restaurant_id',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      restaurant_name: order.restaurant_id.user.name
    }));

    res.json(formattedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restaurant sees orders (filter by status) with order name
router.get('/restaurant-orders', restaurantAuth, async (req, res) => {
  try {
    const { status } = req.query; // e.g. ?status=pending

    // Find the restaurant
    const restaurant = await Restaurant.findOne({ user: req.session.user.id });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Build the query - exclude archived orders
    let query = { 
      restaurant_id: restaurant._id,
      archived: { $ne: true } // Exclude orders that are archived
    };
    
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate({
        path: 'customer_id',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => {
      // Create order name from items
      const orderName = order.items.map(item => 
        `${item.name} (x${item.quantity})`
      ).join(', ');

      return {
        ...order.toObject(),
        customer_name: order.customer_id.user.name,
        order_name: orderName
      };
    });

    res.json(formattedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (restaurant) - modified to use Kafka
router.put('/:orderId/status', restaurantAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // e.g. "preparing", "on_the_way", "delivered", etc.

    // Find the restaurant
    const restaurant = await Restaurant.findOne({ user: req.session.user.id });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Find the order
    const order = await Order.findOne({ _id: orderId, restaurant_id: restaurant._id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found or not owned by this restaurant' });
    }

    // Store previous status
    const previousStatus = order.status;
    
    // Update status
    order.status = status;
    await order.save();

    // Send Kafka messages for status update
    await sendMessage(TOPICS.ORDER_UPDATED, {
      order_id: order._id,
      previous_status: previousStatus,
      new_status: status,
      restaurant_id: order.restaurant_id,
      customer_id: order.customer_id,
      timestamp: new Date().toISOString()
    });
    
    // Notify customer about order status update
    await sendMessage(TOPICS.CUSTOMER_NOTIFICATION, {
      type: 'ORDER_STATUS_UPDATE',
      order_id: order._id,
      status: status,
      customer_id: order.customer_id,
      timestamp: new Date().toISOString()
    });

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear completed orders for a restaurant
router.post('/clear-completed', restaurantAuth, async (req, res) => {
  try {
    // Find the restaurant
    const restaurant = await Restaurant.findOne({ user: req.session.user.id });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Find all completed orders (Delivered, Picked Up, or Cancelled)
    const completedOrders = await Order.find({
      restaurant_id: restaurant._id,
      status: { $in: ['Delivered', 'Picked Up', 'Cancelled'] }
    });

    if (completedOrders.length === 0) {
      return res.json({ message: 'No completed orders to archive' });
    }

    // Archive the orders instead of deleting them (optional - you can implement archiving later)
    // For now, we'll just mark them as archived
    const orderIds = completedOrders.map(order => order._id);
    
    // Soft-delete/archive the orders by adding an 'archived' field
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { archived: true } }
    );

    res.json({ 
      message: `Successfully archived ${completedOrders.length} completed orders`,
      count: completedOrders.length
    });
  } catch (err) {
    console.error('Error clearing completed orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get order details (customer or restaurant can see)
router.get('/:orderId/details', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the order
    const order = await Order.findById(orderId)
      .populate('restaurant_id')
      .populate('customer_id');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if the user is authorized to see this order
    const isCustomer = req.session.user.role === 'customer';
    const isRestaurant = req.session.user.role === 'restaurant';

    if (isCustomer) {
      const customer = await Customer.findOne({ user: req.session.user.id });
      if (!customer || customer._id.toString() !== order.customer_id._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to view this order' });
      }
    } else if (isRestaurant) {
      const restaurant = await Restaurant.findOne({ user: req.session.user.id });
      if (!restaurant || restaurant._id.toString() !== order.restaurant_id._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to view this order' });
      }
    } else {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the order with populated references
    const order = await Order.findById(orderId)
      .populate('restaurant_id')
      .populate('customer_id');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if the user is authorized to see this order
    const isCustomer = req.session.user.role === 'customer';
    const isRestaurant = req.session.user.role === 'restaurant';

    if (isCustomer) {
      const customer = await Customer.findOne({ user: req.session.user.id });
      if (!customer || customer._id.toString() !== order.customer_id._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to view this order' });
      }
    } else if (isRestaurant) {
      const restaurant = await Restaurant.findOne({ user: req.session.user.id });
      if (!restaurant || restaurant._id.toString() !== order.restaurant_id._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to view this order' });
      }
    } else {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
